import type { Map } from 'maplibre-gl';

export const setSkyToMap = (map: Map) => {
	map.setMaxPitch(85);
	// https://maplibre.org/maplibre-style-spec/sky/#sky
	map.setSky({
		'sky-color': '#88C6FC',
		'sky-horizon-blend': 0.8,
		'horizon-color': '#ffffff',
		'horizon-fog-blend': 0.8,
		'fog-color': '#ffffff',
		'fog-ground-blend': 0.5
	});
};
