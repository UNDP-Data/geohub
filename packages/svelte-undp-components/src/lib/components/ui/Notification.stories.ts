import type { Meta, StoryObj } from '@storybook/sveltekit';
import Notification from './Notification.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/UI/Notification',
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
		},
		showIcon: {
			type: 'boolean',
			description: 'If true, show icon based on message type',
			defaultValue: false
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

export const InfoWithIcon: Story = {
	args: {
		type: 'info',
		showCloseButton: true,
		showIcon: true
	}
};

export const Warning: Story = {
	args: {
		type: 'warning',
		showCloseButton: true
	}
};

export const WarningWithIcon: Story = {
	args: {
		type: 'warning',
		showCloseButton: true,
		showIcon: true
	}
};

export const Danger: Story = {
	args: {
		type: 'danger',
		showCloseButton: true
	}
};

export const DangerWithIcon: Story = {
	args: {
		type: 'danger',
		showCloseButton: true,
		showIcon: true
	}
};

export const HideCloseButton: Story = {
	args: {
		type: 'info',
		showCloseButton: false
	}
};
