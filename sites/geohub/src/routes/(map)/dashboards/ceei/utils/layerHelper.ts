import { get } from 'svelte/store';
import { map as mapStore, layers as layersStore, mapPopup as popupStore } from '../stores';
import Papa from 'papaparse';
import type { Layer } from '../stores';
import { type GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import Joi from 'joi';
import { toast } from '@zerodevx/svelte-toast';
import chroma from 'chroma-js';
import _ from 'lodash';
import PopupTable from '../components/PopupTable.svelte';

export const headerMapping = {
	shapeID: 'adminid',
	uName: 'District Name',
	rwi: 'Relative Wealth Index',
	pvout: 'Solar Power Potential',
	windspeed: 'Wind Speed',
	geo_pot: 'Geothermal Power Potential',
	hydro_pot: 'Hydro Power Potential',
	eletdens: 'Grid Density',
	emission: 'GHG Emissions',
	accesselect: 'Access to electricity',
	educ: 'Education Index',
	loans: 'Households with access to loans from commercial banks',
	netimports: 'Net Electricity Imports',
	jobsRE: 'Jobs in Renewable Energy Sector',
	ffshare: 'Fossil Fuel Share on Energy Capacity and Generation',
	invest: 'Public and foreign (aid) investments on renewable energy'
};

const ceeiRowObject = {
	adminid: Joi.string(),
	'Relative Wealth Index': Joi.number(),
	'Solar Power Potential': Joi.number(),
	'District Name': Joi.string(),
	'Wind Speed': Joi.number(),
	'Grid Density': Joi.number(),
	'GHG Emissions': Joi.number(),
	'Access to electricity': Joi.number(),
	'Households with access to loans from commercial banks': Joi.number(),
	'Net Electricity Imports': Joi.number(),
	'Jobs in Renewable Energy Sector': Joi.number(),
	'Fossil Fuel Share on Energy Capacity and Generation': Joi.number(),
	'Public and foreign (aid) investments on renewable energy': Joi.number(),
	'Education Index': Joi.number(),
	'Geothermal Power Potential': Joi.number(),
	'Hydro Power Potential': Joi.number(),
	Country: Joi.string()
};
const ceeiRowSchema = Joi.object(ceeiRowObject).options({ presence: 'required' });

let featureClickEventHandler;
const updateMapInteraction = () => {
	if (!get(mapStore) || !get(layersStore) || !get(popupStore)) return;

	const map = get(mapStore);
	const layers = get(layersStore);
	const popup = get(popupStore);

	const visibleLayer = layers.find((l) => l.isVisible);
	if (visibleLayer) {
		map.on('mouseenter', visibleLayer.layerId, () => (map.getCanvas().style.cursor = 'pointer'));
		map.on('mouseleave', visibleLayer.layerId, () => (map.getCanvas().style.cursor = ''));
		if (featureClickEventHandler) {
			map.off('click', featureClickEventHandler);
		}

		featureClickEventHandler = (e) => {
			const layerFeatures = map.queryRenderedFeatures(e.point, {
				layers: layers.map((l) => l.layerId)
			});

			if (layerFeatures.length) {
				const [{ id }] = layerFeatures;
				const htmlTable = `<div class="popup-container" id="ceei-popup-details"></div>`;

				popup.setLngLat(e.lngLat).setHTML(htmlTable).setMaxWidth('500px').addTo(map);
				new PopupTable({
					target: document.querySelector('#ceei-popup-details'),
					props: {
						id
					}
				});
			} else {
				popup.remove();
			}
		};

		map.on('click', featureClickEventHandler);
	}
};

export const addLayer = (layer: Layer) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const map = get(mapStore);
	const layers = get(layersStore);

	layersStore.set([...layers, layer]);

	map.addSource(layer.sourceId, layer.source);

	map.once('sourcedata', (e) => {
		const waiting = () => {
			if (e.sourceId === layer.sourceId && e.isSourceLoaded) {
				const source = map.getSource(e.sourceId) as GeoJSONSource;
				source.updateData({
					update: layer.data.map(({ adminid: id, ...features }) => {
						return {
							id,
							addOrUpdateProperties: Object.entries(features).map(([key, value]) => {
								return { key, value };
							})
						};
					})
				});

				const layers = get(layersStore);
				const layerIndex = layers.findIndex((l) => l.sourceId === layer.sourceId);
				if (layerIndex === -1) return;
				layers[layerIndex].isDataLoaded = true;
				layersStore.set(layers);
				map.addLayer(layer.layer);

				updateMapInteraction();
			} else {
				setTimeout(waiting, 200);
			}
		};
		waiting();
	});
};

