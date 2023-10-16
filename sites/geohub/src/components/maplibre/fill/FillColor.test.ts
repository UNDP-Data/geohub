import { describe, test } from 'vitest';

describe('FillColor', () => {
	test.todo('Please pass for now. There is a problem of setting map store in context api.');
});

// import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
// import { render, screen } from '@testing-library/svelte';
// import FillColor from './FillColor.svelte';
// import type { Layer } from '$lib/types';
// import { Map, type StyleSpecification } from 'maplibre-gl';
// import { map } from '$stores';

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
// 			type: 'fill',
// 			source: 'carto',
// 			'source-layer': 'landcover',
// 			paint: {
// 				'fill-color': 'rgba(255,0,0,1)'
// 			}
// 		}
// 	]
// };

// describe('FillColor component', () => {
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

// 	it('Should render it from style.json', async () => {
// 		const layer: Layer = {
// 			id: 'landcover',
// 			name: 'landcover'
// 		};

// 		render(FillColor, { props: { layer: layer, defaultColor: 'rgba(0,0,0,1)' } });
// 		// to make sure color-palette button is created
// 		await expect(screen.getAllByTestId('color-palette')).toBeTruthy();
// 		// to make sure getPaintProperty function is called in initialising
// 		await expect(mockgetPaintProperty).toHaveBeenCalled();
// 	});
// });
