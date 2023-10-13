import { describe, it, beforeEach, expect } from 'vitest';
import { render, type RenderResult } from '@testing-library/svelte';
import VectorFilterOperators from '$components/pages/map/layers/vector/VectorFilterOperators.svelte';

describe('VectorFilterOperators component', () => {
	let component: RenderResult<VectorFilterOperators>;
	beforeEach(() => {
		component = render(VectorFilterOperators);
	});

	it('should render the component', () => {
		component.getByTestId('vector-filter-operators-container');
		expect(component.container).toBeDefined();
	});
});
