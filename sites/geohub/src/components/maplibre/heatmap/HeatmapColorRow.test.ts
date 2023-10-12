import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import HeatmapColorRow from '$components/maplibre/heatmap/HeatmapColorRow.svelte';

const colorRow = {
	index: 0,
	color: {
		r: 0,
		g: 0,
		b: 0,
		a: 1,
		hex: '#000000',
		h: 0,
		s: 0,
		v: 0
	},
	value: 0
};
describe('HeatmapColorRow component', () => {
	it('Should render the component', () => {
		const component = render(HeatmapColorRow, { props: { colorRow } });
		const heatMapDiv = component.getByTestId('heatmap-color-map-row-container');
		expect(heatMapDiv).toBeDefined();
	});
});
