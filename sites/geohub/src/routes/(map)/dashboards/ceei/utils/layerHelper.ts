import { get } from 'svelte/store';
import { map as mapStore, layers as layersStore } from '../stores';
import Papa from 'papaparse';
import type { Layer } from '../stores';
import type { GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import Joi from 'joi';
import { toast } from '@zerodevx/svelte-toast';

const ceeiRowSchema = Joi.object({
	fid: Joi.number().integer().options({ convert: false }),
	'Country Code': Joi.string(),
	'Relative Wealth Index': Joi.number().min(0).max(1),
	'Solar Power Potential': Joi.number().min(0).max(1),
	'Wind Speed': Joi.number().min(0).max(1),
	'Geothermal Power Potential': Joi.number().min(0).max(1),
	'Hydro Power Potential': Joi.number().min(0).max(1),
	'Grid Density': Joi.number().min(0).max(1),
	'GHG emissions': Joi.number().min(0).max(1),
	'Access to electricity': Joi.number().min(0).max(1),
	'Education Index': Joi.number().min(0).max(1),
	'Households with access to loans from commercial banks': Joi.number().min(0).max(1),
	'Net Electricity Imports': Joi.number().min(0).max(1),
	'Jobs in Renewable Energy Sector ': Joi.number().min(0).max(1),
	'Fossil Fuel Share on Energy Capacity and Generation': Joi.number().min(0).max(1),
	'Public and foreign (aid) investments on renewable energy': Joi.number().min(0).max(1),
	'Potential (component/pillar)': Joi.number().min(0).max(1),
	'Means and Resources (component/pillar)': Joi.number().min(0).max(1),
	'Urgency (component/pillar)': Joi.number().min(0).max(1),
	CEEI: Joi.number().min(0).max(1)
}).options({ presence: 'required' });

export const addLayer = (layer: Layer) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const map = get(mapStore);
	const layers = get(layersStore);

	layersStore.set([...layers, layer]);

	map.addSource(layer.sourceId, layer.source);

	map.once('sourcedata', (e) => {
		const waiting = () => {
			if (e.sourceId === layer.sourceId && e.isSourceLoaded) {
				const layers = get(layersStore);
				const layerIndex = layers.findIndex((l) => l.sourceId === layer.sourceId);
				if (layerIndex === -1) return;
				layers[layerIndex].isDataLoaded = true;
				layersStore.set(layers);
				map.addLayer(layer.layer);
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
};

export const duplicateLayer = (index: number) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const layers = get(layersStore);

	const newLayer = structuredClone(layers[index]);
	newLayer.name += '-duplicate-' + new Date().getTime();
	newLayer.sourceId += '-duplicate-' + new Date().getTime();
	newLayer.layerId += '-duplicate-' + new Date().getTime();
	newLayer.layer.id += '-duplicate-' + new Date().getTime();
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

	input.addEventListener('change', (e) => {
		const target = e.target as HTMLInputElement;
		const file = target.files[0];

		if (!file.name.toLowerCase().endsWith('.csv')) {
			toast.push(`<p>Please upload a CSV file</p>`, {
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

export const loadInitial = (layer) => {
	if (!get(mapStore) || !get(layersStore)) return;

	// Added to fix behavior in dev mode where duplicate layers persist between
	// hot reloads
	layersStore.set([]);
	addLayer(layer);
};
