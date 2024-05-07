import type {
	SourceSpecification,
	FillLayerSpecification,
	LineLayerSpecification,
	ExpressionSpecification,
	PointLike
} from 'maplibre-gl';
import { admin } from '../stores';
import { get } from 'svelte/store';
import { map as mapStore } from '../stores';
import { MapStyles } from '$lib/config/AppConfig';

const ADM_ID = 'admin';
const ADM0_ID = 'admin0';
let adminLevel = 0;
let hoveredStateId: string;
let choropleth = true;
let opacity = 0.8;
let azureUrl = '';
let year = '2020';
let scaleColorList: string[] = [];
let adminLabelsLoaded: boolean = true;
let colorExpression;

export const setAzureUrl = (url: string) => {
	azureUrl = url;
};

export const setTargetTear = (value: number) => {
	year = `${value}`;
};

export const getChoropleth = () => choropleth;

export const setOpacity = (value: number) => {
	opacity = value;
};

const getAdminLevel = () => {
	const map = get(mapStore);
	const zoom = map.getZoom();
	if (zoom < 3) return 0;
	if (zoom < 4) return 1;
	if (zoom < 5) return 2;
	if (zoom < 6) return 3;
	return 4;
};

const getAdminLayer = () => {
	return `adm${adminLevel}_polygons`;
};

export const onInteraction = () => {
	const map = get(mapStore);
	map.on('mousemove', ADM_ID, onMouseMove);
	map.on('mouseleave', ADM_ID, onMouseLeave);
};

export const offInteraction = () => {
	const map = get(mapStore);
	map.off('mousemove', ADM_ID, onMouseMove);
	map.off('mouseleave', ADM_ID, onMouseLeave);
};

const onMouseMove = (e) => {
	const map = get(mapStore);
	if (e.features.length > 0) {
		if (hoveredStateId) {
			map.setFeatureState(
				{
					source: ADM_ID,
					sourceLayer: getAdminLayer(),
					id: hoveredStateId
				},
				{ hover: false }
			);
			admin.set({});
		}

		const adminLevel = getAdminLevel();
		hoveredStateId = e.features[0][`adm${adminLevel}_id`];

		if (hoveredStateId) {
			map.setFeatureState(
				{
					source: ADM_ID,
					sourceLayer: getAdminLayer(),
					id: hoveredStateId
				},
				{ hover: true }
			);
		}

		admin.set(e.features[0].properties);
	}
};

const onMouseLeave = () => {
	const map = get(mapStore);
	if (hoveredStateId) {
		map.setFeatureState(
			{
				source: ADM_ID,
				sourceLayer: getAdminLayer(),
				id: hoveredStateId
			},
			{ hover: false }
		);
		admin.set({});
	}
	hoveredStateId = null;
};

const onZoom = ({ originalEvent }) => {
	const map = get(mapStore);
	if (!originalEvent) return;
	loadAdmin(choropleth);

	adminLevel = getAdminLevel();
	const point: PointLike = [originalEvent.layerX, originalEvent.layerY];
	const features = map.queryRenderedFeatures(point, { layers: [ADM_ID] });
	if (features.length > 0) onMouseMove({ features });

	map.setPaintProperty(ADM_ID, 'fill-opacity', opacity);
	reloadAdmin(scaleColorList, adminLabelsLoaded, colorExpression);
};

const loadAdmin0 = () => {
	const map = get(mapStore);
	const adminLevel = getAdminLevel();
	const promoteId = `adm${adminLevel}_id`;

	const layerSource: SourceSpecification = {
		type: 'vector',
		maxzoom: 10,
		promoteId: promoteId,
		tiles: [`${azureUrl}/admin/adm0_polygons/{z}/{x}/{y}.pbf`]
	};
	const layerLine: LineLayerSpecification = {
		id: ADM0_ID,
		type: 'line',
		source: ADM0_ID,
		'source-layer': 'adm0_polygons',
		paint: {
			'line-color': 'hsla(0, 0%, 100%, 0.9)'
		},
		filter: ['has', 'hrea_2020']
	};
	map.addSource(ADM0_ID, layerSource);
	map.addLayer(layerLine);
};

export const loadAdmin = (isChoropleth: boolean) => {
	const map = get(mapStore);
	choropleth = isChoropleth;
	adminLevel = getAdminLevel();
	unloadAdmin();
	if (choropleth) loadAdminChoropleth();
	else loadAdminHover();
	onInteraction();
	map.on('zoom', onZoom);
};

