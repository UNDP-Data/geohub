import { describe, beforeEach, expect, it } from 'vitest';
import { cleanup, render, type RenderResult } from '@testing-library/svelte';
import IconImagePickerCard from '$components/maplibre/symbol/IconImagePickerCard.svelte';

beforeEach(cleanup);

describe('Icon Image Picker : Card Style', () => {
	let sut: RenderResult<IconImagePickerCard>;
	let cardContainer: HTMLElement;

	beforeEach(() => {
		sut = render(IconImagePickerCard, {
			iconImageAlt: 'circle'
		});
		cardContainer = sut.getByTestId('icon-image-picker-card-container');
	});

	it('should render the container', () => {
		expect(cardContainer).toBeDefined();
	});

	it('should render the default icon name', () => {
		expect(sut.getByText('Circle')).toBeDefined();
	});

	it('should render the icon', () => {
		const colorMapFigure = sut.getByTestId('icon-image');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		expect(colorMapFigure).toHaveAttribute('alt', 'Circle');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		expect(colorMapFigure).toHaveAttribute('title', 'Circle');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		expect(colorMapFigure).toHaveStyle({
			height: '24px',
			width: '24px'
		});
	});

	it('should not render the check mark', () => {
		const iconCheckmark = sut.queryByTitle('Icon Selected');
		expect(iconCheckmark).toBeNull();
	});

	it('should not render the legend symbol container', () => {
		const legendSymbolContainer = sut.queryByTestId('legend-symbol-container');
		expect(legendSymbolContainer).toBeNull();
	});
});

describe('Icon Picker Card : Card Style : Selected', () => {
	let sut: RenderResult<IconImagePickerCard>;

	beforeEach(() => {
		sut = render(IconImagePickerCard, {
			iconImageAlt: 'circle',
			isSelected: true
		});
	});

	it('should render the check mark', () => {
		const iconCheckmark = sut.queryByTitle('Icon Selected');
		expect(iconCheckmark).not.toBeNull();
	});
});
