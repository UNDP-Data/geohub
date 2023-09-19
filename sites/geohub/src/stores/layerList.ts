import type { ClassificationMethodTypes, TabNames } from '$lib/config/AppConfig';
import type { Layer } from '$lib/types';
import { writable } from 'svelte/store';

// layer map list
function createLayerListStore() {
	const { set, update, subscribe } = writable<Layer[]>([]);

	const setColorMapName = (layerId: string, colorMapName: string) => {
		update((state) => {
			const layer = state.find((l) => l.id === layerId);
			if (layer) {
				layer.colorMapName = colorMapName;
			}
			return state;
		});
	};

	const setClassificationMethod = (
		layerId: string,
		classificationMethod: ClassificationMethodTypes
	) => {
		update((state) => {
			const layer = state.find((l) => l.id === layerId);
			if (layer) {
				layer.classificationMethod = classificationMethod;
			}
			return state;
		});
	};

	const setActiveTab = (layerId: string, activeTab: TabNames) => {
		update((state) => {
			const layer = state.find((l) => l.id === layerId);
			if (layer) {
				layer.activeTab = activeTab;
			}
			return state;
		});
	};

	return {
		subscribe,
		update,
		set,
		setColorMapName,
		setClassificationMethod,
		setActiveTab
	};
}

export const layerList = createLayerListStore();
