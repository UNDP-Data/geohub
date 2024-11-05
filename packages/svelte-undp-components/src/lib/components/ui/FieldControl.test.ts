import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import html from 'svelte-htm';
import userEvent from '@testing-library/user-event';
import FieldControl from './FieldControl.svelte';

describe('FieldControl component', () => {
	it('Should create FieldControl with given slots', async () => {
		render(
			html`
            <${FieldControl}>
                <div slot="help">Help!</div>
                <div slot="control">control!</div>
            </${FieldControl}>
            `
		);

		const user = userEvent.setup();
		const button = screen.getByRole('button');
		await user.click(button);

		expect(screen.getAllByText('Help!')).toBeTruthy();

		const content = screen.getAllByTestId('help-tooltip-content');
		expect(content).toBeTruthy();

		expect(screen.getAllByText('control!')).toBeTruthy();
	});
});
