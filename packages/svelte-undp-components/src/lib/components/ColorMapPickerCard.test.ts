import { describe, beforeEach, expect, it } from 'vitest';
import { cleanup, render, within, type RenderResult } from '@testing-library/svelte';

import ColorMapPickerCard, { ColorMapTypes } from './ColorMapPickerCard.svelte';
import { colorMapStyle } from './ColorMapPickerCard.svelte';
import { getRandomColormap } from '$lib/util/getRandomColormap.js';

beforeEach(cleanup);

const colormap = getRandomColormap();

describe('Color Map Picker Card : Card Style', () => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	let sut: RenderResult<ColorMapPickerCard>;
	let cardContainer: HTMLElement;

	beforeEach(() => {
		sut = render(ColorMapPickerCard, {
			colorMapName: colormap,
			colorMapType: ColorMapTypes.SEQUENTIAL,
			isSelected: false,
			isCardStyle: true
		});
		cardContainer = sut.getByTestId('color-map-picker-card-container');
	});

	it('should render the container', () => {
		expect(cardContainer).toBeDefined();
	});

	it('should not render the check mark', () => {
		const colorMapFigure = within(cardContainer).queryByTitle('Colormap Selected');
		expect(colorMapFigure).toBeNull();
	});
});

describe('Color Map Picker Card : List Style', () => {
	let sut: RenderResult<ColorMapPickerCard>;
	let cardContainer: HTMLElement;

	beforeEach(() => {
		sut = render(ColorMapPickerCard, {
			colorMapName: colormap,
			colorMapType: ColorMapTypes.SEQUENTIAL,
			isSelected: false,
			isCardStyle: false
		});
		cardContainer = sut.getByTestId('color-map-picker-card-container');
	});

	it('should render the container', () => {
		expect(cardContainer).toBeDefined();
	});
});

describe('colorMapStyle', () => {
	it('should return a string when color map type is sequential and card style', () => {
		const style = colorMapStyle(ColorMapTypes.SEQUENTIAL, 'viridis', true);

		expect(style).toEqual(
			'height: calc(1px * 30); width: 100%; background: linear-gradient(90deg, #3f4a8a,#2c768f,#1f9d8a,#96d647,#fee825);'
		);
	});

	it('should return a string when color map type is sequential and list style', () => {
		const style = colorMapStyle(ColorMapTypes.SEQUENTIAL, 'viridis', false);

		expect(style).toEqual(
			'height: 15px; width:250px; background: linear-gradient(90deg, #3f4a8a,#2c768f,#1f9d8a,#96d647,#fee825); cursor: default !important;'
		);
	});
});
