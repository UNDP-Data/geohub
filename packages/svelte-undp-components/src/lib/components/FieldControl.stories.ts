import type { Meta, StoryObj } from '@storybook/svelte';
import FieldControl from './FieldControl.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/FieldControl',
	component: FieldControl,
	tags: ['autodocs'],
	argTypes: {
		title: {
			type: 'string',
			description: 'The title of the control',
			defaultValue: ''
		},
		showHelp: {
			type: 'boolean',
			description: 'If true, show help button. Default is true',
			defaultValue: true
		},
		showHelpPopup: {
			type: 'boolean',
			description:
				'If true, show help popup next to label. If false, show help message under the control. Default is true',
			defaultValue: true
		},
		marginBottom: {
			type: 'string',
			description: 'css style of margin-bottom of the control',
			defaultValue: ''
		},
		fontWeight: {
			control: 'select',
			options: ['light', 'normal', 'medium', 'semibold', 'bold'],
			description: 'Font weight of title',
			defaultValue: 'normal'
		},
		isFirstCharCapitalized: {
			type: 'boolean',
			description: 'If true, First character in title will be chapitalized. Default is true',
			defaultValue: true
		}
	}
} satisfies Meta<FieldControl>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		title: 'Field title',
		showHelp: true,
		showHelpPopup: true
	}
};

export const HideHelp: Story = {
	args: {
		title: 'Field title',
		showHelp: false,
		showHelpPopup: true
	}
};

export const ShowHelpUnderControl: Story = {
	args: {
		title: 'Field title',
		showHelp: true,
		showHelpPopup: false
	}
};
