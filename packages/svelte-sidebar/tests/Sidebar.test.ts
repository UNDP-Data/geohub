import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import html from 'svelte-htm';
import Sidebar from '$lib/Sidebar.svelte';

describe('Sidebar should be create with given props', () => {
	it('Should contain left class', async () => {
		const container = render(Sidebar, { props: { show: true, position: 'left' } });

		const button = container.getByTestId('sidebar-button');
		expect(button).toBeTruthy();
		expect(button.classList.contains('left')).toBeTruthy();
		expect(button.classList.contains('right')).toBeFalsy();
		expect(container.getByTestId('sidebar-content')).toBeTruthy();
	});

	it('Should contain right class', () => {
		const container = render(Sidebar, { props: { show: true, position: 'right' } });

		const button = container.getByTestId('sidebar-button');
		expect(button).toBeTruthy();
		expect(button.classList.contains('left')).toBeFalsy();
		expect(button.classList.contains('right')).toBeTruthy();
		expect(container.getByTestId('sidebar-content')).toBeTruthy();
	});

	it('Should hide sidebar content', () => {
		const container = render(Sidebar, { props: { show: false, position: 'left' } });

		const button = container.getByTestId('sidebar-button');
		expect(button).toBeTruthy();
		expect(button.classList.contains('left')).toBeTruthy();
		expect(button.classList.contains('right')).toBeFalsy();
	});

	it('Should contain slot contents', async () => {
		render(
			html`
            <${Sidebar} show={true}>
                <div slot="content">Content!</div>
				<div slot="main">Main!</div>
            </${Sidebar}>
            `,
			{ props: { show: true, position: 'left' } }
		);

		expect(screen.getByText('Content!')).toBeTruthy();
		expect(screen.getByText('Main!')).toBeTruthy();
	});
});
