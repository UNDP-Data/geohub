import { describe, it, expect, beforeEach } from 'vitest';
import { cleanup, render, within, type RenderResult } from '@testing-library/svelte';

import DeleteButton from '$components/controls/DeleteButton.svelte';
import type { Layer } from '$lib/types';

const mockLayer: Layer = {
	id: 'mock-layer',
	name: 'mock-layer'
};

beforeEach(cleanup);

describe('Delete Button', () => {
	let sut: RenderResult<DeleteButton>;
	let button: HTMLElement;

	beforeEach(() => {
		sut = render(DeleteButton, {
			layer: mockLayer
		});
		button = sut.getByTestId('delete-button');
	});

	it('should render the button', () => {
		expect(button).toBeDefined();
	});

	it('should render the delete icon', () => {
		expect(within(button).getByTestId('delete-icon')).toBeDefined();
	});
});
