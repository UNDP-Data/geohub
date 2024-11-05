import { describe, it, expect, beforeEach } from 'vitest';
import { cleanup, render, type RenderResult } from '@testing-library/svelte';
import ColorPicker from './ColorPicker.svelte';

beforeEach(cleanup);

describe('Color Picker', () => {
	let sut: RenderResult<ColorPicker>;
	let colorPicker: HTMLElement;

	beforeEach(() => {
		sut = render(ColorPicker, {
			props: {
				color: { r: 0, g: 0, b: 0, a: 1 }
			}
		});
		colorPicker = sut.getByTestId('default-color-picker-container');
	});

	it('should render the color picker', () => {
		expect(colorPicker).toBeDefined();
	});
});
