import type { UserConfig } from '$lib/config/DefaultUserConfig';
import type {
	DatasetDefaultLayerStyle,
	DatasetFeature,
	VectorLayerSpecification,
	VectorLayerTypes,
	VectorTileMetadata
} from '$lib/types';
import type { VectorSourceSpecification } from 'maplibre-gl';
import type { DefaultStyleTemplate } from './DefaultStyleTemplate';
import chroma from 'chroma-js';
import { LineTypes } from '$lib/config/AppConfig/LineTypes';

export default class VectorDefaultStyle implements DefaultStyleTemplate {
	dataset: DatasetFeature;
	metadata: VectorTileMetadata;
	config: UserConfig;
	targetLayer: string;
	layerType: VectorLayerTypes;

	constructor(dataset: DatasetFeature, config: UserConfig, targetLayer: string, layerType: string) {
		this.dataset = dataset;
		this.config = config;
		this.targetLayer = targetLayer;
		this.layerType = layerType as VectorLayerTypes;
	}

	public create = async (colormap_name?: string) => {
		this.metadata = await this.getMetadata();
		const selectedLayerId = this.targetLayer ?? this.metadata.json.vector_layers[0].id;

		const maxzoom = Number(
			this.metadata.maxzoom && this.metadata.maxzoom <= 24 ? this.metadata.maxzoom : 24
		);
		const url = this.dataset.properties.url;
		const isPmtiles = url.startsWith('pmtiles://');
		let source: VectorSourceSpecification;

		const type = this.dataset.properties.tags?.find((tag) => tag.key === 'type');

		if (type && ['pgtileserv', 'martin'].includes(type.value)) {
			source = {
				type: 'vector',
				url: this.dataset.properties.links.find((l) => l.rel === 'tilejson').href
			};
		} else if (isPmtiles) {
			source = {
				type: 'vector',
				url: url,
				attribution: this.metadata.attribution
			};
		} else {
			source = {
				type: 'vector',
				tiles: [url],
				attribution: this.metadata.attribution,
				minzoom: 0,
				maxzoom: maxzoom
			};
		}

		let layer: VectorLayerSpecification;

		const color = chroma.random();
		const opacity = this.config.LayerOpacity / 100;
		const linePattern = LineTypes.find((t) => t.title === this.config.LinePattern).value;
		switch (this.layerType) {
			case 'symbol':
				layer = {
					id: '{layer_id}',
					type: 'symbol',
					source: '{source_id}',
					'source-layer': selectedLayerId,
					layout: {
						visibility: 'visible',
						'icon-image': this.config.IconImage ?? 'circle',
						'icon-size': this.config.IconSize ?? 1,
						'icon-overlap': this.config.IconOverlapPriority ?? 'never'
					},
					paint: {
						'icon-color': color.hex(),
						'icon-opacity': opacity
					}
				};
				break;
			case 'line':
				layer = {
					id: '{layer_id}',
					type: 'line',
					source: '{source_id}',
					'source-layer': selectedLayerId,
					layout: {
						visibility: 'visible',
						'line-cap': 'round',
						'line-join': 'round'
					},
					paint: {
						'line-color': color.hex(),
						'line-width': this.config.LineWidth,
						'line-opacity': opacity
					}
				};
				if (!(typeof linePattern === 'string' && linePattern === '')) {
					layer.paint['line-dasharray'] = linePattern as number[];
				}
				break;
			case 'fill':
				layer = {
					id: '{layer_id}',
					type: 'fill',
					source: '{source_id}',
					'source-layer': selectedLayerId,
					layout: {
						visibility: 'visible'
					},
					paint: {
						'fill-color': color.hex(),
						'fill-outline-color': color.darken(2.6).hex(),
						'fill-opacity': opacity
					}
				};
				break;
			case 'fill-extrusion':
				layer = {
					id: '{layer_id}',
					type: 'fill-extrusion',
					source: '{source_id}',
					'source-layer': selectedLayerId,
					layout: {
						visibility: 'visible'
					},
					paint: {
						'fill-extrusion-base': 0,
						'fill-extrusion-color': color.hex(),
						'fill-extrusion-height': 10,
						'fill-extrusion-opacity': opacity,
						'fill-extrusion-translate': [0, 0],
						'fill-extrusion-translate-anchor': 'map',
						'fill-extrusion-vertical-gradient': true
					}
				};
				break;
			case 'heatmap':
				layer = {
					id: '{layer_id}',
					type: 'heatmap',
					source: '{source_id}',
					'source-layer': selectedLayerId,
					layout: {
						visibility: 'visible'
					},
					paint: {
						'heatmap-color': [
							'interpolate',
							['linear'],
							['heatmap-density'],
							0,
							'rgba(0, 0, 255, 0)',
							0.1,
							'rgb(0,0,255)',
							0.3,
							'rgb(0,255,255)',
							0.5,
							'rgb(0,255,0)',
							0.7,
							'rgb(255,255,0)',
							1,
							'rgb(255,0,0)'
						],
						'heatmap-intensity': 1,
						'heatmap-opacity': opacity,
						'heatmap-radius': 30,
						'heatmap-weight': 1
					}
				};
				break;
			case 'circle':
				layer = {
					id: '{layer_id}',
					type: 'circle',
					source: '{source_id}',
					'source-layer': selectedLayerId,
					layout: {
						visibility: 'visible'
					},
					paint: {
						'circle-blur': 0,
						'circle-opacity': opacity,
						'circle-color': color.hex(),
						'circle-radius': 5,
						'circle-stroke-color': '#000000',
						'circle-stroke-opacity': opacity,
						'circle-stroke-width': 0
					}
				};
				break;
			default:
				return;
		}
		layer.minzoom = 0;
		// layer.maxzoom = maxzoom

		const data: DatasetDefaultLayerStyle = {
			dataset_id: this.dataset.properties.id,
			layer_id: this.targetLayer,
			layer_type: layer.type,
			source: source,
			style: layer,
			colormap_name: colormap_name,
			classification_method: this.config.ClassificationMethod,
			classification_method_2: this.config.ClassificationMethod,
			metadata: this.metadata
		};

		return data;
	};

	public getMetadata = async () => {
		const metadataUrl = this.dataset.properties.links.find((l) => l.rel === 'metadatajson').href;
		let data: VectorTileMetadata = this.metadata;
		if (!data) {
			const res = await fetch(metadataUrl);
			data = await res.json();
		}
		this.metadata = data;
		return this.metadata;
	};
}
