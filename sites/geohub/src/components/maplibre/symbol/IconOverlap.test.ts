import { describe, test } from 'vitest';

describe('IconOverlap', () => {
	test.todo('Please pass for now. There is a problem of setting map store in context api.');
});

// import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
// import { render } from '@testing-library/svelte';
// import IconOverlap from './IconOverlap.svelte';
// import type { Layer } from '$lib/types';
// import { Map, type StyleSpecification } from 'maplibre-gl';
// import { MAPSTORE_CONTEXT_KEY, createMapStore } from '$stores';
// import { setContext } from 'svelte';

// const map = createMapStore();
// setContext(MAPSTORE_CONTEXT_KEY, map);

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
// 			},
// 			layout: {
// 				'icon-overlap': 'never'
// 			}
// 		}
// 	]
// };

// describe('IconColor component', () => {
// 	const mockGetLayoutProperty = vi.fn();
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

// 		const spy = vi.spyOn(_map, 'getLayoutProperty');
// 		spy.mockImplementation(mockGetLayoutProperty);
// 	});

// 	afterEach(() => {
// 		vi.clearAllMocks();
// 	});

// 	it('Should render it from style.json', () => {
// 		const layer: Layer = {
// 			id: 'landcover',
// 			name: 'landcover'
// 		};

// 		render(IconOverlap, { props: { layer: layer } });
// 		expect(mockGetLayoutProperty).toHaveBeenCalled();
// 	});

// 	it('should render the icon overlap slider', () => {
// 		const sut = render(IconOverlap, { props: { layer: { id: 'landcover', name: 'landcover' } } });
// 		expect(sut.getByTestId('icon-overlap-slider')).toBeTruthy();
// 	});
// });
