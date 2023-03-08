import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Breadcrumbs from './Breadcrumbs.svelte';
import type { Breadcrumb } from '$lib/interfaces';

describe('Button should be create with given props', () => {
	const user = userEvent.setup();

	it('Should show only a breadcrumb with unclickable breadcrumbs', async () => {
		const breadcrumbs: Breadcrumb[] = [
			{
				name: 'Home',
				icon: 'fas fa-house',
				url: ''
			}
		];

		const { getAllByText } = render(Breadcrumbs, {
			props: { breadcrumbs: breadcrumbs }
		});
		expect(getAllByText('Home')).toBeTruthy();

		const button = screen.queryByRole('button');
		expect(button).toBeNull();
	});

	it('Should show two breadcrumbs with clickable breadcrumbs', async () => {
		const breadcrumbs: Breadcrumb[] = [
			{
				name: 'Home',
				icon: 'fas fa-house',
				url: ''
			},
			{
				name: 'Search result',
				icon: 'fas fa-magnifying-glass',
				url: 'https://google.com'
			}
		];

		const { component, getAllByText } = render(Breadcrumbs, {
			props: { breadcrumbs: breadcrumbs }
		});
		expect(getAllByText('Home')).toBeTruthy();
		expect(getAllByText('Search result')).toBeTruthy();

		let index = -1;
		let breadcrumb: Breadcrumb = { name: '', icon: '', url: '' };
		const mock = vi.fn((e: { detail: { index: number; breadcrumb: Breadcrumb } }) => {
			index = e.detail.index;
			breadcrumb = e.detail.breadcrumb;
		});
		component.$on('clicked', mock);

		const button = screen.getByRole('button');
		await user.click(button);

		expect(mock).toHaveBeenCalled();
		expect(index).toBe(0);
		expect(breadcrumb.name).toBe(breadcrumbs[0].name);
	});

	it('it should show three breadcrumbs with clickevents', async () => {
		const breadcrumbs: Breadcrumb[] = [
			{
				name: 'Home',
				icon: 'fas fa-house',
				url: ''
			},
			{
				name: 'SDG 1',
				icon: 'SDG_Wheel_WEB.png',
				url: '/api/datasets?sdg_goal=1'
			},
			{
				name: 'Search result',
				icon: 'fas fa-magnifying-glass',
				url: 'https://google.com'
			}
		];

		const { component, getAllByText } = render(Breadcrumbs, {
			props: { breadcrumbs: breadcrumbs }
		});
		expect(getAllByText('Home')).toBeTruthy();
		expect(getAllByText('SDG 1')).toBeTruthy();
		expect(getAllByText('Search result')).toBeTruthy();

		let index = -1;
		let breadcrumb: Breadcrumb = { name: '', icon: '', url: '' };
		const mock = vi.fn((e: { detail: { index: number; breadcrumb: Breadcrumb } }) => {
			index = e.detail.index;
			breadcrumb = e.detail.breadcrumb;
		});
		component.$on('clicked', mock);

		const homeButton = screen.getByRole('button', { name: 'Home' });
		await user.click(homeButton);

		expect(mock).toHaveBeenCalled();
		expect(index).toBe(0);
		expect(breadcrumb.name).toBe(breadcrumbs[0].name);

		const sdgButton = screen.getByRole('button', { name: 'SDG 1' });
		await user.click(sdgButton);

		expect(mock).toHaveBeenCalled();
		expect(index).toBe(1);
		expect(breadcrumb.name).toBe(breadcrumbs[1].name);
	});
});