export const applyLayerSimulation = (index, sliders, multiplierMap) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const map = get(mapStore);
	const layers = get(layersStore);

	layers[index].sliders = sliders;
	layers[index].muliplierMap = multiplierMap;
	/* eslint-disable @typescript-eslint/no-explicit-any */
	let CeeiExpression: any = ['get', 'CEEI'];
	if (multiplierMap) {
		CeeiExpression = [
			'+',
			['*', ['get', 'Solar Power Potential'], multiplierMap['Solar Power Potential']],
			['*', ['get', 'Wind Speed'], multiplierMap['Wind Speed']],
			['*', ['get', 'Geothermal Power Potential'], multiplierMap['Geothermal Power Potential']],
			['*', ['get', 'Hydro Power Potential'], multiplierMap['Hydro Power Potential']],
			[
				'*',
				['get', 'Jobs in Renewable Energy Sector '],
				multiplierMap['Jobs in Renewable Energy Sector ']
			],
			['*', ['get', 'Education Index'], multiplierMap['Education Index']],
			['*', ['get', 'Access to electricity'], multiplierMap['Access to electricity']],
			[
				'*',
				['get', 'Public and foreign (aid) investments on renewable energy'],
				multiplierMap['Public and foreign (aid) investments on renewable energy']
			],
			[
				'*',
				['get', 'Households with access to loans from commercial banks'],
				multiplierMap['Households with access to loans from commercial banks']
			],
			['*', ['get', 'Relative Wealth Index'], multiplierMap['Relative Wealth Index']],
			['*', ['get', 'Grid Density'], multiplierMap['Grid Density']],
			['*', ['get', 'GHG emissions'], multiplierMap['GHG emissions']],
			['*', ['get', 'Net Electricity Imports'], multiplierMap['Net Electricity Imports']],
			[
				'*',
				['get', 'Fossil Fuel Share on Energy Capacity and Generation'],
				multiplierMap['Fossil Fuel Share on Energy Capacity and Generation']
			]
		];
	}

	const simulateExpression = [
		'interpolate-hcl',
		['linear'],
		CeeiExpression,
		0,
		'#a50026',
		0.25,
		'#f46d43',
		0.5,
		'#fee090',
		0.75,
		'#e0f3f8',
		1,
		'#74add1'
	];

	layers[index].layer.paint['fill-color'] = simulateExpression;
	map.setPaintProperty(layers[index].layerId, 'fill-color', simulateExpression);
	layersStore.set(layers);
};

export const deleteLayer = (index: number) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const map = get(mapStore);
	const layers = get(layersStore);

	map.removeLayer(layers[index].layerId);
	map.removeSource(layers[index].sourceId);
	layers.splice(index, 1);
	layersStore.set(layers);

	updateMapInteraction();
};

export const toggleLayerVisibility = (index: number) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const map = get(mapStore);
	const layers = get(layersStore);

	const mapVisibility = map.getLayoutProperty(layers[index].layerId, 'visibility');
	if (mapVisibility === 'visible') {
		map.setLayoutProperty(layers[index].layerId, 'visibility', 'none');
		layers[index].isVisible = false;
	} else {
		map.setLayoutProperty(layers[index].layerId, 'visibility', 'visible');
		layers[index].isVisible = true;
	}

	layersStore.set(layers);
	updateMapInteraction();
};

export const duplicateLayer = (index: number) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const layers = get(layersStore);

	const newLayer = structuredClone(layers[index]);
	let copyIndex = 1;
	let newName = newLayer.name.replace(/ - Copy \(\d+\)$/, '') + ' - Copy';
	while (layers.find((l) => l.name === newName + ` (${copyIndex})`)) {
		copyIndex += 1;
	}
	newName += ` (${copyIndex})`;

	newLayer.name = newName;
	newLayer.sourceId = newName + '-source';
	newLayer.layerId = newName + '-layer';
	newLayer.layer.id = newLayer.layerId;
	newLayer.layer.source = newLayer.sourceId;

	newLayer.isDataLoaded = false;
	newLayer.isMapLoaded = false;
	newLayer.isVisible = true;

	addLayer(newLayer);
};

export const zoomToLayer = (index: number) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const map = get(mapStore);
	const layers = get(layersStore);

	map.fitBounds(layers[index].bounds);
};

export const downloadData = async (index: number) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const map = get(mapStore);
	const layers = get(layersStore);

	if (!layers[index].data) {
		const source = map.getSource(layers[index].sourceId) as GeoJSONSource;
		const geoJson = (await source.getData()) as FeatureCollection;

		const featureRecords = geoJson.features.map((f) => f.properties);
		if (!featureRecords.length) return;

		layers[index].data = featureRecords;
		layersStore.set(layers);
	}

	const csvContent = 'data:text/csv;charset=utf-8,' + Papa.unparse(layers[index].data);
	const encodedUri = encodeURI(csvContent);
	const link = document.createElement('a');
	link.setAttribute('href', encodedUri);
	link.setAttribute('download', layers[index].name + '.csv');
	document.body.appendChild(link);

	link.click();

	document.body.removeChild(link);
};

const validateData = (data: unknown[]) => {
	const errors = [];
	for (const [index, row] of data.entries()) {
		const { value, error } = ceeiRowSchema.validate(row, { abortEarly: false });
		if (error) {
			errors.push({
				index: index + 2,
				row: value,
				error
			});
		}
	}

	return errors;
};

