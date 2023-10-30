import { describe, it, beforeEach, expect } from 'vitest';
import { fireEvent, render, type RenderResult } from '@testing-library/svelte';
import OperationButtons from '$components/pages/map/layers/vector/OperationButtons.svelte';
import { VectorFilterOperators } from '$lib/config/AppConfig';

describe('Operation Buttons component', () => {
	let component: RenderResult<OperationButtons>;
	let firstButton: HTMLElement;

	beforeEach(() => {
		component = render(OperationButtons, {
			currentSelectedOperation: '!in',
			stringProperty: true,
			numberProperty: false
		});
	});
	it('should render at least the first button', () => {
		firstButton = component.getAllByTestId('operation-button')[0];
		expect(firstButton).toBeDefined();
	});
	it('should emit a click event when clicked', async () => {
		firstButton = component.getAllByTestId('operation-button')[0];
		await fireEvent.click(firstButton);
		expect(
			component.component.$$.ctx[component.component.$$.props.currentSelectedOperation]
		).toEqual(VectorFilterOperators[component.component.$$.props.currentSelectedOperation].value);
	});
});
