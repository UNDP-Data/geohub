import type { TabNames } from '$lib/config/AppConfig';
import type { Layer } from '$lib/types';
import type { ClassificationMethodTypes } from '@undp-data/svelte-undp-components';
import { writable } from 'svelte/store';

export const LAYERLISTSTORE_CONTEXT_KEY = 'maplibre-layerlist-store';

export type LayerListStore = ReturnType<typeof createLayerListStore>;

// layer map list
export function createLayerListStore() {
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

	const setColorMapNameLabel = (layerId: string, colorMapName: string) => {
		update((state) => {
			const layer = state.find((l) => l.id === layerId);
			if (layer) {
				layer.colorMapNameLabel = colorMapName;
			}
			return state;
		});
	};

	const setClassificationMethod = (
		layerId: string,
		classificationMethod: ClassificationMethodTypes,
		type: 'default' | 'value' | 'label' = 'default'
	) => {
		update((state) => {
			const layer = state.find((l) => l.id === layerId);
			if (layer) {
				if (type === 'value') {
					layer.classificationMethod_2 = classificationMethod;
				} else if (type === 'label') {
					layer.classificationMethodLabel = classificationMethod;
				} else {
					layer.classificationMethod = classificationMethod;
				}
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

	const setIsExpanded = (layerId: string, isExpanded: boolean) => {
		update((state) => {
			const layer = state.find((l) => l.id === layerId);
			if (layer) {
				layer.isExpanded = isExpanded ?? true;
			}
			return state;
		});
	};

	return {
		subscribe,
		update,
		set,
		setColorMapName,
		setColorMapNameLabel,
		setClassificationMethod,
		setActiveTab,
		setIsExpanded
	};
}