export const uploadData = async (index: number) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const input = document.createElement('input');
	input.type = 'file';
	input.accept = '.csv';

	input.addEventListener('change', (e) => {
		const target = e.target as HTMLInputElement;
		const file = target.files[0];

		if (file.size > 2e6) {
			toast.push(`<p>The uploaded file is too big. Please upload a file smaller than 2 MB.</p>`, {
				pausable: true,
				initial: 0,
				theme: {
					'--toastBackground': 'red'
				},
				intro: { y: 192 }
			});
			return;
		}

		if (!file.name.toLowerCase().endsWith('.csv')) {
			toast.push(`<p>Please upload a CSV file.</p>`, {
				pausable: true,
				initial: 0,
				theme: {
					'--toastBackground': 'red'
				},
				intro: { y: 192 }
			});
			return;
		}

		Papa.parse(file, {
			header: true,
			dynamicTyping: true,
			worker: true,
			error: (err) => {
				console.log(err);
			},
			skipEmptyLines: true,
			complete: (results) => {
				const dataErrors = validateData(results.data);

				if (dataErrors.length !== 0) {
					toast.push(
						'<p>Errors were found while parsing your file</p><br/><ul>' +
							dataErrors.reduce((prev, err) => {
								return prev + `<li>Row ${err.index}: ${err.error.message}</li>`;
							}, '') +
							'</ul>',
						{
							pausable: true,
							initial: 0,
							theme: {
								'--toastBackground': 'red',
								'--toastWidth': '500px'
							},
							intro: { y: 192 }
						}
					);

					return;
				}

				updateData(index, results.data);
			}
		});
	});

	input.click();
};

export const updateData = async (index: number, data: unknown[]) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const map = get(mapStore);
	const layers = get(layersStore);

	layers[index].isDataLoaded = false;
	layersStore.set(layers);

	const source = map.getSource(layers[index].sourceId) as GeoJSONSource;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const updateData = data.map((record: any) => {
		return {
			id: record.fid,
			addOrUpdateProperties: Object.entries(record).map(([key, value]) => {
				return {
					key,
					value
				};
			})
		};
	});

	map.once('sourcedata', (e) => {
		const waiting = () => {
			if (e.sourceId === layers[index].sourceId && e.isSourceLoaded) {
				layers[index].isDataLoaded = true;
				layersStore.set(layers);
				toast.push(`Map data for layer ${layers[index].name} has been updated`);

				source.getData().then((data: FeatureCollection) => {
					layers[index].data = data.features.map((feature) => feature.properties);
					layersStore.set(layers);
				});
			} else {
				setTimeout(waiting, 200);
			}
		};
		waiting();
	});

	source.updateData({
		update: updateData
	});
};

export const loadInitial = (layer: Layer) => {
	if (!get(layersStore)) return;

	// Added to fix behavior in dev mode where duplicate layers persist between
	// hot reloads
	layersStore.set([]);
	addLayer(layer);
};

export const editLayerName = (index: number, name: string) => {
	if (!get(layersStore)) return;

	const layers = get(layersStore);

	layers[index].name = name;
	layersStore.set(layers);
};

interface getPaintExpressionOptions {
	colorMap: string;
	groupCount: number;
	min: number;
	max: number;
	feature: string;
	mode: 'step' | 'interpolate';
}

export const getPaintExpression = (options: getPaintExpressionOptions) => {
	const { colorMap, groupCount, min, max, feature, mode } = options;
	const range = max - min;
	const finalExpression: unknown[] = [mode, ['get', feature]];

	const isReverse = colorMap.indexOf('_r') !== -1;
	const colorMapArr = chroma.scale(colorMap.replace('_r', '')).colors(groupCount);
	if (isReverse) colorMapArr.reverse();

	if (mode === 'step') {
		const interval = range / groupCount;
		const stops = _.range(1, groupCount, 1).map((n) => interval * n + min);
		for (let i = 0; i < groupCount; i++) {
			finalExpression.push(colorMapArr[i]);
			if (i < groupCount - 1) {
				finalExpression.push(stops[i]);
			}
		}
	} else {
		const interval = range / (groupCount - 1);
		const stops = _.range(0, groupCount, 1).map((n) => interval * n + min);
		for (let i = 0; i < groupCount; i++) {
			finalExpression.push(stops[i]);
			finalExpression.push(colorMapArr[i]);
		}
	}

	return finalExpression;
};

export const updatePaintOfLayer = (index: number, newColorMap?: string) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const map = get(mapStore);
	const layers = get(layersStore);

	if (newColorMap) {
		layers[index].colorMap = newColorMap;
	}

	const newExpression = getPaintExpression({
		colorMap: layers[index].colorMap,
		groupCount: 10,
		min: 0,
		max: 1,
		feature: 'CEEI',
		mode: 'step'
	});

	map.setPaintProperty(layers[index].layerId, 'fill-color', newExpression, {
		validate: true
	});
	layersStore.set(layers);
};
