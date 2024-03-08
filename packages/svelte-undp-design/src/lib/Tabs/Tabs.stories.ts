import type { Meta, StoryObj } from '@storybook/svelte';

import Tabs from './Tabs.svelte';
import type { Tab } from '$lib/interfaces';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Tabs',
	component: Tabs,
	tags: ['autodocs'],
	argTypes: {
		tabs: {
			// type: 'string',
			description: 'Items to be shown as tabs. Icon can use from fontawesome.',
			defaultValue: undefined
		},
		activeTab: {
			type: 'string',
			description: 'Active tab selected',
			defaultValue: undefined
		},
		height: {
			type: 'number',
			description: 'The height of tabs will be bined in this property',
			defaultValue: undefined
		},
		fontSize: {
			type: 'string',
			description: 'Font size either medium or small',
			defaultValue: 'medium',
			control: { type: 'select' },
			options: ['medium', 'small']
		},
		isToggleTab: {
			type: 'boolean',
			description: 'If enabled, tab can be toggled',
			defaultValue: false
		}
	}
} satisfies Meta<Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const tabs: Tab[] = [
	{ label: 'Data', icon: 'fas fa-database' },
	{ label: 'Layer', icon: 'fas fa-layer-group' }
];
const activeTab = tabs[0].label;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		tabs: tabs,
		activeTab: activeTab,
		height: 40,
		fontSize: 'medium',
		isToggleTab: false
	}
};

export const Small: Story = {
	args: {
		tabs: tabs,
		activeTab: activeTab,
		height: 40,
		fontSize: 'small',
		isToggleTab: false
	}
};

export const Toggled: Story = {
	args: {
		tabs: tabs,
		activeTab: activeTab,
		height: 40,
		fontSize: 'medium',
		isToggleTab: true
	}
};
