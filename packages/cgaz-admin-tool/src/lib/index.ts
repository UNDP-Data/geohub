import type {
	ControlPosition,
	FillLayerSpecification,
	IControl,
	MapMouseEvent,
	Map as MaplibreMap,
	SourceSpecification
} from 'maplibre-gl';

/**
 * MaplibreAdminControl Options
 */
export interface Options {
	/**
	 * URL for CGAZ PMTiles
	 */
	url?: string;
	/**
	 * Attribution for CGAZ
	 */
	attribution?: string;

	/**
	 * If true, hovering by feature ID will be enabled. Default is true.
	 */
	isHover?: boolean;

	/**
	 * Source ID for maplibre. Default is "cgaz"
	 */
	sourceId?: string;

	/**
	 * layer ID for maplibre. Default is "cgaz"
	 */
	layerId?: string;

	/**
	 * source-layer property value for maplibre. Default is "admin"
	 */
	sourceLayer?: string;

	/**
	 * FeatureState ID. Default is "id"
	 */
	featureId?: string;

	/**
	 * Max zoom level of CGAZ PMTiles. Default is 10
	 */
	maxZoom?: number;

	/**
	 * Range of admin levels covered. Default is [0, 2] (level 0 to 2)
	 */
	adminRange?: number[];

	/**
	 * field name of administrative boundaries. Default is "admin{level}_name". {level} is replaced with admin level.
	 */
	adminName?: string;

	/**
	 * fill-color property value for CGAZ polygon layer. Default is 'hsla(0, 0%, 0%, 0.25)'
	 */
	fillColor?: string;

	/**
	 * fill-outline-color property value for CGAZ polygon layer. Default is 'hsla(0, 0%, 0%, 1)'
	 */
	fillOutlineColor?: string;
}

/**
 * CGAZ Admin control for Maplibre GL JS
 */
export default class MaplibreCgazAdminControl implements IControl {
	private controlContainer?: HTMLElement;
	private locationContainer?: HTMLDivElement;
	private map?: MaplibreMap;
	private hoveredStateId?: string | number;

	/**
	 * Default values for Options
	 */
	private options: Options = {
		url: 'https://undpngddlsgeohubdev01.blob.core.windows.net/admin/cgaz-geoboundaries.pmtiles',
		attribution: `Administrative boundaries courtesy of <a href= 'https://www.geoboundaries.org'>geoBoundaries</a>`,
		isHover: true,
		sourceId: 'cgaz',
		layerId: 'cgaz',
		sourceLayer: 'admin',
		featureId: 'id',
		maxZoom: 10,
		adminRange: [0, 2],
		adminName: 'admin{level}_name',
		fillColor: 'hsla(0, 0%, 0%, 0.25)',
		fillOutlineColor: 'hsla(0, 0%, 0%, 1)'
	};

	constructor(options: Options) {
		if (options) {
			this.options = Object.assign(this.options, options);
		}
	}

	public getDefaultPosition(): ControlPosition {
		const defaultPosition = 'top-left';
		return defaultPosition;
	}

	public onAdd(map: MaplibreMap): HTMLElement {
		this.map = map;
		this.controlContainer = document.createElement('div');
		this.controlContainer.classList.add('maplibregl-ctrl');

		this.locationContainer = document.createElement('div');
		this.locationContainer.classList.add('maplibregl-admin-control');
		this.locationContainer.classList.add('hidden');

		this.controlContainer.appendChild(this.locationContainer);

		this.map?.once('load', this.initialiseCGAZ.bind(this));

		return this.controlContainer;
	}

	public onRemove(): void {
		if (!this.controlContainer || !this.controlContainer.parentNode || !this.map) {
			return;
		}
		this.removeCGAZ();
		this.controlContainer.parentNode.removeChild(this.controlContainer);
		this.map = undefined;
	}

