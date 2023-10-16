import { describe, it, beforeEach, expect } from 'vitest';
import { render, type RenderResult } from '@testing-library/svelte';
import MaplibreColorPicker from '$components/maplibre/MaplibreColorPicker.svelte';

describe('MaplibreColorPicker component', () => {
	let component: RenderResult<MaplibreColorPicker>;
	beforeEach(() => {
		component = render(MaplibreColorPicker, {
			props: {
				rgba: `rgba(0,0,0,1)`
			}
		});
	});

	it('should render', () => {
		expect(component.getByTestId('color-palette')).toBeDefined();
	});
});
