import { v4 as uuidv4 } from 'uuid';
import {
	createAttributionFromTags,
	getActiveBandIndex,
	getBase64EncodedUrl,
	getRandomColormap,
	paramsToQueryString
} from './helper';
import type { BandMetadata, RasterTileMetadata, DatasetFeature } from './types';
import type { Map, RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl';
import chroma from 'chroma-js';

export class RasterTileData {
	private feature: DatasetFeature;
	private url: string;
	private metadata: RasterTileMetadata;
	private titilerUrl: string;
	private layerOpacity: number;

	constructor(
		titilerUrl: string,
		feature: DatasetFeature,
		metadata?: RasterTileMetadata,
		layerOpacity?: number
	) {
		this.titilerUrl = titilerUrl;
		this.feature = feature;
		this.url = feature.properties.url;
		this.metadata = metadata;
		this.layerOpacity = layerOpacity;
	}

	public getMetadata = async () => {
		// if (this.metadata) return this.metadata
		const b64EncodedUrl = getBase64EncodedUrl(this.url);
		const res = await fetch(`${this.titilerUrl}/info?url=${b64EncodedUrl}`);
		this.metadata = await res.json();
		if (
			this.metadata &&
			this.metadata.band_metadata &&
			this.metadata.band_metadata.length > 0 &&
			//TODO needs fix: Ioan band
			Object.keys(this.metadata.band_metadata[0][1]).length === 0
		) {
			const resStatistics = await fetch(`${this.titilerUrl}/statistics?url=${b64EncodedUrl}`);
			const statistics = await resStatistics.json();
			if (statistics) {
				for (let i = 0; i < this.metadata.band_metadata.length; i++) {
					const bandValue = this.metadata.band_metadata[i][0] as string;
					const bandDetails = statistics[bandValue];
					if (bandDetails) {
						this.metadata.band_metadata[i][1] = {
							STATISTICS_MAXIMUM: bandDetails.max,
							STATISTICS_MEAN: bandDetails.mean,
							STATISTICS_MINIMUM: bandDetails.min,
							STATISTICS_STDDEV: bandDetails.std,
							STATISTICS_VALID_PERCENT: bandDetails.valid_percent
						};
					}
				}
			}
		}

		return this.metadata;
	};

	public add = async (map: Map, defaultColormap?: string) => {
		const b64EncodedUrl = getBase64EncodedUrl(this.url);
		const rasterInfo = await this.getMetadata();
		const bandIndex = getActiveBandIndex(rasterInfo);

		const bandMetaStats = rasterInfo.band_metadata[bandIndex][1] as BandMetadata;
		const colorinterp = rasterInfo.colorinterp;
		let colormap: string;
		let titilerApiUrlParams: { [key: string]: number | string | boolean } = {};
		if (
			colorinterp &&
			colorinterp.includes('red') &&
			colorinterp.includes('green') &&
			colorinterp.includes('blue')
		) {
			titilerApiUrlParams = {
				TileMatrixSetId: 'WebMercatorQuad',
				url: b64EncodedUrl
			};
		} else {
			bandMetaStats.STATISTICS_UNIQUE_VALUES = await this.getClassesMap(bandIndex, rasterInfo);
			const layerBandMetadataMin = bandMetaStats['STATISTICS_MINIMUM'];
			const layerBandMetadataMax = bandMetaStats['STATISTICS_MAXIMUM'];
			const isUniqueValueLayer = Object.keys(bandMetaStats.STATISTICS_UNIQUE_VALUES).length > 0;
			// choose default colormap randomly
			colormap =
				defaultColormap ?? getRandomColormap(isUniqueValueLayer ? 'diverging' : 'sequential');

			titilerApiUrlParams = {
				scale: 1,
				TileMatrixSetId: 'WebMercatorQuad',
				url: b64EncodedUrl,
				bidx: bandIndex + 1,
				unscale: false,
				resampling: 'nearest',
				rescale: `${layerBandMetadataMin},${layerBandMetadataMax}`,
				return_mask: true,
				colormap_name: colormap
			};

			const colorMap = {};
			if (isUniqueValueLayer) {
				const colorMapKeys = Object.keys(bandMetaStats.STATISTICS_UNIQUE_VALUES);
				const colorsList = chroma.scale(colormap).colors(colorMapKeys.length);
				colorMapKeys.forEach((key, index) => {
					const color = chroma(colorsList[index]).rgba();
					colorMap[key] = [color[0], color[1], color[2], color[3] * 255];
				});
				delete titilerApiUrlParams['colormap_name'];
				delete titilerApiUrlParams['rescale'];
				titilerApiUrlParams['colormap'] = JSON.stringify(colorMap);
			}
		}

		const tileUrl = `${this.titilerUrl}/tiles/{z}/{x}/{y}.png?${paramsToQueryString(
			titilerApiUrlParams
		)}`;
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
		if (!map.getSource(sourceId)) {
			map.addSource(sourceId, source);
		}

		if (map.getLayer(this.feature.properties.id)) {
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
