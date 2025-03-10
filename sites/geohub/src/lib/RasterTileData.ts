import { v4 as uuidv4 } from 'uuid';
import {
	getDefaltLayerStyle,
	getDefaltLayerStyleForStac,
	getDefaultLayerStyleForStacProducts,
	getFirstSymbolLayerId
} from './helper';
import type { DatasetFeature, LayerCreationInfo } from './types';
import type { Map } from 'maplibre-gl';
import {
	type BandMetadata,
	type RasterTileMetadata,
	getActiveBandIndex
} from '@undp-data/svelte-undp-components';

export class RasterTileData {
	private feature: DatasetFeature;

	constructor(feature: DatasetFeature) {
		this.feature = JSON.parse(JSON.stringify(feature));
		// delete all algorithm tags. set algorithm Id at getMetadata or add functions instead.
		this.feature.properties.tags = this.feature.properties.tags?.filter(
			(t) => t.key !== 'algorithm'
		);
	}

	public getBounds = async () => {
		const boundsUrl = this.feature.properties?.links?.find((l) => l.rel === 'bounds')?.href;
		if (!boundsUrl) return;
		const res = await fetch(boundsUrl);
		if (!res.ok) return;
		const json = await res.json();
		const bounds = json.bounds as number[];
		return bounds;
	};

	public getMetadata = async (algorithmId?: string, expression?: string, nodata?: string) => {
		const metadataUrl = this.feature.properties?.links?.find((l) => l.rel === 'info')?.href;
		const product = this.feature.properties.tags?.find((t) => t.key === 'product')?.value;

		if (!metadataUrl) return;
		const bounds = await this.getBounds();
		const res = await fetch(metadataUrl);
		if (product) {
			const metadata_json = await res.json();
			const assets = Object.keys(metadata_json);
			const firstAsset = assets[0];
			const metadata: RasterTileMetadata = metadata_json[firstAsset];
			return metadata;
		}
		const metadata: RasterTileMetadata = await res.json();
		if (bounds) {
			metadata.bounds = bounds;
		}
		if (metadata && metadata.band_metadata && metadata.band_metadata.length > 0) {
			const statUrl = new URL(
				this.feature.properties.links?.find((l) => l.rel === 'statistics')?.href as string
			);
			statUrl.searchParams.set('unscale', 'true');

			const apiUrl = new URL(statUrl.href);
			apiUrl.searchParams.set('histogram_bins', '10');
			if (algorithmId) {
				apiUrl.searchParams.set('algorithm', algorithmId);
			}
			if (expression) {
				apiUrl.searchParams.set('expression', expression);
			}
			if (nodata) {
				apiUrl.searchParams.set('nodata', nodata);
			}
			const resStatistics = await fetch(apiUrl);
			const statistics = await resStatistics.json();
			if (statistics && !algorithmId && !expression && !nodata) {
				for (let i = 0; i < metadata.band_metadata.length; i++) {
					const bandValue = metadata.band_metadata[i][0] as string;
					const bandDetails = statistics[bandValue];
					if (bandDetails) {
						const meta = metadata.band_metadata[i][1];
						meta['STATISTICS_MAXIMUM'] = bandDetails.max;
						meta['STATISTICS_MEAN'] = bandDetails.mean;
						meta['STATISTICS_MINIMUM'] = bandDetails.min;
						meta['STATISTICS_STDDEV'] = bandDetails.std;
						meta['STATISTICS_VALID_PERCENT'] = bandDetails.valid_percent;
						// use median from statistics api which is not included in info api
						meta['STATISTICS_MEDIAN'] = bandDetails.median;
					}
				}
				metadata.stats = statistics;
			} else if (statistics && (algorithmId || expression || nodata)) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				metadata.band_metadata = [];
				metadata.band_descriptions = [];
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
					metadata.band_metadata.push([bName, bandMeta]);
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					metadata.band_descriptions.push([bName, '']);
				});
				metadata.stats = statistics;
			}
		}

		return metadata;
	};

	public add = async (
		map?: Map,
		bandIndex?: number,
		colormap_name?: string,
		algorithmId?: string
	) => {
		if (!bandIndex) {
			const metadata: RasterTileMetadata = await this.getMetadata(algorithmId);
			bandIndex = getActiveBandIndex(metadata);
		}

		const layerId = uuidv4();
		const sourceId = layerId;

		const isStac = this.feature.properties.tags?.find((t) => t.key === 'type')?.value === 'stac';
		const isProduct = !!this.feature.properties.tags?.find((t) => t.key === 'product')?.value;
		let savedLayerStyle;
		if (isProduct) {
			savedLayerStyle = await getDefaultLayerStyleForStacProducts(this.feature, colormap_name);
		} else {
			savedLayerStyle = isStac
				? await getDefaltLayerStyleForStac(this.feature, colormap_name)
				: await getDefaltLayerStyle(this.feature, `${bandIndex + 1}`, 'raster', colormap_name);
		}

		if (!savedLayerStyle?.style) {
			const data = new FormData();
			data.append('feature', JSON.stringify(this.feature));
			const params: { [key: string]: string } = {};
			if (colormap_name) {
				params['colormap_name'] = colormap_name;
			}
			if (algorithmId) {
				params['algorithm'] = algorithmId;
			}
			const apiUrl = `/api/datasets/style/${bandIndex + 1}/raster${
				Object.keys(params).length > 0
					? `?${Object.keys(params)
							.map((key) => `${key}=${params[key]}`)
							.join('&')}`
					: ''
			}`;
			const res = await fetch(apiUrl, {
				method: 'POST',
				body: data
			});
			savedLayerStyle = await res.json();
		}
		if (!savedLayerStyle?.style) {
			throw new Error('Failed to fetch default layer style from the server.');
		}
		const layerSpec = JSON.parse(
			JSON.stringify(savedLayerStyle.style)
				.replace('{source_id}', sourceId)
				.replace('{layer_id}', layerId)
		);
		const sourceSpec = JSON.parse(JSON.stringify(savedLayerStyle.source));

		if (map) {
			map.addSource(sourceId, savedLayerStyle.source);

			const firstSymbolId = getFirstSymbolLayerId(map.getStyle().layers);
			map.addLayer(layerSpec, firstSymbolId);

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			map.fitBounds(savedLayerStyle.metadata.bounds);
		}

		const data: LayerCreationInfo = {
			layer: layerSpec,
			source: sourceSpec,
			sourceId: sourceId,
			metadata: savedLayerStyle.metadata,
			colormap_name: savedLayerStyle.colormap_name,
			classification_method: savedLayerStyle.classification_method,
			classification_method_2: undefined,
			defaultStyle: savedLayerStyle
		};
		return data;
	};
}
