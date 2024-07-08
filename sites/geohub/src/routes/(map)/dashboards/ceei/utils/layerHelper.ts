import { get } from 'svelte/store';
import { map as mapStore, layers as layersStore } from '../stores';
import Papa from 'papaparse';
import type { Layer } from '../stores';
import type { GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';

export const addLayer = (layer: Layer) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const map = get(mapStore);
	const layers = get(layersStore);

	layersStore.set([...layers, layer]);

	map.addSource(layer.sourceId, layer.source);

	map.on('sourcedata', (e) => {
		if (e.sourceId === layer.sourceId && e.isSourceLoaded) {
			const layers = get(layersStore);
			const layerIndex = layers.findIndex((l) => l.sourceId === layer.sourceId);
			if (layerIndex === -1) return;
			layers[layerIndex].isDataLoaded = true;
			layersStore.set(layers);
		}
	});

	map.addLayer(layer.layer);
};

export const deleteLayer = (index: number) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const map = get(mapStore);
	const layers = get(layersStore);

	map.removeLayer(layers[index].layerId);
	map.removeSource(layers[index].sourceId);
	layersStore.set(layers.toSpliced(index, 1));
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
	if (!get(layersStore)) return;

	const layers = get(layersStore);

	const newLayer = structuredClone(layers[index]);
	newLayer.name += '-duplicate-' + new Date().getTime();
	newLayer.sourceId += '-duplicate-' + new Date().getTime();
	newLayer.layerId += '-duplicate-' + new Date().getTime();
	newLayer.layer.id += '-duplicate-' + new Date().getTime();

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

	const source = map.getSource(layers[index].sourceId) as GeoJSONSource;
	const geoJson = (await source.getData()) as FeatureCollection;

	const featureRecords = geoJson.features.map((f) => f.properties);
	if (!featureRecords.length) return;

	layers[index].data = featureRecords;
	layersStore.set(layers);

	const csvContent = 'data:text/csv;charset=utf-8,' + Papa.unparse(featureRecords);
	const encodedUri = encodeURI(csvContent);
	const link = document.createElement('a');
	link.setAttribute('href', encodedUri);
	link.setAttribute('download', layers[index].name + '.csv');
	document.body.appendChild(link);

	link.click();

	document.body.removeChild(link);
};

export const uploadData = async (index: number) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const map = get(mapStore);
	const layers = get(layersStore);

	const input = document.createElement('input');
	input.type = 'file';

	input.addEventListener('change', (e) => {
		const target = e.target as HTMLInputElement;
		const file = target.files[0];

		Papa.parse(file, {
			header: true,
			dynamicTyping: true,
			worker: true,
			complete: (results) => {
				const source = map.getSource(layers[index].sourceId) as GeoJSONSource;
				const updateData = results.data.map((record) => {
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
				source.updateData({
					update: updateData
				});
				source.getData().then((data) => console.log(data));
				layers[index].data = results.data;
			}
		});
	});

	input.click();
};

export const loadInitial = (layer) => {
	if (!get(mapStore) || !get(layersStore)) return;

	// Added to fix behavior in dev mode where duplicate layers persist between
	// hot reloads
	layersStore.set([]);
	addLayer(layer);
};
