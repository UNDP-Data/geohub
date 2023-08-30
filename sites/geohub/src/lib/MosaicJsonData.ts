import { v4 as uuidv4 } from 'uuid';
import { createAttributionFromTags, getBase64EncodedUrl, getRandomColormap } from './helper';
import type { BandMetadata, RasterTileMetadata, DatasetFeature } from './types';
import type { Map, RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl';
import chroma from 'chroma-js';
import { StacMinimumZoom, UniqueValueThreshold } from './config/AppConfig';

export class MosaicJsonData {
	private feature: DatasetFeature;
	private url: string;
	private assetName: string;

	constructor(feature: DatasetFeature, assetUrl: string, assetName: string) {
		this.feature = feature;
		this.url = assetUrl;
		this.assetName = assetName;
	}

	private getMetadata = async (
		tilejson: { bounds: number[]; tiles: string[] },
		isUniqueValue: boolean
	) => {
		const tileUrl = new URL(tilejson.tiles[0]);
		const mosaicUrl = tileUrl.searchParams.get('url');
		const mosaicjsonApi = this.feature.properties.links.find((l) => l.rel === 'mosaicjson').href;
		const mosaicAssetUrl = `${mosaicjsonApi}/${tilejson.bounds.join(
			','
		)}/assets?url=${encodeURIComponent(mosaicUrl)}`;
		let res = await fetch(mosaicAssetUrl);
		if (!res.ok) {
			const error = await res.json();
			throw new Error(error.message ?? error.cause.message ?? res.statusText);
		}
		const assets: string[] = await res.json();
		if (assets && assets.length > 0) {
			const assetUrl = assets[0].replace('/vsicurl/', '');
			const data: RasterTileMetadata = await this.getRasterMetadata(getBase64EncodedUrl(assetUrl));
			if (!(data.band_metadata.length > 1)) {
				let statsURL = this.feature.properties.links.find((l) => l.rel === 'statistics').href;
				statsURL = statsURL.replace('{url}', encodeURIComponent(assetUrl));
				if (isUniqueValue) {
					statsURL = `${statsURL}&categorical=true`;
				}
				res = await fetch(statsURL);
				if (!res.ok) {
					const error = await res.json();
					throw new Error(error.message ?? error.cause.message ?? res.statusText);
				}
				const layerStats = await res.json();
				data.stats = layerStats;
				data.active_band_no = Object.keys(layerStats)[0];
			}
			data.isMosaicJson = true;
			return data;
		} else {
			const data: RasterTileMetadata = {
				bounds: tilejson.bounds
			};
			data.isMosaicJson = true;
			return data;
		}
	};

	private getRasterMetadata = async (url: string) => {
		const infoUrl = this.feature.properties.links.find((l) => l.rel === 'info').href;
		let res = await fetch(infoUrl.replace('{url}', url));
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
			res = await fetch(statsUrl.replace('{url}', url));
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
		return data;
	};

	public add = async (map: Map, defaultColormap?: string) => {
		const zoom = map.getZoom();
		if (zoom < StacMinimumZoom) {
			throw new Error('Please zoom in more than zoom level: 5 in order to load the layer');
		}

		const bounds = map.getBounds();
		const bbox = [
			bounds.getSouthWest().lng,
			bounds.getSouthWest().lat,
			bounds.getNorthEast().lng,
			bounds.getNorthEast().lat
		];
		const tags: [{ key: string; value: string }] = this.feature.properties.tags as unknown as [
			{ key: string; value: string }
		];
		const stacType = tags?.find((tag) => tag.key === 'stac');

		let res = await fetch(
			`api/stac/mosaicjson?url=${encodeURIComponent(this.url)}&bbox=${JSON.stringify(bbox)}&asset=${
				this.assetName
			}${stacType ? `&type=${stacType.value}` : ''}`
		);
		if (!res.ok) {
			const error = await res.json();
			throw new Error(error.message ?? error.cause.message ?? res.statusText);
		}
		const mosaicjson = await res.json();
		const numberOfClasses = mosaicjson.classmap ? Object.keys(mosaicjson.classmap).length : 0;
		const isUniqueValueLayer = numberOfClasses > 0 && numberOfClasses <= UniqueValueThreshold;
		res = await fetch(mosaicjson.tilejson);
		if (!res.ok) {
			const error = await res.json();
			throw new Error(error.message ?? error.cause.message ?? res.statusText);
		}
		const tilejson = await res.json();
		const rasterInfo = await this.getMetadata(tilejson, isUniqueValueLayer);
		const bandMetaStats = rasterInfo.band_metadata[0][1] as BandMetadata;
		const layerBandMetadataMin = bandMetaStats['STATISTICS_MINIMUM'];
		const layerBandMetadataMax = bandMetaStats['STATISTICS_MAXIMUM'];

		bandMetaStats.STATISTICS_UNIQUE_VALUES = mosaicjson.classmap;

		let colormap =
			defaultColormap ?? getRandomColormap(isUniqueValueLayer ? 'diverging' : 'sequential');
		if (rasterInfo.band_metadata.length > 1) {
			colormap = '';
		}
		tilejson.tiles = tilejson.tiles.map((tile) => {
			tile = tile.replace('http://', 'https://');
			if (rasterInfo.band_metadata.length > 1) {
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
		if (!map.getSource(sourceId)) {
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
}
