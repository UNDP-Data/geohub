import { v4 as uuidv4 } from 'uuid';
import type { DatasetFeature, VectorLayerSpecification, VectorTileMetadata } from './types';
import { LngLatBounds, type Map } from 'maplibre-gl';
import chroma from 'chroma-js';
import { getDefaltLayerStyle } from './helper';

export class VectorTileData {
	private feature: DatasetFeature;
	private metadata: VectorTileMetadata;

	constructor(feature: DatasetFeature, metadata?: VectorTileMetadata) {
		this.feature = feature;
		this.metadata = metadata;
	}

	public getMetadata = async () => {
		const tags: [{ key: string; value: string }] = this.feature.properties.tags as unknown as [
			{ key: string; value: string }
		];
		const type = tags ? tags.find((tag) => tag.key === 'type') : undefined;
		const metadataUrl = this.feature.properties.links.find((l) => l.rel === 'metadatajson').href;
		let data: VectorTileMetadata = this.metadata;
		if (!data) {
			const res = await fetch(metadataUrl);
			data = await res.json();
		}
		this.metadata = data;
		return {
			metadata: data,
			type: type,
			url: metadataUrl
		};
	};

	public setMetadata = (metadata: VectorTileMetadata) => {
		this.metadata = metadata;
	};

	public add = async (
		map?: Map,
		layerType?: 'point' | 'heatmap' | 'polygon' | 'linestring',
		targetLayer?: string
	) => {
		const vectorInfo = await this.getMetadata();

		const tileSourceId = this.feature.properties.id;
		const selectedLayerId = targetLayer ?? vectorInfo.metadata.json.vector_layers[0].id;
		const layerId = uuidv4();

		let maplibreLayerType: 'fill' | 'line' | 'symbol' | 'circle' | 'heatmap';

		const selectedLayer = vectorInfo.metadata.json.tilestats.layers.find(
			(l) => l.layer === selectedLayerId
		);
		const geomType = layerType ?? selectedLayer.geometry.toLocaleLowerCase();
		if (geomType === 'point' || geomType === 'multipoint') {
			maplibreLayerType = 'symbol';
		} else if (geomType === 'linestring' || geomType === 'multilinestring') {
			maplibreLayerType = 'line';
		} else if (geomType === 'heatmap') {
			maplibreLayerType = 'heatmap';
		} else if (geomType === 'polygon' || geomType === 'multipolygon') {
			maplibreLayerType = 'fill';
		}
		// check and restore from saved layer style
		const savedLayerStyle = await getDefaltLayerStyle(
			this.feature,
			selectedLayerId,
			maplibreLayerType
		);

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
			map.fitBounds(this.getLayerBounds());
		}

		const color: string =
			layerSpec.type === 'symbol'
				? this.getVectorDefaultColor(layerSpec, 'icon-color')
				: layerSpec.type === 'fill'
				? this.getVectorDefaultColor(layerSpec, 'fill-color')
				: layerSpec.type === 'line'
				? this.getVectorDefaultColor(layerSpec, 'line-color')
				: undefined;
		return {
			layer: layerSpec,
			source: sourceSpec,
			sourceId: tileSourceId,
			metadata: this.metadata,
			color: color,
			colormap_name: savedLayerStyle.colormap_name,
			classification_method: savedLayerStyle.classification_method
		};
	};

	private getLayerBounds = () => {
		const bounds = this.metadata.bounds.split(',').map((val) => Number(val));
		return new LngLatBounds([bounds[0], bounds[1]], [bounds[2], bounds[3]]);
	};

	private getVectorDefaultColor = (
		layerStyle: VectorLayerSpecification,
		property: 'icon-color' | 'fill-color' | 'fill-outline-color' | 'line-color'
	): string => {
		let color = layerStyle.paint[property];
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (
			!color ||
			(color && (color.type === 'interval' || (color && color.type === 'categorical')))
		) {
			color = chroma.random().hex();
		}
		return color as string;
	};
}
