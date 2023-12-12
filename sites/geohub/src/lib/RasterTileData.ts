import { v4 as uuidv4 } from 'uuid';
import {
	getActiveBandIndex,
	getDefaltLayerStyle,
	getDefaltLayerStyleForStac,
	getDefaultLayerStyleForStacProducts,
	getFirstSymbolLayerId
} from './helper';
import type { RasterTileMetadata, DatasetFeature, LayerCreationInfo } from './types';
import type { Map } from 'maplibre-gl';

export class RasterTileData {
	private feature: DatasetFeature;
	private product?: string;

	constructor(feature: DatasetFeature, product?: string) {
		this.feature = feature;
		this.product = product;
	}

	public getMetadata = async () => {
		const metadataUrl = this.feature.properties?.links?.find((l) => l.rel === 'info').href;
		if (!metadataUrl) return;
		if (this.product) {
			const res = await fetch(metadataUrl);
			const metadata_json = await res.json();
			const assets = Object.keys(metadata_json);
			const firstAsset = assets[0];
			const metadata: RasterTileMetadata = metadata_json[firstAsset];
			return metadata;
		}
		const res = await fetch(metadataUrl);
		const metadata: RasterTileMetadata = await res.json();
		if (metadata && metadata.band_metadata && metadata.band_metadata.length > 0) {
			const resStatistics = await fetch(
				this.feature.properties.links.find((l) => l.rel === 'statistics').href
			);
			const statistics = await resStatistics.json();
			if (statistics) {
				for (let i = 0; i < metadata.band_metadata.length; i++) {
					const bandValue = metadata.band_metadata[i][0] as string;
					const bandDetails = statistics[bandValue];
					if (bandDetails) {
						const meta = metadata.band_metadata[i][1];
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
			}
		}

		return metadata;
	};

	public add = async (map?: Map, bandIndex?: number, colormap_name?: string) => {
		if (!bandIndex) {
			const metadata: RasterTileMetadata = await this.getMetadata();
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
			const res = await fetch(
				`/api/datasets/style/${bandIndex + 1}/raster${
					colormap_name ? `?colormap_name=${colormap_name}` : ''
				}`,
				{
					method: 'POST',
					body: data
				}
			);
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
			classification_method: savedLayerStyle.classification_method
		};
		return data;
	};
}
