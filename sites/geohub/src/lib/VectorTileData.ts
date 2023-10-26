import { v4 as uuidv4 } from 'uuid';
import type { DatasetFeature, VectorLayerSpecification, VectorTileMetadata } from './types';
import { LngLatBounds, type Map, type VectorSourceSpecification } from 'maplibre-gl';
import chroma from 'chroma-js';
import { getDefaltLayerStyle } from './helper';

export class VectorTileData {
	private feature: DatasetFeature;
	private url: string;
	private metadata: VectorTileMetadata;
	private defaultLineWidth: number;
	private defaultLineDashArray: number[];
	private defaultIconImage: string;
	private defaultIconSize: number;
	private iconOverlap: 'never' | 'always' | 'cooperative';
	private layerOpacity: number;

	constructor(
		feature: DatasetFeature,
		defaultLineWidth: number,
		defaultLineDashArray: number[],
		metadata?: VectorTileMetadata,
		defaultIconImage?: string,
		defaultIconSize?: number,
		iconOverlap?: 'never' | 'always' | 'cooperative',
		layerOpacity?: number
	) {
		this.feature = feature;
		this.url = feature.properties.url;
		this.metadata = metadata;
		this.defaultLineWidth = defaultLineWidth;
		this.defaultLineDashArray = defaultLineDashArray;
		this.defaultIconImage = defaultIconImage;
		this.defaultIconSize = defaultIconSize;
		this.iconOverlap = iconOverlap;
		this.layerOpacity = layerOpacity;
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
		defaultColor?: string,
		targetLayer?: string
	) => {
		const vectorInfo = await this.getMetadata();

		const tileSourceId = this.feature.properties.id;
		const selectedLayerId = targetLayer ?? vectorInfo.metadata.json.vector_layers[0].id;
		const layerId = uuidv4();

		let maplibreLayerType: 'fill' | 'line' | 'symbol' | 'circle' | 'heatmap';
		if (layerType === 'point') {
			maplibreLayerType = 'symbol';
		} else if (layerType === 'linestring') {
			maplibreLayerType = 'line';
		} else if (layerType === 'heatmap') {
			maplibreLayerType = 'heatmap';
		} else if (layerType === 'polygon') {
			maplibreLayerType = 'fill';
		}
		// check and restore from saved layer style
		if (map && targetLayer && maplibreLayerType) {
			const savedLayerStyle = await getDefaltLayerStyle(
				this.feature,
				selectedLayerId,
				maplibreLayerType
			);
			if (savedLayerStyle) {
				const layerSpec = JSON.parse(
					JSON.stringify(savedLayerStyle.style)
						.replace('{source_id}', tileSourceId)
						.replace('{layer_id}', layerId)
				);
				const sourceSpec = JSON.parse(JSON.stringify(savedLayerStyle.source));

				if (!map.getSource(tileSourceId)) {
					map.addSource(tileSourceId, sourceSpec);
				}
				if (!map.getLayer(layerSpec.id)) {
					map.addLayer(layerSpec);
				}
				map.fitBounds(this.getLayerBounds());

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
					color: color
				};
			}
		}

		// if no saved layer style, create new layer style

		const selectedLayer = vectorInfo.metadata.json.tilestats.layers.find(
			(l) => l.layer === selectedLayerId
		);

		const maxzoom = Number(
			vectorInfo.metadata.maxzoom && vectorInfo.metadata.maxzoom <= 24
				? vectorInfo.metadata.maxzoom
				: 24
		);
		const isPmtiles = this.url.startsWith('pmtiles://');
		let source: VectorSourceSpecification;
		if (vectorInfo.type && ['pgtileserv', 'martin'].includes(vectorInfo.type.value)) {
			source = {
				type: 'vector',
				url: this.feature.properties.links.find((l) => l.rel === 'tilejson').href
			};
		} else if (isPmtiles) {
			source = {
				type: 'vector',
				url: this.url,
				attribution: vectorInfo.metadata.attribution
			};
		} else {
			source = {
				type: 'vector',
				tiles: [this.url],
				attribution: vectorInfo.metadata.attribution,
				minzoom: 0,
				maxzoom: maxzoom
			};
		}

		if (map && !map.getSource(tileSourceId)) {
			map.addSource(tileSourceId, source);
		}

		let layer: VectorLayerSpecification;

		const geomType = layerType ?? selectedLayer.geometry;
		const color = defaultColor ? chroma(defaultColor) : chroma.random();
		switch (geomType.toLocaleLowerCase()) {
			case 'point':
			case 'multipoint':
				layer = {
					id: layerId,
					type: 'symbol',
					source: tileSourceId,
					'source-layer': selectedLayerId,
					layout: {
						visibility: 'visible',
						'icon-image': this.defaultIconImage ?? 'circle',
						'icon-size': this.defaultIconSize ?? 1,
						'icon-overlap': this.iconOverlap ?? 'never'
					},
					paint: {
						'icon-color': color.hex(),
						'icon-opacity': this.layerOpacity ?? 1
					}
				};
				break;
			case 'linestring':
			case 'multilinestring':
				layer = {
					id: layerId,
					type: 'line',
					source: tileSourceId,
					'source-layer': selectedLayerId,
					layout: {
						visibility: 'visible',
						'line-cap': 'round',
						'line-join': 'round'
					},
					paint: {
						'line-color': color.hex(),
						'line-width': this.defaultLineWidth,
						'line-opacity': this.layerOpacity ?? 1
					}
				};
				if (this.defaultLineDashArray) {
					layer.paint['line-dasharray'] = this.defaultLineDashArray;
				}
				break;
			case 'polygon':
			case 'multipolygon':
				layer = {
					id: layerId,
					type: 'fill',
					source: tileSourceId,
					'source-layer': selectedLayerId,
					layout: {
						visibility: 'visible'
					},
					paint: {
						'fill-color': color.hex(),
						'fill-outline-color': color.darken(2.6).hex(),
						'fill-opacity': this.layerOpacity ?? 1
					}
				};
				break;
			case 'heatmap':
				layer = {
					id: layerId,
					type: 'heatmap',
					source: tileSourceId,
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
						'heatmap-opacity': this.layerOpacity ?? 1,
						'heatmap-radius': 30,
						'heatmap-weight': 1
					}
				};
				break;
			default:
				return;
		}
		layer.minzoom = 0;
		// layer.maxzoom = maxzoom

		if (map) {
			map.addLayer(layer);
			map.fitBounds(this.getLayerBounds());
		}

		return {
			layer,
			source,
			sourceId: tileSourceId,
			metadata: vectorInfo.metadata,
			color: color.hex()
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
