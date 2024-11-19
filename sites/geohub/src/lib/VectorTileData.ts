import { v4 as uuidv4 } from 'uuid';
import type {
	DatasetDefaultLayerStyle,
	DatasetFeature,
	LayerCreationInfo,
	VectorLayerTypes
} from './types';
import { LngLatBounds, type Map } from 'maplibre-gl';
import { getDefaltLayerStyle } from './helper';
import type {
	VectorTileMetadata,
	ClassificationMethodTypes
} from '@undp-data/svelte-undp-components';

export class VectorTileData {
	private feature: DatasetFeature;
	private defaultPitch: number;

	constructor(feature: DatasetFeature, pitch = 70) {
		this.feature = feature;
		this.defaultPitch = pitch;
	}

	public getMetadata = async () => {
		const metadataUrl = this.feature.properties.links?.find((l) => l.rel === 'metadatajson')?.href;
		if (!metadataUrl) return;
		const res = await fetch(metadataUrl);
		const metadata: VectorTileMetadata = await res.json();

		return metadata;
	};

	public add = async (
		map?: Map,
		layerType?: 'point' | 'heatmap' | 'polygon' | 'linestring' | 'circle' | 'fill-extrusion',
		targetLayer?: string
	) => {
		const metadata = await this.getMetadata();

		const layerId = uuidv4();
		const isFunction =
			this.feature.properties.tags?.find((t) => t.key == 'layertype')?.value === 'function';
		// Postgres Function Layer will use source URL by changing function parameters,
		// hence, if the dataset is Function layer, unique UUID is used as source ID.
		// Otherwise, dataset ID is used to share with other layers
		const tileSourceId = isFunction ? uuidv4() : (this.feature.properties.id as string);
		const selectedLayerId = targetLayer ?? (metadata?.json?.vector_layers[0].id as string);

		let maplibreLayerType: VectorLayerTypes = 'fill';

		const selectedLayer = metadata?.json?.tilestats?.layers.find(
			(l) => l.layer === selectedLayerId
		);
		const geomType = layerType ?? selectedLayer?.geometry.toLocaleLowerCase();
		if (geomType === 'point' || geomType === 'multipoint') {
			maplibreLayerType = 'symbol';
		} else if (geomType === 'linestring' || geomType === 'multilinestring') {
			maplibreLayerType = 'line';
		} else if (geomType === 'heatmap') {
			maplibreLayerType = 'heatmap';
		} else if (geomType === 'polygon' || geomType === 'multipolygon') {
			maplibreLayerType = 'fill';
		} else if (geomType === 'circle') {
			maplibreLayerType = geomType;
		} else if (geomType === 'fill-extrusion') {
			maplibreLayerType = 'fill-extrusion';
		}
		// check and restore from saved layer style
		let savedLayerStyle = (await getDefaltLayerStyle(
			this.feature,
			selectedLayerId,
			maplibreLayerType
		)) as DatasetDefaultLayerStyle;

		if (!savedLayerStyle?.style) {
			const data = new FormData();
			data.append('feature', JSON.stringify(this.feature));
			const res = await fetch(`/api/datasets/style/${selectedLayerId}/${maplibreLayerType}`, {
				method: 'POST',

				body: data
			});
			savedLayerStyle = await res.json();
		}

		const layerSpec = JSON.parse(
			JSON.stringify(savedLayerStyle.style)
				.replace('{source_id}', tileSourceId)
				.replace('{layer_id}', layerId)
		);
		const sourceSpec = JSON.parse(JSON.stringify(savedLayerStyle.source));

		if (map) {
			if (!map.getSource(tileSourceId)) {
				map.addSource(tileSourceId, sourceSpec);
			}
			if (!map.getLayer(layerSpec.id)) {
				map.addLayer(layerSpec);
			}

			map.fitBounds(this.getLayerBounds(savedLayerStyle.metadata as VectorTileMetadata), {
				padding: 10,
				pitch: maplibreLayerType === 'fill-extrusion' ? this.defaultPitch : 0
			});
		}

		const data: LayerCreationInfo = {
			layer: layerSpec,
			source: sourceSpec,
			sourceId: tileSourceId,
			metadata: savedLayerStyle.metadata as VectorTileMetadata,
			colormap_name: savedLayerStyle.colormap_name as string,
			classification_method: savedLayerStyle.classification_method as ClassificationMethodTypes,
			classification_method_2: savedLayerStyle.classification_method_2 as ClassificationMethodTypes,
			defaultStyle: savedLayerStyle
		};
		return data;
	};

	private getLayerBounds = (metadata: VectorTileMetadata) => {
		const bounds = metadata.bounds.split(',').map((val) => Number(val));
		return new LngLatBounds([bounds[0], bounds[1]], [bounds[2], bounds[3]]);
	};
}
