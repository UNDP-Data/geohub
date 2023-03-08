import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import html from 'svelte-htm';
import Accordion from './Accordion.svelte';

describe('Button should be create with given props', () => {
	it('Should show a given title', () => {
		const { getAllByText } = render(Accordion, { props: { headerTitle: 'hello!' } });
		expect(getAllByText('hello!')).toBeTruthy();
	});

	it('Should create content slot', () => {
		const { getAllByText } = render(
			html`
            <${Accordion} headerTitle="hello!">
                <span slot="content">Content!</span>
            </${Accordion}>
            `
		);
		expect(getAllByText('hello!')).toBeTruthy();
		expect(getAllByText('Content!')).toBeTruthy();
	});

	it('Should create button and content slot', () => {
		const { getAllByText, getAllByRole } = render(
			html`
            <${Accordion} headerTitle="hello!">
                <span slot="content">Content!</span>
                <span slot="button"><Button>Click me!</Button></span>
            </${Accordion}>
            `
		);
		expect(getAllByText('hello!')).toBeTruthy();
		expect(getAllByText('Content!')).toBeTruthy();
		expect(getAllByRole('button')).toBeTruthy();
		expect(getAllByText('Click me!')).toBeTruthy();
	});
});
