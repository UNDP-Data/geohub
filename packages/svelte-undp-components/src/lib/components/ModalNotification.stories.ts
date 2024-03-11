import type { Meta, StoryObj } from '@storybook/svelte';
import ModalNotification from './ModalNotification.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/ModalNotification',
	component: ModalNotification,
	tags: ['autodocs'],
	argTypes: {
		title: {
			type: 'string',
			description: 'Title of modal'
		},
		message: {
			type: 'string',
			description: 'Message text of modal'
		},
		messageType: {
			control: 'select',
			options: ['info', 'warning', 'danger'],
			description: 'Messeage type',
			defaultValue: 'warning'
		},
		continueText: {
			type: 'string',
			description: 'Title of continue button',
			defaultValue: 'continue'
		},
		cancelText: {
			type: 'string',
			description: 'Title of cancel button',
			defaultValue: 'cancel'
		},
		dialogOpen: {
			type: 'boolean',
			description: 'If true, open a modal dialog',
			defaultValue: false
		}
	}
} satisfies Meta<ModalNotification>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		title: 'modal title',
		message: 'message text',
		messageType: 'warning',
		dialogOpen: true
	}
};

export const Info: Story = {
	args: {
		title: 'modal title',
		message: 'message text',
		messageType: 'info',
		dialogOpen: true
	}
};

export const Warning: Story = {
	args: {
		title: 'modal title',
		message: 'message text',
		messageType: 'warning',
		dialogOpen: true
	}
};

export const Danger: Story = {
	args: {
		title: 'modal title',
		message: 'message text',
		messageType: 'danger',
		dialogOpen: true
	}
};
