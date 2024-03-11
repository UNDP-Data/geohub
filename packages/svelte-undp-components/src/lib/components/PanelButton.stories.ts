import type { Meta, StoryObj } from '@storybook/svelte';
import PanelButton from './PanelButton.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/PanelButton',
	component: PanelButton,
	tags: ['autodocs'],
	argTypes: {
		icon: {
			type: 'string',
			description: 'default fontawesome icon'
		},
		iconDisabled: {
			type: 'string',
			description: 'Fontawesome icon for disabled state',
			defaultValue: ''
		},
		width: {
			type: 'string',
			description: 'Width of popup'
		},
		tooltip: {
			type: 'string',
			description: 'Tooltip text of the button'
		},
		disabled: {
			type: 'boolean',
			description: 'If true, the control will be disabled',
			defaultValue: false
		},
		isShow: {
			type: 'boolean',
			description: 'If true, the panel popup will be shown',
			defaultValue: false
		},
		hideBorder: {
			type: 'boolean',
			description: 'If true, hide border of the button. Default is true',
			defaultValue: true
		}
	}
} satisfies Meta<PanelButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		icon: 'fas fa-gear',
		width: '300px',
		tooltip: 'tooltip text'
	}
};

export const ShowButtonBorder: Story = {
	args: {
		icon: 'fas fa-gear',
		width: '300px',
		tooltip: 'tooltip text',
		hideBorder: false
	}
};

export const Disabled: Story = {
	args: {
		icon: 'fas fa-gear',
		width: '300px',
		tooltip: 'tooltip text',
		disabled: true
	}
};

export const DisabledWithIcon: Story = {
	args: {
		icon: 'fas fa-eye',
		iconDisabled: 'fas fa-eye-slash',
		width: '300px',
		tooltip: 'tooltip text',
		disabled: true
	}
};
