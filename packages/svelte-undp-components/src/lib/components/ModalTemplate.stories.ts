import type { Meta, StoryObj } from '@storybook/svelte';
import ModalTemplate from './ModalTemplate.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/ModalTemplate',
	component: ModalTemplate,
	tags: ['autodocs'],
	argTypes: {
		title: {
			type: 'string',
			description: 'Title of modal'
		},
		show: {
			type: 'boolean',
			description: 'If true, show modal',
			defaultValue: false
		},
		showClose: {
			type: 'boolean',
			description: 'If true, show close button',
			defaultValue: true
		},
		hiddenButtons: {
			type: 'boolean',
			description: 'If true, hide buttons',
			defaultValue: false
		},
		width: {
			type: 'string',
			description: 'width of dialog in CSS format. e.g., 100%, 300px, etc.',
			defaultValue: ''
		}
	}
} satisfies Meta<ModalTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		title: 'modal title',
		show: true
	}
};

export const HideCloseButton: Story = {
	args: {
		title: 'modal title',
		show: true,
		showClose: false
	}
};

export const HideButtons: Story = {
	args: {
		title: 'modal title',
		show: true,
		hiddenButtons: true
	}
};
