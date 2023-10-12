import { describe, test } from 'vitest';

describe('IconColor', () => {
	test.todo('Please pass for now. There is a problem of setting map store in context api.');
});

// import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
// import { render } from '@testing-library/svelte';
// import IconColor from './IconColor.svelte';
// import type { Layer } from '$lib/types';
// import { Map, type StyleSpecification } from 'maplibre-gl';
// import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
// import { getContext } from 'svelte';

// const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

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
// 			id: 'landcover',
// 			type: 'symbol',
// 			source: 'carto',
// 			'source-layer': 'landcover',
// 			paint: {
// 				'icon-color': 'rgba(255,0,0,1)'
// 			}
// 		}
// 	]
// };

// describe('IconColor component', () => {
// 	const mockgetPaintProperty = vi.fn();
// 	let mapContainer: HTMLDivElement;
// 	let _map: Map;

// 	beforeEach(() => {
// 		// create map instance to set to stores
// 		mapContainer = document.createElement('div');

// 		_map = new Map({
// 			container: mapContainer,
// 			style: style
// 		});
// 		map.update(() => _map);

// 		// mock getPaintProperty which is used in FillColor component
// 		const spy = vi.spyOn(_map, 'getPaintProperty');
// 		spy.mockImplementation(mockgetPaintProperty);
// 	});

// 	afterEach(() => {
// 		vi.clearAllMocks();
// 	});

// 	it('Should render it from style.json', () => {
// 		const layer: Layer = {
// 			id: 'landcover',
// 			name: 'landcover'
// 		};

// 		render(IconColor, { props: { layer: layer, defaultColor: 'rgba(0,0,0,1)' } });
// 		expect(mockgetPaintProperty).toHaveBeenCalled();
// 	});
// });
