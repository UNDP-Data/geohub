import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import CopyToClipboard from './CopyToClipboard.svelte';

describe('CopyToClipboard should be create with given props', () => {
	const props = {
		value: 'copy me!',
		placeholder: 'placeholder text',
		textCopy: 'Copy text',
		textCopied: 'Copied text!',
		timeout: 1000
	};

	it('Should show a given value', () => {
		render(CopyToClipboard, { props: props });
		expect(screen.getAllByDisplayValue(props.value)).toBeTruthy();
	});

	it('Should show a given placeholder value', () => {
		render(CopyToClipboard, { props: props });
		expect(screen.getAllByPlaceholderText(props.placeholder)).toBeTruthy();
	});

	it('Should show a given textCopy value', () => {
		const { getAllByText } = render(CopyToClipboard, { props: props });
		expect(getAllByText(props.textCopy)).toBeTruthy();
	});

	it('Should change button text after clicking', async () => {
		const user = userEvent.setup();

		const { getAllByText, getByTestId } = render(CopyToClipboard, { props: props });

		const button = getByTestId('copy-button');
		await user.click(button);

		expect(getAllByText(props.textCopied)).toBeTruthy();
	});

	it('Should change button text after given timeout', async () => {
		const user = userEvent.setup();

		const { getAllByText, getByTestId } = render(CopyToClipboard, { props: props });

		const button = getByTestId('copy-button');
		await user.click(button);

		expect(getAllByText(props.textCopied)).toBeTruthy();

		setTimeout(() => {
			expect(button.textContent).toBe(props.textCopy);
		}, props.timeout);
	});

	it('Should show a open link button if given text is URL', () => {
		const newProps = JSON.parse(JSON.stringify(props));
		newProps.value = 'https://geohub.data.undp.org/';
		const { getByTestId } = render(CopyToClipboard, { props: newProps });
		const button = getByTestId('open-button');
		expect(button).toBeTruthy();
	});

	it('Should input readonly become false if the parameter is given', () => {
		const newProps = Object.assign(props, { readonly: false });
		const { getByTestId } = render(CopyToClipboard, { props: newProps });
		const textInput: HTMLInputElement = getByTestId('input-control') as HTMLInputElement;
		expect(textInput).toBeTruthy();
		expect(textInput.readOnly).toBeFalsy();
	});

	it('Should textarea readonly become false if the parameter is given', () => {
		const newProps = Object.assign(props, { readonly: false, isMultiline: true });
		const { getByTestId } = render(CopyToClipboard, { props: newProps });
		const textarea: HTMLTextAreaElement = getByTestId('textarea-control') as HTMLTextAreaElement;
		expect(textarea).toBeTruthy();
		expect(textarea.readOnly).toBeFalsy();
	});

	it('Should show textarea element if isMultiline is enabled', () => {
		const newProps = Object.assign(props, { isMultiline: true });
		const { getByTestId } = render(CopyToClipboard, { props: newProps });
		const textarea: HTMLTextAreaElement = getByTestId('textarea-control') as HTMLTextAreaElement;
		expect(textarea).toBeTruthy();
	});
});

describe('CopyToClipboard should be create by different sizes', () => {
	it('Should show small size', () => {
		const { getByTestId } = render(CopyToClipboard, { props: { value: 'copy', size: 'small' } });
		const button = getByTestId('copy-button');
		expect(button).toBeTruthy();
		expect(button.classList.contains('small-button')).toBeTruthy();
	});

	it('Should show noarmal size', () => {
		const { getByTestId } = render(CopyToClipboard, { props: { value: 'copy', size: 'normal' } });
		const button = getByTestId('copy-button');
		expect(button).toBeTruthy();
		expect(button.classList.contains('is-small')).toBeTruthy();
	});

	it('Should show medium size', () => {
		const { getByTestId } = render(CopyToClipboard, { props: { value: 'copy', size: 'medium' } });
		const button = getByTestId('copy-button');
		expect(button).toBeTruthy();
		expect(button.classList.contains('is-normal')).toBeTruthy();
	});
	it('Should show large size', () => {
		const { getByTestId } = render(CopyToClipboard, { props: { value: 'copy', size: 'large' } });
		const button = getByTestId('copy-button');
		expect(button).toBeTruthy();
		expect(button.classList.contains('is-medium')).toBeTruthy();
	});
});
