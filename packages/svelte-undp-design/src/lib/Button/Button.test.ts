import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Button from './Button.svelte';

describe('Button should be create with given props', () => {
	it('Should show a given title', () => {
		const { getAllByText } = render(Button, { props: { title: 'click me!' } });
		expect(getAllByText('click me!')).toBeTruthy();
	});

	it('Should dispacth clicked event', async () => {
		const user = userEvent.setup();

		const { component, getAllByText } = render(Button, { props: { title: 'click me!' } });
		expect(getAllByText('click me!')).toBeTruthy();

		const mock = vi.fn(() => {
			return;
		});
		component.$on('clicked', mock);

		const button = screen.getByRole('button');
		await user.click(button);

		expect(mock).toHaveBeenCalled();
	});
});
