import maplibregl, {
	type ExpressionSpecification,
	type FillLayerSpecification,
	type LineLayerSpecification,
	type SourceSpecification
} from 'maplibre-gl';
import { admin, colorMap, map as mapStore } from '../stores';
import { get } from 'svelte/store';
import chroma from 'chroma-js';

const ADM_ID = 'admin';
const ADM0_ID = 'adm0';
let hoveredStateId: string;
const choropleth = true;

let adminUrl = '';
let year = '2020';

let colorExpression: ExpressionSpecification | undefined = undefined;

export const setAdminUrl = (url: string) => {
	adminUrl = url;
};

export const setTargetTear = (value: number) => {
	year = `${value}`;
};

const getAdminLevelForZoom = (zoom: number) => {
	if (zoom < 3) return 0;
	if (zoom < 7) return 1;
	return 2;
};

export const onInteraction = () => {
	const map = getMap();
	map.on('mousemove', ADM_ID, onMouseMove);
	map.on('mouseleave', ADM_ID, onMouseLeave);
};

export const offInteraction = () => {
	const map = getMap();
	map.off('mousemove', ADM_ID, onMouseMove);
	map.off('mouseleave', ADM_ID, onMouseLeave);
};

const onMouseMove = (e) => {
	const map = getMap();
	const lvl = getAdminLevelForZoom(map.getZoom());
	const promoteId = `adm${lvl}_id`;
	const sourceLayer = `adm${lvl}_polygons`;

	const feature = e.features?.[0];
	if (!feature) return;

	const featureId = feature.properties[promoteId];
	if (!featureId) return;

	if (hoveredStateId && hoveredStateId !== featureId) {
		map.setFeatureState({ source: ADM_ID, sourceLayer, id: hoveredStateId }, { hover: false });
	}

	hoveredStateId = featureId;

	map.setFeatureState({ source: ADM_ID, sourceLayer, id: hoveredStateId }, { hover: true });

	admin.set(feature.properties);
};

const onMouseLeave = () => {
	const map = getMap();
	const lvl = getAdminLevelForZoom(map.getZoom());
	const sourceLayer = `adm${lvl}_polygons`;

	if (hoveredStateId) {
		map.setFeatureState({ source: ADM_ID, sourceLayer, id: hoveredStateId }, { hover: false });
		admin.set({});
	}

	hoveredStateId = null;
};

const onZoom = async ({ originalEvent }) => {
	if (!originalEvent) return;
	loadAdmin();
};

const getMap = () => get(mapStore);

export const loadAdmin = () => {
	const map = getMap();
	const existing = map.getLayer(ADM_ID);
	if (existing) {
		map.removeLayer(ADM_ID);
		map.removeSource(ADM_ID);
	}
	loadAdminChoropleth(null);
	onInteraction();
	map.on('zoom', onZoom);
};

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const isLoaded = async (map: maplibregl.Map, checkInterval = 100, timeout = 30000) => {
	const start = Date.now();

	while (!map.loaded()) {
		if (Date.now() - start > timeout) {
			map.triggerRepaint();
		}
		await sleep(checkInterval);
	}

	return true;
};

export const upsertBivariateAdmin = (exp: ExpressionSpecification) => {
	const map = getMap();
	const existing = map.getLayer(ADM_ID);
	if (existing) {
		map.removeLayer(ADM_ID);
		map.removeSource(ADM_ID);
	}
	loadAdminChoropleth(exp);
	onInteraction();
	map.on('zoom', onZoomBivariate);
};

const onZoomBivariate = async ({ originalEvent }) => {
	if (!originalEvent) return;
	const map = getMap();
	const fillPaintProperty = map.getPaintProperty(ADM_ID, 'fill-color') as ExpressionSpecification;
	upsertBivariateAdmin(fillPaintProperty);
};

export const reloadAdmin = async () => {
	const map = getMap();
	await isLoaded(map);

	if (!map.getLayer(ADM_ID)) return;

	if (choropleth) {
		const fillColorExpression = generateFillColorExpressionFromColormap();

		if (fillColorExpression) {
			map.setPaintProperty(ADM_ID, 'fill-color', fillColorExpression);
		}
	}
};

export const unloadAdmin = () => {
	const map = getMap();
	offInteraction();
	map.off('zoom', onZoom);
	map.off('zoom', onZoomBivariate);

	map.getLayer(ADM_ID) && map.removeLayer(ADM_ID);
	map.getSource(ADM_ID) && map.removeSource(ADM_ID);
};

export const generateScaleColorList = () => {
	const cmap = get(colorMap);
	const scaleColorList = chroma.scale(cmap.value.replace('_r', '')).colors(5, 'hex');
	if (cmap.isReversed) scaleColorList.reverse();
	return scaleColorList;
};

const generateFillColorExpressionFromColormap = (property: string = `hrea_${year}`) => {
	const defaultColors = generateScaleColorList();
	const defaultProperty = property || `hrea_${year};`;
	colorExpression = [
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
	return colorExpression as ExpressionSpecification;
};

const loadAdminChoropleth = (expression: ExpressionSpecification) => {
	const map = getMap();
	const zoom = map.getZoom();
	const lvl = getAdminLevelForZoom(zoom);
	let maxzoom = 0;
	if (lvl == 1) {
		maxzoom = 7;
	}
	if (lvl == 2) {
		maxzoom = 22;
	}

	const layerSource: SourceSpecification = {
		type: 'vector',
		promoteId: `adm${lvl}_id`,
		url: `pmtiles://${adminUrl}/adm${lvl}_polygons.pmtiles`
	};
	const layerFill: FillLayerSpecification = {
		id: ADM_ID,
		type: 'fill',
		source: ADM_ID,
		'source-layer': `adm${lvl}_polygons`,

		maxzoom: maxzoom,
		paint: {
			'fill-color': expression ?? generateFillColorExpressionFromColormap(),
			'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1.0, 0.9],
			'fill-outline-color': [
				'case',
				['boolean', ['feature-state', 'hover'], false],
				'hsla(0, 0%, 0%, 1)',
				'hsla(0, 0%, 100%, 0.5)'
			]
		}
	};
	map.addSource(ADM_ID, layerSource);
	map.addLayer(layerFill);
	loadAdmin0Outline();
};

const loadAdmin0Outline = () => {
	const map = getMap();
	const ADM0_ID_OUTLINE = 'adm0-outline';
	const adminLevel = getAdminLevelForZoom(map.getZoom());
	const promoteId = `adm${adminLevel}_id`;

	const layerSource: SourceSpecification = {
		type: 'vector',
		promoteId: promoteId,
		url: `pmtiles://${adminUrl}/adm0_polygons.pmtiles`
	};
	const layerLine: LineLayerSpecification = {
		id: ADM0_ID_OUTLINE,
		type: 'line',
		source: ADM0_ID,
		'source-layer': 'adm0_polygons',
		paint: {
			'line-color': 'hsla(0, 0%, 100%, 0.9)'
		},
		filter: ['has', 'hrea_2020']
	};
	if (map.getSource(ADM0_ID)) {
		map.removeLayer(ADM0_ID_OUTLINE);
		map.removeSource(ADM0_ID);
	}
	map.addSource(ADM0_ID, layerSource);
	map.addLayer(layerLine);
};
