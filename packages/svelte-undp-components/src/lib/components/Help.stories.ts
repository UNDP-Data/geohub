import type { Meta, StoryObj } from '@storybook/svelte';
import Help from './Help.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Help',
	component: Help,
	tags: ['autodocs'],
	argTypes: {
		maxWidth: {
			type: 'number',
			description: 'Max width of help popup',
			defaultValue: 300
		},
		type: {
			control: 'select',
			options: ['info', 'help'],
			description: 'Type of icon',
			defaultValue: 'info'
		},
		size: {
			control: 'select',
			options: ['small', 'normal', 'medium', 'large'],
			description: 'Type of icon',
			defaultValue: 'small'
		}
	}
} satisfies Meta<Help>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		maxWidth: 300
	}
};

export const InfoIcon: Story = {
	args: {
		maxWidth: 300,
		type: 'info'
	}
};

export const HelpIcon: Story = {
	args: {
		maxWidth: 300,
		type: 'help'
	}
};

export const Small: Story = {
	args: {
		maxWidth: 300,
		size: 'small'
	}
};

export const Normal: Story = {
	args: {
		maxWidth: 300,
		size: 'normal'
	}
};

export const Medium: Story = {
	args: {
		maxWidth: 300,
		size: 'medium'
	}
};

export const Large: Story = {
	args: {
		maxWidth: 300,
		size: 'large'
	}
};
