import { describe, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, type RenderResult } from '@testing-library/svelte';

import NumberInput from './NumberInput.svelte';

beforeEach(cleanup);

describe('Number Input : Default Values', () => {
	let sut: RenderResult;
	let viewContainer: HTMLElement;

	beforeEach(() => {
		vi.resetAllMocks();
		sut = render(NumberInput, {
			value: 5
		});
		viewContainer = sut.getByTestId('number-input-view-container');
	});

	const testInputNumber = (value: string) => {
		const input: HTMLInputElement = sut.getByTitle('Number Label') as HTMLInputElement;
		expect(input).toBeDefined();
		expect(input.value).toEqual(value);
	};

	it('should render the container', () => {
		expect(viewContainer).toBeDefined();
	});

	it('should display the number', () => {
		testInputNumber('5');
	});

	it('should decrease the number upon click of decrease button and fire a dispatch event', async () => {
		const mockNumberInputEvent = vi.fn();
		let dispatchContent = [];

		sut.component.$on('change', function (event) {
			mockNumberInputEvent(event.detail);
			dispatchContent = event.detail;
		});

		const decreaseClassesButton = sut.getByTitle('Decrease number');
		expect(decreaseClassesButton).toBeDefined();
		await fireEvent.click(decreaseClassesButton);
		testInputNumber('4');
		expect(mockNumberInputEvent).toHaveBeenCalled();
		expect(dispatchContent).toEqual({ value: 4 });
	});

	it('should increase the number upon click of increase button and fire a dispatch event', async () => {
		const mockNumberInputEvent = vi.fn();
		let dispatchContent = [];

		sut.component.$on('change', function (event) {
			mockNumberInputEvent(event.detail);
			dispatchContent = event.detail;
		});

		const increaseClassesButton = sut.getByTitle('Increase number');
		expect(increaseClassesButton).toBeDefined();
		await fireEvent.click(increaseClassesButton);
		testInputNumber('6');
		expect(mockNumberInputEvent).toHaveBeenCalled();
		expect(dispatchContent).toEqual({ value: 6 });
	});
});

describe('Number Input : Min/Max Values', () => {
	let sut: RenderResult;
	let viewContainer: HTMLElement;

	beforeEach(() => {
		vi.resetAllMocks();
		sut = render(NumberInput, {
			value: 3,
			minValue: 2,
			maxValue: 4
		});
		viewContainer = sut.getByTestId('number-input-view-container');
	});

	const testInputNumber = (value: string) => {
		const input: HTMLInputElement = sut.getByTitle('Number Label') as HTMLInputElement;
		expect(input).toBeDefined();
		expect(input.value).toEqual(value);
	};

	it('should render the container', () => {
		expect(viewContainer).toBeDefined();
	});

	it('should display the number', () => {
		testInputNumber('3');
	});

	it('should decrease the number upon click of decrease button to the minimum', async () => {
		const decreaseClassesButton = sut.getByTitle('Decrease number');
		expect(decreaseClassesButton).toBeDefined();
		await fireEvent.click(decreaseClassesButton);
		testInputNumber('2');
		await fireEvent.click(decreaseClassesButton);
		testInputNumber('2');
	});

	it('should increase the number of classes upon click of increase button to the maximum', async () => {
		const increaseClassesButton = sut.getByTitle('Increase number');
		expect(increaseClassesButton).toBeDefined();
		await fireEvent.click(increaseClassesButton);
		testInputNumber('4');
		await fireEvent.click(increaseClassesButton);
		testInputNumber('4');
	});
});

describe('Number Input : Step Values', () => {
	let sut: RenderResult;
	let viewContainer: HTMLElement;

	beforeEach(() => {
		vi.resetAllMocks();
		sut = render(NumberInput, {
			value: 6,
			minValue: 0,
			maxValue: 10,
			step: 2
		});
		viewContainer = sut.getByTestId('number-input-view-container');
	});

	const testInputNumber = (value: string) => {
		const input: HTMLInputElement = sut.getByTitle('Number Label') as HTMLInputElement;
		expect(input).toBeDefined();
		expect(input.value).toEqual(value);
	};

	it('should render the container', () => {
		expect(viewContainer).toBeDefined();
	});

	it('should display the number', () => {
		testInputNumber('6');
	});

	it('should decrease the number upon click of decrease button to the minimum', async () => {
		const decreaseClassesButton = sut.getByTitle('Decrease number');
		expect(decreaseClassesButton).toBeDefined();
		await fireEvent.click(decreaseClassesButton);
		testInputNumber('4');
		await fireEvent.click(decreaseClassesButton);
		testInputNumber('2');
	});

	it('should increase the number of classes upon click of increase button to the maximum', async () => {
		const increaseClassesButton = sut.getByTitle('Increase number');
		expect(increaseClassesButton).toBeDefined();
		await fireEvent.click(increaseClassesButton);
		testInputNumber('8');
		await fireEvent.click(increaseClassesButton);
		testInputNumber('10');
	});
});

describe('Number Input : Float Step Values', () => {
	let sut: RenderResult<NumberInput>;
	let viewContainer: HTMLElement;

	beforeEach(() => {
		vi.resetAllMocks();
		sut = render(NumberInput, {
			value: 6,
			minValue: 0,
			maxValue: 10,
			step: 0.1
		});
		viewContainer = sut.getByTestId('number-input-view-container');
	});

	const testInputNumber = (value: string) => {
		const input: HTMLInputElement = sut.getByTitle('Number Label') as HTMLInputElement;
		expect(input).toBeDefined();
		expect(input.value).toEqual(value);
	};

	it('should render the container', () => {
		expect(viewContainer).toBeDefined();
	});

	it('should display the number', () => {
		testInputNumber('6');
	});

	it('should decrease the number upon click of decrease button to the minimum', async () => {
		const decreaseClassesButton = sut.getByTitle('Decrease number');
		expect(decreaseClassesButton).toBeDefined();
		await fireEvent.click(decreaseClassesButton);
		testInputNumber('5.9');
		await fireEvent.click(decreaseClassesButton);
		testInputNumber('5.8');
	});

	it('should increase the number of classes upon click of increase button to the maximum', async () => {
		const increaseClassesButton = sut.getByTitle('Increase number');
		expect(increaseClassesButton).toBeDefined();
		await fireEvent.click(increaseClassesButton);
		testInputNumber('6.1');
		await fireEvent.click(increaseClassesButton);
		testInputNumber('6.2');
	});

	it('should display the same number of decimal places as step', async () => {
		const increaseClassesButton = sut.getByTitle('Increase number');
		await fireEvent.click(increaseClassesButton);
		testInputNumber('6.1');

		const decreaseClassesButton = sut.getByTitle('Decrease number');
		await fireEvent.click(decreaseClassesButton);
		testInputNumber('6');

		await fireEvent.click(decreaseClassesButton);
		testInputNumber('5.9');
		await fireEvent.click(increaseClassesButton);
		testInputNumber('6');
	});
});
