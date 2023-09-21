import { v4 as uuidv4 } from 'uuid';
import { createAttributionFromTags, getActiveBandIndex, getRandomColormap } from './helper';
import type { BandMetadata, RasterTileMetadata, DatasetFeature } from './types';
import type { Map, RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl';
import chroma from 'chroma-js';

export class RasterTileData {
	private feature: DatasetFeature;
	private metadata: RasterTileMetadata;
	private layerOpacity: number;

	constructor(feature: DatasetFeature, metadata?: RasterTileMetadata, layerOpacity?: number) {
		this.feature = feature;
		this.metadata = metadata;
		this.layerOpacity = layerOpacity;
	}

	public getMetadata = async () => {
		const metadataUrl = this.feature.properties?.links?.find((l) => l.rel === 'info').href;
		if (!metadataUrl) return this.metadata;
		const res = await fetch(metadataUrl);
		this.metadata = await res.json();
		if (this.metadata && this.metadata.band_metadata && this.metadata.band_metadata.length > 0) {
			const resStatistics = await fetch(
				this.feature.properties.links.find((l) => l.rel === 'statistics').href
			);
			const statistics = await resStatistics.json();
			if (statistics) {
				for (let i = 0; i < this.metadata.band_metadata.length; i++) {
					const bandValue = this.metadata.band_metadata[i][0] as string;
					const bandDetails = statistics[bandValue];
					if (bandDetails) {
						const meta = this.metadata.band_metadata[i][1];
						meta['STATISTICS_MAXIMUM'] = bandDetails.max;
						meta['STATISTICS_MEAN'] = bandDetails.mean;
						meta['STATISTICS_MINIMUM'] = bandDetails.min;
						meta['STATISTICS_STDDEV'] = bandDetails.std;
						meta['STATISTICS_VALID_PERCENT'] = bandDetails.STATISTICS_VALID_PERCENT;
					}
				}
			}
		}

		return this.metadata;
	};

	public add = async (map?: Map, defaultColormap?: string) => {
		const rasterInfo = await this.getMetadata();
		const bandIndex = getActiveBandIndex(rasterInfo);

		const bandMetaStats = rasterInfo.band_metadata[bandIndex][1] as BandMetadata;
		const colorinterp = rasterInfo.colorinterp;
		let colormap: string;
		let titilerApiUrlParams: { [key: string]: number | string | boolean } = {};

		const tilesUrl = new URL(this.feature.properties.links.find((l) => l.rel === 'tiles').href);
		let params = tilesUrl.searchParams;

		if (
			colorinterp &&
			colorinterp.includes('red') &&
			colorinterp.includes('green') &&
			colorinterp.includes('blue')
		) {
			const url = params.get('url');
			params = new URLSearchParams();
			params.set('url', url);
		} else {
			bandMetaStats.STATISTICS_UNIQUE_VALUES = await this.getClassesMap(bandIndex, rasterInfo);
			const layerBandMetadataMin = bandMetaStats['STATISTICS_MINIMUM'];
			const layerBandMetadataMax = bandMetaStats['STATISTICS_MAXIMUM'];
			const isUniqueValueLayer = Object.keys(bandMetaStats.STATISTICS_UNIQUE_VALUES).length > 0;
			// choose default colormap randomly
			colormap =
				defaultColormap ?? getRandomColormap(isUniqueValueLayer ? 'diverging' : 'sequential');

			titilerApiUrlParams = {
				bidx: bandIndex + 1,
				rescale: `${layerBandMetadataMin},${layerBandMetadataMax}`,
				colormap_name: colormap
			};

			Object.keys(titilerApiUrlParams).forEach((key) => {
				params.set(key, `${titilerApiUrlParams[key]}`);
			});

			const colorMap = {};
			if (isUniqueValueLayer) {
				const colorMapKeys = Object.keys(bandMetaStats.STATISTICS_UNIQUE_VALUES);
				const colorsList = chroma.scale(colormap).colors(colorMapKeys.length);
				colorMapKeys.forEach((key, index) => {
					const color = chroma(colorsList[index]).rgba();
					colorMap[key] = [color[0], color[1], color[2], color[3] * 255];
				});
				params.delete('colormap_name');
				params.delete('rescale');
				params.set('colormap', JSON.stringify(colorMap));
			}
		}

		const tileUrl = `${tilesUrl.origin}${decodeURIComponent(
			tilesUrl.pathname
		)}?${params.toString()}`;
		const maxzoom = Number(
			rasterInfo.maxzoom && rasterInfo.maxzoom <= 24 ? rasterInfo.maxzoom : 24
		);

		const tags: [{ key: string; value: string }] = this.feature.properties.tags as unknown as [
			{ key: string; value: string }
		];
		const attribution = createAttributionFromTags(tags);

		const source: RasterSourceSpecification = {
			type: 'raster',
			tiles: [tileUrl],
			tileSize: 256,
			minzoom: 0,
			maxzoom: maxzoom ?? 22,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			bounds: rasterInfo['bounds'],
			attribution
		};
		const layerId = uuidv4();
		//const sourceId = this.feature.properties.id
		const sourceId = layerId;
		if (map && !map.getSource(sourceId)) {
			map.addSource(sourceId, source);
		}

		if (map && map.getLayer(this.feature.properties.id)) {
			map.removeLayer(this.feature.properties.id);
		}

		const layer: RasterLayerSpecification = {
			id: layerId,
			type: 'raster',
			source: sourceId,
			minzoom: source.minzoom,
			layout: {
				visibility: 'visible'
			},
			paint: {
				'raster-resampling': 'nearest',
				'raster-opacity': this.layerOpacity ?? 1
			}
		};

		if (map) {
			let firstSymbolId = undefined;
			for (const layer of map.getStyle().layers) {
				if (layer.type === 'symbol') {
					firstSymbolId = layer.id;
					break;
				}
			}
			map.addLayer(layer, firstSymbolId);

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			map.fitBounds(rasterInfo.bounds);
		}

		return {
			layer,
			source,
			sourceId,
			metadata: rasterInfo,
			colormap: colormap
		};
	};

	private getClassesMap = async (bandIndex: number, layerInfo: RasterTileMetadata) => {
		let classesMap = {};
		// local rasters
		const uvString = layerInfo.band_metadata[bandIndex][1]['STATISTICS_UNIQUE_VALUES'];
		if (!uvString) return classesMap;
		if (uvString && uvString.length > 0) {
			classesMap = JSON.parse(uvString);
		}
		return classesMap;
	};
}
