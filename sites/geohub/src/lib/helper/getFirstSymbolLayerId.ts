import type { LayerSpecification } from 'maplibre-gl';

export const getFirstSymbolLayerId = (layers: LayerSpecification[]) => {
	let firstSymbolId = undefined;
	for (const layer of layers) {
		if (layer.type === 'symbol') {
			firstSymbolId = layer.id;
			break;
		}
	}
	return firstSymbolId;
};
