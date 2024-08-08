import { get } from 'svelte/store';
import { layers as layersStore, mapPopup as popupStore } from '../stores';
import Papa from 'papaparse';
import type { Layer } from '../stores';
import { Map, type GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import Joi from 'joi';
import { toast } from '@zerodevx/svelte-toast';
import chroma from 'chroma-js';
import _ from 'lodash-es';
import PopupTable from '../components/PopupTable.svelte';
import UploadDataErrorToast from '../components/UploadDataErrorToast.svelte';

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
	Country: Joi.string(),
	'District Name': Joi.string(),
	'Solar Power Potential': Joi.number(),
	'Wind Speed': Joi.number(),
	'Geothermal Power Potential': Joi.number(),
	'Hydro Power Potential': Joi.number(),
	'GHG Emissions': Joi.number(),
	'Net Electricity Imports': Joi.number(),
	'Fossil Fuel Share on Energy Capacity and Generation': Joi.number(),
	'Jobs in Renewable Energy Sector': Joi.number(),
	'Education Index': Joi.number(),
	'Access to electricity': Joi.number(),
	'Public and foreign (aid) investments on renewable energy': Joi.number(),
	'Households with access to loans from commercial banks': Joi.number(),
	'Relative Wealth Index': Joi.number(),
	'Grid Density': Joi.number()
};
const ceeiRowSchema = Joi.object(ceeiRowObject).options({ presence: 'required' });

let featureClickEventHandler;
const updateMapInteraction = (map: Map) => {
	if (!map || !get(layersStore) || !get(popupStore)) return;

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

const addLayer = (map: Map, layer: Layer) => {
	if (!map || !get(layersStore)) return;

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
				updatePaintOfLayer(map, layerIndex, layer.colorMap);
				updateMapInteraction(map);
			} else {
				setTimeout(waiting, 200);
			}
		};
		waiting();
	});
};

export const applyDataSimulation = (map: Map, index, sliders, multiplierMap) => {
	if (!map || !get(layersStore)) return;

	const layers = get(layersStore);
	layers[index].sliders = sliders;
	layers[index].muliplierMap = multiplierMap;
	const layerData = computeCEEI(layers[index].data, multiplierMap);
	layers[index].data = layerData;
	layersStore.set(layers);
	updateData(map, index, layerData);
	updatePaintOfLayer(map, index, layers[index].colorMap);
};

export const computeCEEI = (layerData, multiplierMap) => {
	const indicators = [
		'Solar Power Potential',
		'Wind Speed',
		'Geothermal Power Potential',
		'Hydro Power Potential',
		'Jobs in Renewable Energy Sector',
		'Education Index',
		'Access to electricity',
		'Public and foreign (aid) investments on renewable energy',
		'Households with access to loans from commercial banks',
		'Relative Wealth Index',
		'Grid Density',
		'GHG Emissions',
		'Net Electricity Imports',
		'Fossil Fuel Share on Energy Capacity and Generation'
	];

	const indicatorsToFlip = [
		'GHG Emissions',
		'Fossil Fuel Share on Energy Capacity and Generation',
		'Net Electricity Imports'
	];

	const normalize = (value, min, max) => {
		if (max > min) {
			return (value - min) / (max - min);
		}
		return 0;
	};

	// make sure the array is sorted
	const percentRank = (arr, v) => {
		const index = _.findIndex(arr, (e) => {
			return e === v;
		});

		const belowCount = index;

		return belowCount / (arr.length - 1);
	};

	let ceeiMin = null;
	let ceeiMax = null;

	const indicatorArr = {};

	layerData.forEach((locationData) => {
		indicators.forEach((indicator) => {
			const flipMultiplier = indicatorsToFlip.includes(indicator) ? -1 : 1;
			if (!indicatorArr[indicator]) {
				indicatorArr[indicator] = [locationData[indicator] * flipMultiplier];
			} else {
				indicatorArr[indicator].push(locationData[indicator] * flipMultiplier);
			}
		});
	});

	indicators.forEach((indicator) => {
		indicatorArr[indicator] = _.sortBy(indicatorArr[indicator], [
			function (o) {
				return o;
			}
		]);
	});

	layerData = layerData.map((locationData) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const percentRankData: any = {};
		indicators.forEach((indicator) => {
			const flipMultiplier = indicatorsToFlip.includes(indicator) ? -1 : 1;
			const prData = percentRank(indicatorArr[indicator], locationData[indicator] * flipMultiplier);
			percentRankData['pr_' + indicator] = prData;
		});
		return { ...locationData, ...percentRankData };
	});

	layerData = layerData.map((locationData) => {
		let CEEI = 0;
		indicators.forEach((indicator) => {
			let multiplier = 0.071428571;
			if (multiplierMap) {
				multiplier = multiplierMap[indicator];
			}
			CEEI += locationData['pr_' + indicator] * multiplier;
		});
		if (ceeiMin === null) {
			ceeiMin = CEEI;
		} else if (CEEI < ceeiMin) {
			ceeiMin = CEEI;
		}

		if (ceeiMax === null) {
			ceeiMax = CEEI;
		} else if (CEEI > ceeiMax) {
			ceeiMax = CEEI;
		}
		locationData['CEEI'] = CEEI;
		return locationData;
	});

	layerData = layerData.map((locationData) => {
		return {
			...locationData,
			CEEI: normalize(locationData['CEEI'], ceeiMin, ceeiMax)
		};
	});
	return layerData;
};

