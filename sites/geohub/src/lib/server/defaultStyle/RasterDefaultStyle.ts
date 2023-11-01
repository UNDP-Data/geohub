import type { UserConfig } from '$lib/config/DefaultUserConfig';
import { createAttributionFromTags, getActiveBandIndex, getRandomColormap } from '$lib/helper';
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

export default class RasterDefaultStyle implements DefaultStyleTemplate {
	dataset: DatasetFeature;
	metadata: RasterTileMetadata;
	config: UserConfig;
	bandIndex: number;

	constructor(dataset: DatasetFeature, config: UserConfig, bandIndex: number) {
		this.dataset = dataset;
		this.config = config;
		this.bandIndex = bandIndex;
	}

	public create = async () => {
		this.metadata = await this.getMetadata();
		if (!this.bandIndex) {
			this.bandIndex = getActiveBandIndex(this.metadata);
		}

		const bandMetaStats = this.metadata.band_metadata[this.bandIndex][1] as BandMetadata;
		const colorinterp = this.metadata.colorinterp;
		let colormap: string;

		let titilerApiUrlParams: { [key: string]: number | string | boolean } = {};

		const tilesUrl = new URL(this.dataset.properties.links.find((l) => l.rel === 'tiles').href);
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
			bandMetaStats.STATISTICS_UNIQUE_VALUES = await this.getClassesMap(
				this.bandIndex,
				this.metadata
			);
			const layerBandMetadataMin = bandMetaStats['STATISTICS_MINIMUM'];
			const layerBandMetadataMax = bandMetaStats['STATISTICS_MAXIMUM'];

			// For STAC COG, classmap is stored inside tag as JSON string if it has unique values
			const classmap = this.dataset.properties.tags?.find((t) => t.key === 'classmap')?.value;
			if (classmap) {
				bandMetaStats.STATISTICS_UNIQUE_VALUES = JSON.parse(classmap);
			}

			const isUniqueValueLayer = Object.keys(bandMetaStats.STATISTICS_UNIQUE_VALUES).length > 0;
			if (!('stats' in this.metadata)) {
				this.metadata = await this.setStatsToInfo(isUniqueValueLayer);
			}

			// choose default colormap randomly
			colormap = getRandomColormap(isUniqueValueLayer ? 'diverging' : 'sequential');

			titilerApiUrlParams = {
				bidx: this.bandIndex + 1,
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
			classification_method: this.config.ClassificationMethod
		};

		return data;
	};

	public getMetadata = async () => {
		const metadataUrl = this.dataset.properties?.links?.find((l) => l.rel === 'info').href;
		if (!metadataUrl) return this.metadata;
		const res = await fetch(metadataUrl);
		this.metadata = await res.json();
		if (this.metadata && this.metadata.band_metadata && this.metadata.band_metadata.length > 0) {
			const resStatistics = await fetch(
				this.dataset.properties.links.find((l) => l.rel === 'statistics').href
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

	public setStatsToInfo = async (layerHasUniqueValues: boolean) => {
		// Add "stats" object to the "info" object
		const statsURL = this.dataset.properties.links.find((l) => l.rel === 'statistics').href;
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
