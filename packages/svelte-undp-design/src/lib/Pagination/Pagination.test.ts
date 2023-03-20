import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination.svelte';

describe('Pagination component', () => {
	it('Should show Pagination', async () => {
		const user = userEvent.setup();

		const { component, getAllByText } = render(Pagination, {
			props: {
				currentPage: 1,
				totalPages: 2
			}
		});
		expect(getAllByText('1')).toBeTruthy();
		expect(getAllByText('2')).toBeTruthy();

		let buttonType = '';
		const mock = vi.fn((e) => {
			buttonType = e.detail.type;
			return;
		});
		component.$on('clicked', mock);

		const button = screen.getByTestId('next');
		await user.click(button);
		expect(buttonType).toBe('next');
	});

	it('Should previous button works', async () => {
		const user = userEvent.setup();

		const { component, getAllByText } = render(Pagination, {
			props: {
				currentPage: 2,
				totalPages: 3
			}
		});
		expect(getAllByText('2')).toBeTruthy();
		expect(getAllByText('3')).toBeTruthy();

		let buttonType = '';
		const mock = vi.fn((e) => {
			buttonType = e.detail.type;
			return;
		});
		component.$on('clicked', mock);

		const button = screen.getByTestId('previous');
		await user.click(button);
		expect(buttonType).toBe('previous');
	});
});
