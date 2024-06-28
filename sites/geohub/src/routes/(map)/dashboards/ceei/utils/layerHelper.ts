import { get } from 'svelte/store';
import { map as mapStore, layers as layersStore } from '../stores';
import Papa from 'papaparse';
import type { Layer } from '../stores';

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
			console.log(e.sourceId + ' loaded');
			console.log(map.getStyle());
			layersStore.set(layers);
		}
	});

	map.addLayer(layer.layer);
	console.log(map.getSource(layer.sourceId));
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

export const updateData = (index: number) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const map = get(mapStore);
	const layers = get(layersStore);

	const features =
		map.querySourceFeatures(layers[index].sourceId, {
			sourceLayer: layers[index].layer['source-layer']
		}) ?? [];

	const featureRecords = features.map((f) => {
		return {
			id: f.id,
			...f.properties
		};
	});
	console.log(featureRecords);
	if (!features.length) return;

	layers[index].data = features;
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

export const loadInitial = (layer) => {
	if (!get(mapStore) || !get(layersStore)) return;

	// Added to fix behavior in dev mode where duplicate layers persist between
	// hot reloads
	layersStore.set([]);
	addLayer(layer);
};
