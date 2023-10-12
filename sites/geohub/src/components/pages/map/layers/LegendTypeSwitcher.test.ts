import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, type RenderResult } from '@testing-library/svelte';

import LegendTypeSwitcher from '$components/pages/map/layers/LegendTypeSwitcher.svelte';

let sut: RenderResult<LegendTypeSwitcher>;
let legendType: 'default' | 'classify' = 'default';

describe.todo('Legend Type Switcher', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		sut = render(LegendTypeSwitcher, {
			legendType: legendType
		});
	});

	it('should render the legend type switcher', () => {
		expect(sut.getByTestId('legend-type-switcher-container')).toBeTruthy();
	});

	it('should listen to the button click event', () => {
		const defaultButton = sut.getByTestId('legend-type-switcher-default');
		const classifyButton = sut.getByTestId('legend-type-switcher-classify');
		expect(classifyButton).toBeDefined();
		expect(defaultButton).toBeDefined();
		fireEvent.click(classifyButton);
		legendType = sut.component.$$.ctx[0];
		expect(legendType).toEqual('classify');
		fireEvent.click(defaultButton);
		expect(sut.component.$$.ctx[0]).toEqual('default');
	});
});
