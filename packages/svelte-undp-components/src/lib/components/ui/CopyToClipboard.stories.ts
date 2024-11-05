import type { Meta, StoryObj } from '@storybook/svelte';
import CopyToClipboard from './CopyToClipboard.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/UI/CopyToClipboard',
	component: CopyToClipboard,
	tags: ['autodocs'],
	argTypes: {
		size: {
			control: 'select',
			options: ['small', 'normal', 'medium', 'large'],
			defaultValue: 'normal'
		}
	}
} satisfies Meta<CopyToClipboard>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		value: 'copy single line text',
		placeholder: 'Copy to clipboard',
		textCopy: 'Copy',
		textCopied: 'Copied',
		width: '100%',
		timeout: 5000
	}
};

export const Multiline: Story = {
	args: {
		value: 'copy multile text\ncopy multile text',
		placeholder: 'Copy to clipboard',
		textCopy: 'Copy',
		textCopied: 'Copied',
		width: '100%',
		timeout: 5000,
		isMultiline: true
	}
};

export const Url: Story = {
	args: {
		value: 'https://geohub.data.undp.org/',
		placeholder: 'Copy to clipboard',
		textCopy: 'Copy',
		textCopied: 'Copied',
		width: '100%',
		timeout: 5000,
		openNewTab: false
	}
};

export const UrlToOpenNewTab: Story = {
	args: {
		value: 'https://geohub.data.undp.org/',
		placeholder: 'Copy to clipboard',
		textCopy: 'Copy',
		textCopied: 'Copied',
		width: '100%',
		timeout: 5000,
		openNewTab: true
	}
};

export const DisabledReadonly: Story = {
	args: {
		value: 'copy single line text',
		placeholder: 'Copy to clipboard',
		textCopy: 'Copy',
		textCopied: 'Copied',
		width: '100%',
		timeout: 5000,
		readonly: false
	}
};

export const SmallSize: Story = {
	args: {
		value: 'copy single line text',
		placeholder: 'Copy to clipboard',
		textCopy: 'Copy',
		textCopied: 'Copied',
		width: '100%',
		timeout: 5000,
		size: 'small'
	}
};

export const NormalSize: Story = {
	args: {
		value: 'copy single line text',
		placeholder: 'Copy to clipboard',
		textCopy: 'Copy',
		textCopied: 'Copied',
		width: '100%',
		timeout: 5000,
		size: 'normal'
	}
};

export const MeidumSize: Story = {
	args: {
		value: 'copy single line text',
		placeholder: 'Copy to clipboard',
		textCopy: 'Copy',
		textCopied: 'Copied',
		width: '100%',
		timeout: 5000,
		size: 'medium'
	}
};

export const LargeSize: Story = {
	args: {
		value: 'copy single line text',
		placeholder: 'Copy to clipboard',
		textCopy: 'Copy',
		textCopied: 'Copied',
		width: '100%',
		timeout: 5000,
		size: 'large'
	}
};
