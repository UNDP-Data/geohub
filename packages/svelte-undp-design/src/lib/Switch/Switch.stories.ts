import type { Meta, StoryObj } from '@storybook/svelte';

import Switch from './Switch.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Switch',
	component: Switch,
	tags: ['autodocs'],
	argTypes: {
		toggled: {
			type: 'boolean',
			defaultValue: false
		},
		size: {
			type: 'string',
			defaultValue: 'default',
			control: { type: 'select' },
			options: ['small', 'default']
		},
		disabled: {
			type: 'boolean',
			defaultValue: false
		},
		showIcon: {
			type: 'boolean',
			defaultValue: false
		},
		showValue: {
			type: 'boolean',
			defaultValue: false
		},
		label: {
			type: 'string',
			defaultValue: ''
		},
		toggledText: {
			type: 'string',
			defaultValue: 'On'
		},
		untoggledText: {
			type: 'string',
			defaultValue: 'Off'
		}
	}
} satisfies Meta<Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		size: 'default',
		toggled: true
	}
};

export const Small: Story = {
	args: {
		size: 'small'
	}
};

export const Disabled: Story = {
	args: {
		size: 'default',
		disabled: true
	}
};

export const ShowIcon: Story = {
	args: {
		size: 'default',
		toggled: true,
		showIcon: true
	}
};

export const ShowValue: Story = {
	args: {
		size: 'default',
		toggled: true,
		showValue: true
	}
};

export const ShowIconAndValue: Story = {
	args: {
		size: 'default',
		toggled: true,
		showIcon: true,
		showValue: true
	}
};

export const ShowLabel: Story = {
	args: {
		size: 'default',
		toggled: true,
		label: 'Label:'
	}
};

export const ShowLabelAndValue: Story = {
	args: {
		size: 'default',
		toggled: true,
		label: 'Label:',
		showValue: true
	}
};

export const CustomiseValueText: Story = {
	args: {
		size: 'default',
		toggled: true,
		showValue: true,
		toggledText: 'Enabled',
		untoggledText: 'Disabled'
	}
};
