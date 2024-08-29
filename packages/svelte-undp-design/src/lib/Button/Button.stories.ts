import type { Meta, StoryObj } from '@storybook/svelte';

import Button from './Button.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Button',
	component: Button,
	tags: ['autodocs'],
	argTypes: {
		title: {
			type: 'string',
			description: 'Title to be shown in button',
			defaultValue: undefined
		},
		isArrow: {
			type: 'boolean',
			description: 'If enabled, arrow will be shown in button',
			defaultValue: false
		},
		isPrimary: {
			type: 'boolean',
			description: 'If enabled, primary color will be used',
			defaultValue: true
		},
		isDisabled: {
			type: 'boolean',
			description: 'If enabled, will disable selecting the button',
			defaultValue: false
		}
	}
} satisfies Meta<Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		title: 'title',
		isArrow: true,
		isPrimary: true
	}
};

export const Secondary: Story = {
	args: {
		title: 'title',
		isPrimary: false
	}
};

export const Arrow: Story = {
	args: {
		title: 'title',
		isArrow: true,
		isPrimary: true
	}
};

export const NoArrow: Story = {
	args: {
		title: 'title',
		isArrow: false,
		isPrimary: true
	}
};

export const Disabled: Story = {
	args: {
		title: 'title',
		isArrow: false,
		isPrimary: true,
		isDisabled: true
	}
};
