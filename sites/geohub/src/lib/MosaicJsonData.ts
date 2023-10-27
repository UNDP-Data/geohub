import { v4 as uuidv4 } from 'uuid';
import { createAttributionFromTags, getRandomColormap } from './helper';
import type { BandMetadata, RasterTileMetadata, DatasetFeature, RasterLayerStats } from './types';
import type { Map, RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl';
import chroma from 'chroma-js';
import { UniqueValueThreshold } from './config/AppConfig';

export class MosaicJsonData {
	private feature: DatasetFeature;
	private metadata: RasterTileMetadata;

	constructor(feature: DatasetFeature) {
		this.feature = feature;
	}

	public getMetadata = async () => {
		const infoUrl = this.feature.properties.links.find((l) => l.rel === 'info').href;
		let res = await fetch(infoUrl);
		if (!res.ok) {
			const error = await res.json();
			throw new Error(error.message ?? error.cause.message ?? res.statusText);
		}
		const data: RasterTileMetadata = await res.json();

		if (
			data &&
			data.band_metadata &&
			data.band_metadata.length > 0 &&
			//TODO needs fix: Ioan band
			Object.keys(data.band_metadata[0][1]).length === 0
		) {
			const statsUrl = this.feature.properties.links.find((l) => l.rel === 'statistics').href;
			res = await fetch(statsUrl);
			if (!res.ok) throw new Error(res.statusText);
			const statistics = await res.json();
			if (statistics) {
				for (let i = 0; i < data.band_metadata.length; i++) {
					const bandValue = data.band_metadata[i][0] as string;
					const bandDetails = statistics[bandValue];
					if (bandDetails) {
						data.band_metadata[i][1] = {
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
		this.metadata = data;
		return data;
	};

	public setStatsToInfo = async (layerHasUniqueValues: boolean) => {
		// Add "stats" object to the "info" object
		const statsURL = this.feature.properties.links.find((l) => l.rel === 'statistics').href;
		const res = await fetch(`${statsURL}&histogram_bins=50`);
		let layerStats = (await res.json()) as RasterLayerStats;
		if (layerHasUniqueValues) {
			const resCategorical = await fetch(`${statsURL}&categorical=true`);
			layerStats = (await resCategorical.json()) as RasterLayerStats;
		}
		if (!('stats' in this.metadata)) {
			this.metadata = { ...this.metadata, stats: layerStats };
		}
		return this.metadata;
	};

	public add = async (map: Map, defaultColormap?: string) => {
		const tags: [{ key: string; value: string }] = this.feature.properties.tags as unknown as [
			{ key: string; value: string }
		];

		const classmapStr = this.feature.properties.tags.find((t) => t.key === 'classmap')?.value;
		const classmap = classmapStr ? JSON.parse(classmapStr) : undefined;

		const numberOfClasses = classmap ? Object.keys(classmap).length : 0;
		const isUniqueValueLayer = numberOfClasses > 0 && numberOfClasses <= UniqueValueThreshold;

		const tileJsonUrl = this.feature.properties.links.find((l) => l.rel === 'tilejson')?.href;

		const res = await fetch(tileJsonUrl);
		if (!res.ok) {
			const error = await res.json();
			throw new Error(error.message ?? error.cause.message ?? res.statusText);
		}
		const tilejson = await res.json();
		this.metadata = await this.getMetadata();
		const bandMetaStats = this.metadata.band_metadata[0][1] as BandMetadata;
		if (!('stats' in this.metadata)) {
			this.metadata = await this.setStatsToInfo(isUniqueValueLayer);
		}

		const layerBandMetadataMin = bandMetaStats['STATISTICS_MINIMUM'];
		const layerBandMetadataMax = bandMetaStats['STATISTICS_MAXIMUM'];

		bandMetaStats.STATISTICS_UNIQUE_VALUES = classmap;

		let colormap =
			defaultColormap ?? getRandomColormap(isUniqueValueLayer ? 'diverging' : 'sequential');
		if (this.metadata.band_metadata.length > 1) {
			colormap = '';
		}
		tilejson.tiles = tilejson.tiles.map((tile) => {
			tile = tile.replace('http://', 'https://');
			if (this.metadata.band_metadata.length > 1) {
				return tile;
			} else {
				const _url = new URL(tile);
				if (isUniqueValueLayer) {
					const colorsList = chroma
						.scale(colormap)
						.colors(Object.keys(bandMetaStats.STATISTICS_UNIQUE_VALUES).length);
					const colorMap = {};
					Object.keys(bandMetaStats.STATISTICS_UNIQUE_VALUES).forEach((key, index) => {
						const color = chroma(colorsList[index]).rgba();
						colorMap[key] = [color[0], color[1], color[2], color[3] * 255];
					});
					_url.searchParams.delete('colormap_name');
					_url.searchParams.delete('rescale');
					_url.searchParams.set('colormap', JSON.stringify(colorMap));
					return decodeURI(_url.toString());
				} else {
					_url.searchParams.delete('colormap_name');
					_url.searchParams.delete('rescale');
					_url.searchParams.set('colormap_name', colormap);
					_url.searchParams.set('rescale', [layerBandMetadataMin, layerBandMetadataMax].join(','));
					return decodeURI(_url.toString());
				}
			}
		});

		const maxzoom = Number(tilejson.maxzoom && tilejson.maxzoom <= 24 ? tilejson.maxzoom : 24);

		const attribution = createAttributionFromTags(tags);

		const source: RasterSourceSpecification = {
			type: 'raster',
			// convert http to https because titiler's /mosaicjson/tilejson.json does not return https protocol currently
			tiles: tilejson.tiles,
			minzoom: 0,
			maxzoom: maxzoom ?? 22,
			bounds: tilejson.bounds,
			attribution
		};
		if (source.maxzoom > 24) {
			source.maxzoom = 24;
		}
		const layerId = uuidv4();
		const sourceId = layerId;
		if (map && !map.getSource(sourceId)) {
			map.addSource(sourceId, source);
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
				'raster-resampling': 'nearest'
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
			map.fitBounds(this.metadata.bounds);
		}

		return {
			layer,
			source,
			sourceId,
			metadata: this.metadata,
			colormap: colormap
		};
	};
}
