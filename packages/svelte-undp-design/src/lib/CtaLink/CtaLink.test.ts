import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import CtaLink from './CtaLink.svelte';

describe('CtaLink component', () => {
	it('Should show a given label', () => {
		const { getAllByText } = render(CtaLink, { props: { label: 'click me!' } });
		expect(getAllByText('click me!')).toBeTruthy();
	});

	it('Should dispacth clicked event', async () => {
		const user = userEvent.setup();

		const { component, getAllByText } = render(CtaLink, { props: { label: 'click me!' } });
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