	private initialiseCGAZ(): void {
		if (!this.map) return;
		if (!this.options.sourceId) return;
		if (!this.options.layerId) return;
		if (!this.options.fillColor) return;
		if (!this.options.fillOutlineColor) return;
		const source: SourceSpecification = {
			type: 'vector',
			url: `pmtiles://${this.options.url}`,
			attribution: this.options.attribution,
			promoteId: this.options.featureId
		};

		if (!this.map.getSource(this.options.sourceId)) {
			this.map.addSource(this.options.sourceId, source);
		}

		const layer: FillLayerSpecification = {
			id: this.options.layerId,
			type: 'fill',
			source: this.options.sourceId,
			'source-layer': this.options.sourceLayer,
			paint: {
				'fill-color': [
					'case',
					['boolean', ['feature-state', 'hover'], false],
					this.options.fillColor,
					'hsla(0, 0%, 0%, 0)'
				],
				'fill-outline-color': [
					'case',
					['boolean', ['feature-state', 'hover'], false],
					this.options.fillOutlineColor,
					'hsla(0, 0%, 0%, 0)'
				]
			}
		};

		if (!this.map.getLayer(this.options.layerId)) {
			this.map.addLayer(layer);
		}

		this.map.on('mousemove', this.options.layerId, this.onMouseMove.bind(this));
		this.map.on('mouseleave', this.options.layerId, this.onMouseLeave.bind(this));
	}

	private removeCGAZ(): void {
		if (!this.map) return;
		if (!this.options.sourceId) return;
		if (!this.options.layerId) return;

		this.map.off('mousemove', this.options.layerId, this.onMouseMove.bind(this));
		this.map.off('mouseleave', this.options.layerId, this.onMouseLeave.bind(this));

		if (this.map.getLayer(this.options.layerId)) {
			this.map.removeLayer(this.options.layerId);
		}
		if (this.map.getSource(this.options.sourceId)) {
			this.map.removeSource(this.options.sourceId);
		}
	}

	private onMouseMove(e: MapMouseEvent): void {
		if (!this.map) return;
		if (!this.options.sourceId) return;
		if (!this.options.layerId) return;

		const maxzoom = this.options.maxZoom ?? 10;
		let currentZoom = this.map.getZoom();
		if (currentZoom > maxzoom) {
			currentZoom = maxzoom;
		}

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const features = e.features;
		if (features.length === 0) {
			return;
		}

		const feature = features[0];
		const props = feature.properties;

		const container = document.getElementsByClassName('maplibregl-admin-control').item(0);
		if (container && this.options.adminRange && this.options.adminName) {
			const levels = this.options.adminRange;
			container.innerHTML = '';
			for (let level = levels[0]; level <= levels[1]; level++) {
				const field = this.options.adminName.replace('{level}', `${level}`);
				const name = props[field];
				if (name) {
					container.innerHTML += `${level > 0 ? '<span class="connector">></span>' : ''}${name}`;
				}
			}
			if (container.innerHTML) {
				container.classList.remove('hidden');
			} else {
				container.classList.add('hidden');
			}
		}

		if (this.hoveredStateId) {
			this.map.setFeatureState(
				{
					source: this.options.sourceId,
					sourceLayer: this.options.sourceLayer,
					id: this.hoveredStateId
				},
				{ hover: false }
			);
		}

		this.hoveredStateId = feature.properties[this.options.featureId];

		if (!this.hoveredStateId) {
			this.hoveredStateId = feature.id;
		}

		if (this.hoveredStateId) {
			this.map.setFeatureState(
				{
					source: this.options.sourceId,
					sourceLayer: this.options.sourceLayer,
					id: this.hoveredStateId
				},
				{ hover: this.options.isHover }
			);
		}
	}

	private onMouseLeave(): void {
		if (!this.map) return;
		if (!this.options.sourceId) return;

		if (this.hoveredStateId) {
			this.map.setFeatureState(
				{
					source: this.options.sourceId,
					sourceLayer: this.options.sourceLayer,
					id: this.hoveredStateId
				},
				{ hover: false }
			);
		}
		this.hoveredStateId = undefined;

		const container = document.getElementsByClassName('maplibregl-admin-control').item(0);
		if (container) {
			container.innerHTML = '';
			container.classList.add('hidden');
		}
	}
}
