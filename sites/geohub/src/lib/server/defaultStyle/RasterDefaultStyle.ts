import type { UserConfig } from '$lib/config/DefaultUserConfig';
import {
	createAttributionFromTags,
	getActiveBandIndex,
	getMinMaxValuesInMode,
	isDataHighlySkewed,
	isDataSkewed
} from '$lib/helper';
import type {
	BandMetadata,
	DatasetDefaultLayerStyle,
	DatasetFeature,
	RasterLayerStats,
	RasterTileMetadata
} from '$lib/types';
import chroma from 'chroma-js';
import type { DefaultStyleTemplate } from './DefaultStyleTemplate';
import type { RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl';
import { error } from '@sveltejs/kit';
import { getRandomColormap } from '@undp-data/svelte-undp-components';

export default class RasterDefaultStyle implements DefaultStyleTemplate {
	dataset: DatasetFeature;
	metadata: RasterTileMetadata;
	config: UserConfig;
	product?: string;
	bandIndex: number;

	constructor(dataset: DatasetFeature, config: UserConfig, bandIndex: number, product?: string) {
		this.dataset = dataset;
		this.config = config;
		this.bandIndex = bandIndex;
		this.product = product;
	}

	public create = async (colormap_name?: string, algorithmId?: string) => {
		this.metadata = await this.getMetadata(algorithmId);
		if (!this.bandIndex) {
			this.bandIndex = getActiveBandIndex(this.metadata);
		}

		const bandMeta = this.metadata.band_metadata[this.bandIndex];
		this.metadata.active_band_no = bandMeta[0] as string;
		const bandMetaStats = bandMeta[1] as BandMetadata;
		const colorinterp = this.metadata.colorinterp;
		let colormap: string;

		let titilerApiUrlParams: { [key: string]: number | string | boolean } = {};

		// Normally COG dataset should have tiles link
		const tilesLink = this.dataset.properties.links.find((l) => l.rel === 'tiles');
		let tileLinkUrl = tilesLink?.href;
		if (!tilesLink) {
			// if no tiles link, looks for tile URL from tilejson. This is normally for mosaicjson.
			const tilesLink = this.dataset.properties.links.find((l) => l.rel === 'tilejson');
			const tileJsonUrl = tilesLink?.href;

			const res = await fetch(tileJsonUrl);
			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message ?? error.cause.message ?? res.statusText);
			}
			const tilejson = await res.json();
			tileLinkUrl = tilejson.tiles[0];
		}
		const tilesUrl = new URL(tileLinkUrl);
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
			const layerBandMetadataMin = bandMetaStats['STATISTICS_MINIMUM'];
			const layerBandMetadataMax = bandMetaStats['STATISTICS_MAXIMUM'];

			const isUniqueValueLayer = Object.keys(bandMetaStats.STATISTICS_UNIQUE_VALUES).length > 0;

			// choose default colormap randomly if colormap is not specified
			// but use diverging if data is unique value layer
			colormap =
				colormap_name ?? getRandomColormap(isUniqueValueLayer ? 'diverging' : 'sequential');

			let rescale = [layerBandMetadataMin, layerBandMetadataMax];
			if (this.metadata.stats) {
				const stats = this.metadata.stats[this.metadata.active_band_no];
				// calculating skewness has an issue in some datasets like "Max temparature". https://geohub.data.undp.org/data/387f0535335a7754fdac8b9710177fb4
				const isSkewed = isDataSkewed(stats.mean, stats.median, stats.std, stats.histogram);
				// if data is somehow skewed, rescale values for rendering
				if (isSkewed) {
					const isHighlySkewed = isDataHighlySkewed(
						stats.mean,
						stats.median,
						stats.std,
						stats.histogram
					);
					const modeMinMaxValues = getMinMaxValuesInMode(stats.histogram);
					if (isHighlySkewed) {
						// if data is higly skewed, extract mode which contains most frequent value, and set min/max from the mode.
						rescale = [modeMinMaxValues.min, modeMinMaxValues.max];
					} else {
						// if data is moderately skewed, use percentile_2 and percentile_98 to rescale
						rescale = [stats.percentile_2, stats.percentile_98];
					}
					// use diverging colormap if data is skewed
					colormap = colormap_name ?? getRandomColormap('sequential');
				}
			}

			titilerApiUrlParams = {
				rescale: rescale.join(','),
				colormap_name: colormap
			};

			const algoId = this.dataset.properties?.tags?.find(
				(t) => t.key === 'algorithm' && t.value === algorithmId
			)?.value;
			if (algoId) {
				titilerApiUrlParams['algorithm'] = algoId;
			} else {
				titilerApiUrlParams['bidx'] = this.bandIndex + 1;
			}

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
			this.metadata.maxzoom && this.metadata.maxzoom <= 24 ? this.metadata.maxzoom : 24
		);

		const tags: [{ key: string; value: string }] = this.dataset.properties.tags as unknown as [
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
			bounds: this.metadata['bounds'],
			attribution
		};

		const layer: RasterLayerSpecification = {
			id: '{layer_id}',
			type: 'raster',
			source: '{source_id}',
			minzoom: source.minzoom,
			layout: {
				visibility: 'visible'
			},
			paint: {
				'raster-resampling': 'nearest',
				'raster-opacity': this.config.LayerOpacity / 100
			}
		};

		const data: DatasetDefaultLayerStyle = {
			dataset_id: this.dataset.properties.id,
			layer_id: `${this.bandIndex + 1}`,
			layer_type: layer.type,
			source: source,
			style: layer,
			colormap_name: colormap,
			classification_method: this.config.ClassificationMethod,
			metadata: this.metadata
		};

		return data;
	};

	public getMetadata = async (algorithmId?: string) => {
		// console.log(this.dataset.properties?.links)
		const metadataUrl = this.dataset.properties?.links?.find((l) => l.rel === 'info').href;
		const product = this.dataset.properties.tags?.find((t) => t.key === 'product')?.value;
		// console.log("ZXXXXXXXXXXXXXXXX", metadataUrl)
		// console.log("DDDDDDDDDDDDDDDDD", this.metadata)
		if (!metadataUrl) return this.metadata;
		const res = await fetch(metadataUrl);
		if (!res.ok) {
			error(res.status, res.statusText);
		}
		if (product) {
			// FIXME: this is a hack to get the metadata for the product
			const assetMeta = await res.json();
			const assets = Object.keys(assetMeta);
			this.metadata = assetMeta[assets[0]];
			this.metadata.active_band_no = this.dataset.properties.tags?.find(
				(t) => t.key == 'product_expression'
			)?.value;
			this.metadata.band_metadata = [[this.metadata.active_band_no, JSON.parse('{}')]];
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			this.metadata.band_descriptions = [[this.metadata.active_band_no]];
		} else {
			this.metadata = await res.json();
		}
		if (this.metadata && this.metadata.band_metadata && this.metadata.band_metadata.length > 0) {
			const resStatistics = await fetch(
				`${
					this.dataset.properties.links.find((l) => l.rel === 'statistics').href
				}&histogram_bins=10${algorithmId ? `&algorithm=${algorithmId}` : ''}`
			);
			if (!resStatistics.ok) {
				error(resStatistics.status, resStatistics.statusText);
			}
			const statistics = await resStatistics.json();
			if (statistics && !algorithmId) {
				for (let i = 0; i < this.metadata.band_metadata.length; i++) {
					const bandValue = this.metadata.band_metadata[i][0] as string;
					const bandDetails = statistics[bandValue];
					if (bandDetails) {
						const meta = this.metadata.band_metadata[i][1];
						// use values from statistics api if info does not contain them
						meta['STATISTICS_MAXIMUM'] = meta['STATISTICS_MAXIMUM'] ?? bandDetails.max;
						meta['STATISTICS_MEAN'] = meta['STATISTICS_MEAN'] ?? bandDetails.mean;
						meta['STATISTICS_MINIMUM'] = meta['STATISTICS_MINIMUM'] ?? bandDetails.min;
						meta['STATISTICS_STDDEV'] = meta['STATISTICS_STDDEV'] ?? bandDetails.std;
						meta['STATISTICS_VALID_PERCENT'] =
							meta['STATISTICS_VALID_PERCENT'] ?? bandDetails.STATISTICS_VALID_PERCENT;
						// use median from statistics api which is not included in info api
						meta['STATISTICS_MEDIAN'] = bandDetails.median;
					}
				}
				this.metadata.stats = statistics;
			} else if (statistics && algorithmId) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				this.metadata.band_metadata = [];
				this.metadata.band_descriptions = [];
				Object.keys(statistics).forEach((bName) => {
					const bandDetails = statistics[bName];
					const bandMeta: BandMetadata = {
						STATISTICS_MAXIMUM: bandDetails.max,
						STATISTICS_MEAN: bandDetails.mean,
						STATISTICS_MINIMUM: bandDetails.min,
						STATISTICS_STDDEV: bandDetails.std,
						STATISTICS_VALID_PERCENT: bandDetails.STATISTICS_VALID_PERCENT,
						STATISTICS_MEDIAN: bandDetails.median
					};
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					this.metadata.band_metadata.push([bName, bandMeta]);
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					this.metadata.band_descriptions.push([bName, '']);
				});
				this.metadata.stats = statistics;
			}
		}
		if (!this.bandIndex) {
			this.bandIndex = getActiveBandIndex(this.metadata);
		}
		const bandMetaStats = this.metadata.band_metadata[this.bandIndex][1] as BandMetadata;
		const colorinterp = this.metadata.colorinterp;

		if (
			!(
				colorinterp &&
				colorinterp.includes('red') &&
				colorinterp.includes('green') &&
				colorinterp.includes('blue')
			)
		) {
			bandMetaStats.STATISTICS_UNIQUE_VALUES = await this.getClassesMap(
				this.bandIndex,
				this.metadata
			);

			// For STAC COG, classmap is stored inside tag as JSON string if it has unique values
			const classmap = this.dataset.properties.tags?.find((t) => t.key === 'classmap')?.value;
			if (classmap) {
				bandMetaStats.STATISTICS_UNIQUE_VALUES = JSON.parse(classmap);
			}

			const isUniqueValueLayer = Object.keys(bandMetaStats.STATISTICS_UNIQUE_VALUES).length > 0;
			if (!('stats' in this.metadata)) {
				this.metadata = await this.setStatsToInfo(isUniqueValueLayer);
			}
		}

		return this.metadata;
	};

	private setStatsToInfo = async (layerHasUniqueValues: boolean) => {
		// Add "stats" object to the "info" object
		const statsURL = this.dataset.properties.links.find((l) => l.rel === 'statistics').href;
		const res = await fetch(`${statsURL}&histogram_bins=10`);
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
