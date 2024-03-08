import type { Meta, StoryObj } from '@storybook/svelte';
import '@undp-data/undp-bulma/dist/style.css';
import Notification from './Notification.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Notification',
	component: Notification,
	tags: ['autodocs'],
	argTypes: {
		type: {
			control: 'select',
			options: ['info', 'warning', 'danger'],
			description: 'Type of notification',
			defaultValue: 'info'
		},
		showCloseButton: {
			type: 'boolean',
			description: 'If true, show close button',
			defaultValue: true
		}
	}
} satisfies Meta<Notification>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		type: 'info',
		showCloseButton: true
	}
};

export const Info: Story = {
	args: {
		type: 'info',
		showCloseButton: true
	}
};

export const Warning: Story = {
	args: {
		type: 'warning',
		showCloseButton: true
	}
};

export const Danger: Story = {
	args: {
		type: 'danger',
		showCloseButton: true
	}
};

export const HideCloseButton: Story = {
	args: {
		type: 'info',
		showCloseButton: false
	}
};
