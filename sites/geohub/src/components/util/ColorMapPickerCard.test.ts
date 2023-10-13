import { describe, beforeEach, expect, it } from 'vitest';
import { cleanup, render, within, type RenderResult } from '@testing-library/svelte';

import ColorMapPickerCard from '$components/util/ColorMapPickerCard.svelte';
import { ColorMapTypes } from '$lib/config/AppConfig';
import { getRandomColormap } from '$lib/helper';

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

	it('should render the default color type name', () => {
		expect(within(cardContainer).getByText(colormap)).toBeDefined();
	});

	it('should render the color map style', () => {
		const colorMapFigure = within(cardContainer).getByTestId('color-map-figure');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		expect(colorMapFigure).toHaveStyle({
			height: 'calc(1px * 30)',
			width: 'calc(2px * 30)'
		});
	});

	it('should not render the check mark', () => {
		const colorMapFigure = within(cardContainer).queryByTitle('Colormap Selected');
		expect(colorMapFigure).toBeNull();
	});
});

describe('Color Map Picker Card : Card Style : Selected', () => {
	let sut: RenderResult<ColorMapPickerCard>;
	let cardContainer: HTMLElement;

	beforeEach(() => {
		sut = render(ColorMapPickerCard, {
			colorMapName: colormap,
			colorMapType: ColorMapTypes.SEQUENTIAL,
			isSelected: true,
			isCardStyle: true
		});
		cardContainer = sut.getByTestId('color-map-picker-card-container');
	});

	it('should render the check mark', () => {
		const colorMapFigure = within(cardContainer).queryByTitle('Colormap Selected');
		expect(colorMapFigure).not.toBeNull();
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

	it('should render the color map style', () => {
		const colorMapFigure = within(cardContainer).getByTestId('color-map-figure');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		expect(colorMapFigure).toHaveStyle({
			height: '15px',
			width: '250px'
		});
	});
});
