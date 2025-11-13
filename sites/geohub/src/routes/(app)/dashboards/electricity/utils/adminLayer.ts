import maplibregl, {
	type ExpressionSpecification,
	type FillLayerSpecification,
	type SourceSpecification
} from 'maplibre-gl';
import { admin, colorMap, map as mapStore } from '../stores';
import { get } from 'svelte/store';
import chroma from 'chroma-js';

const ADM_ID = 'admin';
// const ADM0_ID = 'admin0';
const adminLevel = 0;
let hoveredStateId: string;
const choropleth = true;
// const opacity = 0.8;
let adminUrl = '';
let year = '2020';
// let scaleColorList: string[] = [];
// let adminLabelsLoaded: boolean = true;
let colorExpression: ExpressionSpecification | undefined = undefined;

export const setAdminUrl = (url: string) => {
	adminUrl = url;
};

export const setTargetTear = (value: number) => {
	year = `${value}`;
};
// const getAdminLevel = () => {
// 	const map = get(mapStore);
// 	const zoom = map.getZoom();
// 	if (zoom < 3) return 0;
// 	if (zoom < 7) return 1;
// 	return 2;
// };

const getAdminLevelForZoom = (zoom: number) => {
	if (zoom < 3) return 0;
	if (zoom < 7) return 1;
	return 2;
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
	const zoom = map.getZoom();
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

		const adminLevel = getAdminLevelForZoom(zoom);
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

const onZoom = async ({ originalEvent }) => {
	if (!originalEvent) return;
	console.log('onZoom');
	// const map = getMap()
	// console.log(map.getLayer(ADM_ID), 'map.getLayer(ADM_ID)')
	loadAdmin();
};

// export const onZoomBivariate = async ({ originalEvent } ) => {
//     if (!originalEvent) return;
//     const map = get(mapStore);
//     const layer = map.getLayer(ADM_ID);
//     const expression = layer?.paint?.['fill-color'] as ExpressionSpecification;
// 	upsertBivariateAdmin(expression as ExpressionSpecification);
// }

const getMap = () => get(mapStore);

// const getAdminMeta = (zoom: number) => {
// 	const level = zoom < 3 ? 0 : zoom < 7 ? 1 : 2;
// 	const maxzoom = level === 1 ? 7 : level === 2 ? 22 : 3;
// 	return { level, maxzoom };
// };

// const createAdminLayer = (colorExpression?: ExpressionSpecification) => {
// 	const map = getMap();
// 	const zoom = map.getZoom();
// 	const { level, maxzoom } = getAdminMeta(zoom);
// 	adminLevel = level;
//
// 	const source: SourceSpecification = {
// 		type: 'vector',
// 		promoteId: `adm${level}_id`,
// 		url: `pmtiles://${adminUrl}/adm${level}_polygons.pmtiles`
// 	};
//
// 	const fill: FillLayerSpecification = {
// 		id: ADM_ID,
// 		type: 'fill',
// 		source: ADM_ID,
// 		'source-layer': `adm${level}_polygons`,
// 		maxzoom,
// 		paint: {
// 			'fill-color': colorExpression ?? generateFillColorExpressionFromColormap(),
// 			'fill-opacity': opacity,
// 			'fill-outline-color': [
// 				'case',
// 				['boolean', ['feature-state', 'hover'], false],
// 				'hsla(0, 0%, 0%, 1)',
// 				'hsla(0, 0%, 100%, 0.5)'
// 			]
// 		}
// 	};
//
// 	map.addSource(ADM_ID, source);
// 	map.addLayer(fill);
// };

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
			// throw new Error("Map did not finish loading within timeout.");
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
		// map.setPaintProperty(ADM_ID, 'fill-color', exp);
		// return;
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
	const map = get(mapStore);
	await isLoaded(map);

	if (!map.getLayer(ADM_ID)) return;

	if (choropleth) {
		const fillColorExpression = generateFillColorExpressionFromColormap();

		if (fillColorExpression) {
			map.setPaintProperty(ADM_ID, 'fill-color', fillColorExpression);
		}

		// const mapZoom = map.getZoom();
		// const labelId = // TODO: change to dynamic param name
		// 	mapZoom < 3
		// 		? 'place_continent'
		// 		: mapZoom >= 3 && mapZoom <= 7
		// 			? 'place_state'
		// 			: 'place_city_dot_r2';

		// if (loadAdminLabels) {
		// 	const mapLayers = map.getStyle().layers;
		// 	if (!map.getSource('carto')) {
		// 		map.addSource('carto', {
		// 			type: 'vector',
		// 			url: 'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json'
		// 		});
		// 	}
		// 	const style = MapStyles.find((i) => i.id === 'style');
		// 	const layer = style.style.layers.find((i) => i.id === labelId);
		// 	const lastLayerId = mapLayers[mapLayers.length - 1].id;
		// 	map.getLayer(labelId) && map.removeLayer(labelId);
		// 	map.addLayer(layer, lastLayerId);
		// } else {
		// 	map.getLayer(labelId) && map.removeLayer(labelId);
		// }
	}
};

export const unloadAdmin = () => {
	const map = get(mapStore);
	offInteraction();
	map.off('zoom', onZoom);
	map.off('zoom', onZoomBivariate);

	// TODO: AS we are not using admin0 outlines, we can remove the below lines
	// map.getLayer(ADM0_ID) && map.removeLayer(ADM0_ID);
	// map.getSource(ADM0_ID) && map.removeSource(ADM0_ID);
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

const loadAdminChoropleth = (expression) => {
	const map = get(mapStore);
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
	// map.getLayer(ADM_ID) && map.removeLayer(ADM_ID);
	map.addLayer(layerFill);

	// TODO: What is the need for admin0 outlines?
	// loadAdmin0Outlines();
};

// const loadAdminHover = () => {
// 	const map = get(mapStore);
// 	const lvl = getAdminLevel();
//
//
// 	const layerSource: SourceSpecification = {
// 		type: 'vector',
// 		promoteId: `adm${lvl}_id`,
// 		url: `pmtiles://${adminUrl}/adm${lvl}_polygons.pmtiles`
// 	};
//
// 	const layerFill: FillLayerSpecification = {
// 		id: ADM_ID,
// 		type: 'fill',
// 		source: ADM_ID,
// 		'source-layer': `adm${lvl}_polygons`,
// 		paint: {
// 			'fill-color': [
// 				'case',
// 				['boolean', ['feature-state', 'hover'], false],
// 				'hsla(0, 0%, 0%, 0.05)',
// 				'hsla(0, 0%, 0%, 0)'
// 			],
// 			'fill-outline-color': [
// 				'case',
// 				['boolean', ['feature-state', 'hover'], false],
// 				'hsla(0, 0%, 0%, 1)',
// 				'hsla(0, 0%, 0%, 0)'
// 			]
// 		}
// 	};
// 	map.addSource(ADM_ID, layerSource);
// 	map.addLayer(layerFill);
// };
