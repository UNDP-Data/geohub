import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import html from 'svelte-htm';
import userEvent from '@testing-library/user-event';
import Help from './Help.svelte';

describe('Help component', () => {
	it('Should create Help button and show message', async () => {
		render(
			html`
            <${Help}>
                Help!
            </${Help}>
            `
		);

		const user = userEvent.setup();
		const button = screen.getByRole('button');
		await user.click(button);

		expect(screen.getAllByText('Help!')).toBeTruthy();

		const content = screen.getAllByTestId('help-tooltip-content');
		expect(content).toBeTruthy();
	});
});