export const reloadAdmin = (
	colorScales: string[],
	loadAdminLabels: boolean = true,
	newColorExpression?
) => {
	scaleColorList = colorScales ? colorScales : [];
	adminLabelsLoaded = loadAdminLabels;
	colorExpression = newColorExpression;
	console.log(colorExpression);

	const map = get(mapStore);
	if (choropleth) {
		map.setPaintProperty(
			ADM_ID,
			'fill-color',
			getFillColor(colorScales, undefined, colorExpression)
		);
		const mapZoom = map.getZoom();
		const labelId = // TODO: change to dynamic param name
			mapZoom <= 1.9
				? 'place_continent'
				: mapZoom >= 2 && mapZoom <= 3.9
					? 'place_country_1'
					: 'place_city_dot_r2';
		if (loadAdminLabels) {
			const layer = MapStyles[0].style.layers.find((i) => i.id === labelId);
			map.getLayer(labelId) && map.removeLayer(labelId);
			map.addLayer(layer);
		} else {
			map.getLayer(labelId) && map.removeLayer(labelId);
		}
	}
};

export const unloadAdmin = () => {
	const map = get(mapStore);
	offInteraction();
	map.off('zoom', onZoom);
	map.getLayer(ADM0_ID) && map.removeLayer(ADM0_ID);
	map.getSource(ADM0_ID) && map.removeSource(ADM0_ID);
	map.getLayer(ADM_ID) && map.removeLayer(ADM_ID);
	map.getSource(ADM_ID) && map.removeSource(ADM_ID);
};

const getFillColor = (
	colorScales?: string[],
	property: string = `hrea_${year}`,
	colorExpression?: ExpressionSpecification
) => {
	const defaultColors = colorScales
		? colorScales
		: ['#d7191c', '#fdae61', '#ffffbf', '#abd9e9', '#2c7bb6'];

	const defaultProperty = property || `hrea_${year};`;

	const defaultExpression = colorExpression || [
		'case',
		['==', ['get', defaultProperty], null],
		'hsla(0, 0%, 0%, 0)',
		[
			'interpolate',
			['linear'],
			['get', property],
			0,
			['to-color', defaultColors[0]],
			0.25,
			['to-color', defaultColors[1]],
			0.5,
			['to-color', defaultColors[2]],
			0.75,
			['to-color', defaultColors[3]],
			1,
			['to-color', defaultColors[4]]
		]
	];

	return defaultExpression;
};

const loadAdminChoropleth = () => {
	const map = get(mapStore);
	const lvl = getAdminLevel();
	let maxzoom = 0;
	if (lvl == 1) {
		maxzoom = 6;
	}
	if (lvl == 2) {
		maxzoom = 9;
	}
	if (lvl == 3) {
		maxzoom = 11;
	}
	if (lvl == 4) {
		maxzoom = 12;
	}

	const layerSource: SourceSpecification = {
		type: 'vector',
		maxzoom: 10,
		promoteId: `adm${lvl}_id`,
		tiles: [`${azureUrl}/admin/adm${lvl}_polygons/{z}/{x}/{y}.pbf`]
	};
	const layerFill: FillLayerSpecification = {
		id: ADM_ID,
		type: 'fill',
		source: ADM_ID,
		'source-layer': `adm${lvl}_polygons`,

		maxzoom: maxzoom,
		paint: {
			'fill-color': getFillColor(),
			'fill-opacity': 0.9,
			'fill-outline-color': [
				'case',
				['boolean', ['feature-state', 'hover'], false],
				'hsla(0, 0%, 0%, 1)',
				'hsla(0, 0%, 100%, 0.5)'
			]
		}
	};
	map.addSource(ADM_ID, layerSource);
	map.getLayer(ADM_ID) && map.removeLayer(ADM_ID);
	map.addLayer(layerFill);
	loadAdmin0();
};

const loadAdminHover = () => {
	const map = get(mapStore);
	const lvl = getAdminLevel();
	const layerSource: SourceSpecification = {
		type: 'vector',
		maxzoom: 10,
		promoteId: `adm${lvl}_id`,
		tiles: [`${azureUrl}/admin/adm${lvl}_polygons/{z}/{x}/{y}.pbf`]
	};
	const layerFill: FillLayerSpecification = {
		id: ADM_ID,
		type: 'fill',
		source: ADM_ID,
		'source-layer': `adm${lvl}_polygons`,
		paint: {
			'fill-color': [
				'case',
				['boolean', ['feature-state', 'hover'], false],
				'hsla(0, 0%, 0%, 0.05)',
				'hsla(0, 0%, 0%, 0)'
			],
			'fill-outline-color': [
				'case',
				['boolean', ['feature-state', 'hover'], false],
				'hsla(0, 0%, 0%, 1)',
				'hsla(0, 0%, 0%, 0)'
			]
		}
	};
	map.addSource(ADM_ID, layerSource);
	map.addLayer(layerFill);
};
