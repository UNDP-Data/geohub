import { v4 as uuidv4 } from 'uuid';
import type {
	DatasetFeature,
	LayerCreationInfo,
	VectorLayerTypes,
	VectorTileMetadata
} from './types';
import { LngLatBounds, type Map } from 'maplibre-gl';
import { getDefaltLayerStyle } from './helper';

export class VectorTileData {
	private feature: DatasetFeature;

	constructor(feature: DatasetFeature) {
		this.feature = feature;
	}

	public getMetadata = async () => {
		const metadataUrl = this.feature.properties.links.find((l) => l.rel === 'metadatajson').href;

		const res = await fetch(metadataUrl);
		const metadata: VectorTileMetadata = await res.json();

		return metadata;
	};

	public add = async (
		map?: Map,
		layerType?: 'point' | 'heatmap' | 'polygon' | 'linestring' | 'circle',
		targetLayer?: string
	) => {
		const metadata = await this.getMetadata();

		const tileSourceId = this.feature.properties.id;
		const selectedLayerId = targetLayer ?? metadata.json.vector_layers[0].id;
		const layerId = uuidv4();

		let maplibreLayerType: VectorLayerTypes;

		const selectedLayer = metadata.json.tilestats.layers.find((l) => l.layer === selectedLayerId);
		const geomType = layerType ?? selectedLayer.geometry.toLocaleLowerCase();
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
		let savedLayerStyle = await getDefaltLayerStyle(
			this.feature,
			selectedLayerId,
			maplibreLayerType
		);

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
			map.fitBounds(this.getLayerBounds(savedLayerStyle.metadata as VectorTileMetadata));
		}

		const data: LayerCreationInfo = {
			layer: layerSpec,
			source: sourceSpec,
			sourceId: tileSourceId,
			metadata: savedLayerStyle.metadata,
			colormap_name: savedLayerStyle.colormap_name,
			classification_method: savedLayerStyle.classification_method
		};
		return data;
	};

	private getLayerBounds = (metadata: VectorTileMetadata) => {
		const bounds = metadata.bounds.split(',').map((val) => Number(val));
		return new LngLatBounds([bounds[0], bounds[1]], [bounds[2], bounds[3]]);
	};
}
