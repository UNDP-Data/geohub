import { v4 as uuidv4 } from 'uuid';
import {
	getActiveBandIndex,
	getDefaltLayerStyle,
	getDefaltLayerStyleForStac,
	getRandomColormap
} from './helper';
import type { BandMetadata, RasterTileMetadata, DatasetFeature, RasterLayerStats } from './types';
import type { Map } from 'maplibre-gl';

export class RasterTileData {
	private feature: DatasetFeature;
	private metadata: RasterTileMetadata;

	constructor(feature: DatasetFeature, metadata?: RasterTileMetadata) {
		this.feature = feature;
		this.metadata = metadata;
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

	public setMetadata = (metadata: RasterTileMetadata) => {
		this.metadata = metadata;
	};

	public add = async (map?: Map, defaultColormap?: string, bandIndex?: number) => {
		this.metadata = await this.getMetadata();
		if (!bandIndex) {
			bandIndex = getActiveBandIndex(this.metadata);
		}

		const layerId = uuidv4();
		//const sourceId = this.feature.properties.id
		const sourceId = layerId;

		const bandMetaStats = this.metadata.band_metadata[bandIndex][1] as BandMetadata;
		// const colorinterp = this.metadata.colorinterp;
		// let colormap: string;

		const isStac = this.feature.properties.tags.find((t) => t.key === 'type')?.value === 'stac';

		const savedLayerStyle = isStac
			? await getDefaltLayerStyleForStac(this.feature)
			: await getDefaltLayerStyle(this.feature, `${bandIndex + 1}`, 'raster');
		// if (savedLayerStyle) {
		const layerSpec = JSON.parse(
			JSON.stringify(savedLayerStyle.style)
				.replace('{source_id}', sourceId)
				.replace('{layer_id}', layerId)
		);
		const sourceSpec = JSON.parse(JSON.stringify(savedLayerStyle.source));

		if (map) {
			if (!map.getSource(sourceId)) {
				map.addSource(sourceId, sourceSpec);
			}
			if (!map.getLayer(layerSpec.id)) {
				map.addLayer(layerSpec);
			}
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			map.fitBounds(this.metadata.bounds);
		}

		bandMetaStats.STATISTICS_UNIQUE_VALUES = await this.getClassesMap(bandIndex, this.metadata);

		// For STAC COG, classmap is stored inside tag as JSON string if it has unique values
		const classmap = this.feature.properties.tags.find((t) => t.key === 'classmap')?.value;
		if (classmap) {
			bandMetaStats.STATISTICS_UNIQUE_VALUES = JSON.parse(classmap);
		}

		const isUniqueValueLayer = Object.keys(bandMetaStats.STATISTICS_UNIQUE_VALUES).length > 0;
		if (!('stats' in this.metadata)) {
			this.metadata = await this.setStatsToInfo(isUniqueValueLayer);
		}

		const colormap =
			savedLayerStyle.colormap_name ??
			defaultColormap ??
			getRandomColormap(isUniqueValueLayer ? 'diverging' : 'sequential');

		return {
			layer: layerSpec,
			source: sourceSpec,
			sourceId: sourceId,
			metadata: this.metadata,
			colormap: colormap,
			classification_method: savedLayerStyle.classification_method
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
