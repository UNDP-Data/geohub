import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Checkbox from './Checkbox.svelte';

describe('Checkbox component', () => {
	it('Should show a given title', () => {
		const { getAllByText } = render(Checkbox, { props: { label: 'check me!' } });
		expect(getAllByText('check me!')).toBeTruthy();
	});

	it('Should dispacth clicked event', async () => {
		const user = userEvent.setup();

		const { component, getAllByText } = render(Checkbox, { props: { label: 'check me!' } });
		expect(getAllByText('check me!')).toBeTruthy();

		const mock = vi.fn(() => {
			return;
		});
		component.$on('clicked', mock);

		const checkbox = screen.getByTestId('checkbox');
		await user.click(checkbox);

		expect(mock).toHaveBeenCalled();
	});
});