export const deleteLayer = (map: Map, index: number) => {
	if (!map || !get(layersStore)) return;

	const layers = get(layersStore);

	map.removeLayer(layers[index].layerId);
	map.removeSource(layers[index].sourceId);
	layers.splice(index, 1);
	layersStore.set(layers);

	updateMapInteraction(map);
};

export const toggleLayerVisibility = (map: Map, index: number) => {
	if (!map || !get(layersStore)) return;

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
	updateMapInteraction(map);
};

export const duplicateLayer = (map: Map, index: number) => {
	if (!map || !get(layersStore)) return;

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

	addLayer(map, newLayer);

	const currentMapFilter = map.getFilter(layers[0].layerId);
	if (currentMapFilter) {
		map.setFilter(layers[0].layerId, currentMapFilter);
	}
};

export const downloadData = async (map: Map, index: number) => {
	if (!map || !get(layersStore)) return;

	const layers = get(layersStore);

	if (!layers[index].data) {
		const source = map.getSource(layers[index].sourceId) as GeoJSONSource;
		const geoJson = (await source.getData()) as FeatureCollection;

		const featureRecords = geoJson.features.map((f) => f.properties);
		if (!featureRecords.length) return;

		layers[index].data = featureRecords;
		layersStore.set(layers);
	}

	const csvContent = Papa.unparse(layers[index].data, {
		skipEmptyLines: false,
		columns: Object.keys(ceeiRowObject)
	});
	const csvData = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
	const csvURL = window.URL.createObjectURL(csvData);
	const link = document.createElement('a');
	link.setAttribute('href', csvURL);
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

export const uploadData = async (map: Map, index: number) => {
	if (!map || !get(layersStore)) return;

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
			skipEmptyLines: 'greedy',
			complete: (results) => {
				const dataErrors = validateData(results.data);

				if (dataErrors.length !== 0) {
					toast.push({
						component: { src: UploadDataErrorToast, props: { dataErrors } },
						pausable: true,
						initial: 0,
						theme: {
							'--toastBackground': 'red',
							'--toastWidth': '500px'
						},
						intro: { y: 192 }
					});

					return;
				}

				updateData(map, index, results.data);
			}
		});
	});

	input.click();
};

export const updateData = async (map: Map, index: number, data: unknown[]) => {
	if (!map || !get(layersStore)) return;

	const layers = get(layersStore);

	layers[index].isDataLoaded = false;
	layersStore.set(layers);

	const source = map.getSource(layers[index].sourceId) as GeoJSONSource;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const updateData = data.map((record: any) => {
		return {
			id: record.adminid,
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

				layers[index].data = data;
				layersStore.set(layers);
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

export const loadInitial = (map: Map, layer: Layer) => {
	if (!get(layersStore)) return;

	// Added to fix behavior in dev mode where duplicate layers persist between
	// hot reloads
	layersStore.set([]);
	addLayer(map, layer);
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
	max: number; // eslint-disable-next-line @typescript-eslint/no-explicit-any
	feature: any;
	mode: 'step' | 'interpolate';
}

export const getPaintExpression = (options: getPaintExpressionOptions) => {
	const { colorMap, groupCount, min, max, feature, mode } = options;
	const range = max - min;
	const finalExpression: unknown[] = [mode, feature];

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

export const updatePaintOfLayer = (map: Map, index: number, newColorMap?: string) => {
	if (!map || !get(layersStore)) return;

	const layers = get(layersStore);

	if (newColorMap) {
		layers[index].colorMap = newColorMap;
	}

	const newExpression = getPaintExpression({
		colorMap: layers[index].colorMap,
		groupCount: 10,
		min: 0,
		max: 1,
		feature: ['get', 'CEEI'],
		mode: 'step'
	});

	map.setPaintProperty(layers[index].layerId, 'fill-color', newExpression, {
		validate: true
	});
	layersStore.set(layers);
};
