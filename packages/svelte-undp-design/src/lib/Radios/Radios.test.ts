import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Radios from './Radios.svelte';

describe('Radios component', () => {
	it('Should show given labels', async () => {
		const user = userEvent.setup();

		const { component, getAllByText } = render(Radios, {
			props: {
				radios: [
					{
						label: 'radio A',
						value: 'a'
					},
					{ label: 'radio B', value: 'b' }
				],
				groupName: 'radio-buttons-1',
				value: 'a',
				isVertical: false
			}
		});
		expect(getAllByText('radio A')).toBeTruthy();
		expect(getAllByText('radio B')).toBeTruthy();

		const mock = vi.fn(() => {
			return;
		});
		component.$on('change', mock);
		const checkbox = screen.getByTestId('radio-a');
		await user.click(checkbox);

		expect(mock).toHaveBeenCalled();
	});
});
