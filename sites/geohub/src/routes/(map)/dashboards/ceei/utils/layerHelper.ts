import { get } from 'svelte/store';
import { map as mapStore, layers as layersStore } from '../stores';
import type { Layer } from '../stores';

export const addLayer = (layer: Layer) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const map = get(mapStore);
	const layers = get(layersStore);

	layersStore.set([...layers, layer]);

	map.addSource(layer.sourceName, layer.source);
	map.addLayer(layer.layer);
};

export const deleteLayer = (index: number) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const map = get(mapStore);
	const layers = get(layersStore);

	map.removeLayer(layers[index].layerName);
	map.removeSource(layers[index].sourceName);
	layersStore.set(layers.toSpliced(index, 1));
};

export const toggleLayerVisibility = (index: number) => {
	if (!get(mapStore) || !get(layersStore)) return;

	const map = get(mapStore);
	const layers = get(layersStore);

	const mapVisibility = map.getLayoutProperty(layers[index].layerName, 'visibility');
	if (mapVisibility === 'visible') {
		map.setLayoutProperty(layers[index].layerName, 'visibility', 'none');
	} else {
		map.setLayoutProperty(layers[index].layerName, 'visibility', 'visible');
	}
};

export const duplicateLayer = (index: number) => {
	if (!get(layersStore)) return;

	const layers = get(layersStore);

	const newLayer = structuredClone(layers[index]);
	newLayer.name += '-duplicate-' + new Date().getTime();
	newLayer.sourceName += '-duplicate-' + new Date().getTime();
	newLayer.layerName += '-duplicate-' + new Date().getTime();
	newLayer.layer.id += '-duplicate-' + new Date().getTime();

	addLayer(newLayer);
};

export const loadInitial = () => {
	if (!get(mapStore) || !get(layersStore)) return;

	const newLayer = {
		name: 'initial',
		sourceName: 'initial-source',
		source: {
			type: 'vector',
			url: 'pmtiles://https://undpgeohub.blob.core.windows.net/userdata/c75e50cd95568bafdc59dd731656044d/datasets/global_ceei_20240423155023.geojson/global_ceei_20240423155023.pmtiles?sv=2024-05-04&ss=b&srt=o&se=2025-05-31T01%3A09%3A07Z&sp=r&sig=mCd4vclvDa0zQAunCogpJeeEN7s1GY9DsfI4IINyLBs%3D'
		},
		layerName: 'initial-layer',
		layer: {
			id: 'initial-layer',
			type: 'fill',
			source: 'initial-source',
			'source-layer': 'global_ceei_20240423155023',
			layout: {},
			paint: {
				'fill-color': '#f08',
				'fill-opacity': 0.4
			}
		}
	};

	addLayer(newLayer);
};
