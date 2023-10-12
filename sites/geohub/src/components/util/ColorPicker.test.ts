import { describe, it, expect, beforeEach } from 'vitest';
import { cleanup, render, type RenderResult } from '@testing-library/svelte';
import ColorPicker from '$components/util/ColorPicker.svelte';
import type { Color } from '$lib/types';

beforeEach(cleanup);

const color: Color = { r: 0, g: 0, b: 0, a: 1, hex: '#000000', h: 0, s: 0, v: 0 };

describe('Color Picker', () => {
	let sut: RenderResult<ColorPicker>;
	let colorPicker: HTMLElement;

	beforeEach(() => {
		sut = render(ColorPicker, {
			props: {
				color
			}
		});
		colorPicker = sut.getByTestId('default-color-picker-container');
	});

	it('should render the color picker', () => {
		expect(colorPicker).toBeDefined();
	});
});
