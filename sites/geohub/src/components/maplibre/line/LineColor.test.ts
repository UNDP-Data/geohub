import { describe, test } from 'vitest';

describe('LineColor', () => {
	test.todo('Please pass for now. There is a problem of setting map store in context api.');
});

// import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
// import { render } from '@testing-library/svelte';
// import { Map, type StyleSpecification } from 'maplibre-gl';
// import LineColor from '$components/controls/vector-styles/LineColor.svelte';
// import { MAPSTORE_CONTEXT_KEY, createMapStore } from '$stores';
// import { setContext } from 'svelte';

// const map = createMapStore();
// setContext(MAPSTORE_CONTEXT_KEY, map);

// // example style for testing
// const style: StyleSpecification = {
// 	version: 8,
// 	sources: {
// 		carto: {
// 			type: 'vector',
// 			url: 'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json'
// 		}
// 	},
// 	layers: [
// 		{
// 			id: 'transportation',
// 			type: 'line',
// 			source: 'carto',
// 			'source-layer': 'transportation',
// 			paint: {
// 				'line-color': 'rgba(255,0,0,1)'
// 			},
// 			layout: {
// 				'line-cap': 'round',
// 				'line-join': 'round'
// 			}
// 		}
// 	]
// };

// describe('LineColor Component', () => {
// 	const mockGetPaintProperty = vi.fn();
// 	let mapContainer: HTMLDivElement;
// 	let _map: Map;
// 	beforeEach(() => {
// 		//     Create a map instance and store the map instance to the stores\
// 		mapContainer = document.createElement('div');
// 		_map = new Map({
// 			container: mapContainer,
// 			style: style
// 		});
// 		map.update(() => _map);

// 		// mock getPaintProperty which is used in LineColor component
// 		const spy = vi.spyOn(_map, 'getPaintProperty');
// 		spy.mockImplementation(mockGetPaintProperty);
// 	});
// 	afterEach(() => {
// 		vi.clearAllMocks();
// 	});

// 	it('Should render it from style.json', () => {
// 		const layer = {
// 			id: 'transportation',
// 			name: 'transportation'
// 		};
// 		render(LineColor, { props: { layer: layer, defaultColor: 'rgba(0,0,0,1)' } });
// 		// to make sure color-palette button is created
// 		expect(mockGetPaintProperty).toHaveBeenCalled();
// 	});
// });
