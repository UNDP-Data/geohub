import type { Meta, StoryObj } from '@storybook/svelte';
import Tabs, { type Tab } from './Tabs.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Tabs',
	component: Tabs,
	tags: ['autodocs'],
	argTypes: {
		tabs: {
			description: 'An array of Tab ojects'
		},
		activeTab: {
			type: 'string',
			description: 'Active tab id'
		},
		size: {
			control: 'select',
			options: ['is-small', 'is-normal', 'is-medium', 'is-large'],
			description: 'Size of tabs',
			defaultValue: 'is-normal'
		},
		fontWeight: {
			control: 'select',
			options: ['light', 'normal', 'medium', 'semibold', 'bold'],
			description: 'Font weight of tab title',
			defaultValue: 'normal'
		},
		isBoxed: {
			type: 'boolean',
			description: 'Switch to boxed tab',
			defaultValue: true
		},
		isCapitalized: {
			type: 'boolean',
			description: 'Transform tab title to capitalized',
			defaultValue: false
		},
		isCentered: {
			type: 'boolean',
			description: 'Place tabs in center',
			defaultValue: true
		},
		isFullwidth: {
			type: 'boolean',
			description: 'Show tabs in full width',
			defaultValue: false
		},
		isUppercase: {
			type: 'boolean',
			description: 'Transform tab title to uppercase',
			defaultValue: false
		}
	}
} satisfies Meta<Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const tabItems: Tab[] = [
	{
		id: '#data',
		label: 'datasets'
	},
	{
		id: '#mydata',
		label: 'My data'
	}
];

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		tabs: tabItems,
		activeTab: tabItems[0].id
	}
};

export const UNDPTabStyle: Story = {
	args: {
		tabs: tabItems,
		activeTab: tabItems[0].id,
		isCentered: false,
		isBoxed: false,
		isUppercase: true,
		fontWeight: 'bold'
	}
};

export const Boxed: Story = {
	args: {
		tabs: tabItems,
		activeTab: tabItems[0].id,
		isCentered: false,
		isBoxed: true,
		isUppercase: false
	}
};

export const Centered: Story = {
	args: {
		tabs: tabItems,
		activeTab: tabItems[0].id,
		isCentered: true,
		isBoxed: false,
		isUppercase: false
	}
};

export const Fullwidth: Story = {
	args: {
		tabs: tabItems,
		activeTab: tabItems[0].id,
		isCentered: false,
		isBoxed: false,
		isUppercase: false,
		isFullwidth: true
	}
};

export const Capitalized: Story = {
	args: {
		tabs: tabItems,
		activeTab: tabItems[0].id,
		isCentered: false,
		isBoxed: false,
		isUppercase: false,
		isCapitalized: true
	}
};

export const Uppercase: Story = {
	args: {
		tabs: tabItems,
		activeTab: tabItems[0].id,
		isCentered: false,
		isBoxed: false,
		isUppercase: true,
		isCapitalized: false
	}
};

export const Small: Story = {
	args: {
		tabs: tabItems,
		activeTab: tabItems[0].id,
		isCentered: false,
		isBoxed: false,
		isUppercase: true,
		fontWeight: 'bold',
		size: 'is-small'
	}
};

export const Normal: Story = {
	args: {
		tabs: tabItems,
		activeTab: tabItems[0].id,
		isCentered: false,
		isBoxed: false,
		isUppercase: true,
		fontWeight: 'bold',
		size: 'is-normal'
	}
};

export const Medium: Story = {
	args: {
		tabs: tabItems,
		activeTab: tabItems[0].id,
		isCentered: false,
		isBoxed: false,
		isUppercase: true,
		fontWeight: 'bold',
		size: 'is-medium'
	}
};

export const Large: Story = {
	args: {
		tabs: tabItems,
		activeTab: tabItems[0].id,
		isCentered: false,
		isBoxed: false,
		isUppercase: true,
		fontWeight: 'bold',
		size: 'is-large'
	}
};

export const TabWithCount: Story = {
	args: {
		tabs: [
			{
				id: '#data',
				label: 'datasets',
				counter: 1234
			},
			{
				id: '#mydata',
				label: 'My data',
				counter: 12
			}
		],
		activeTab: '#data',
		isCentered: false,
		isBoxed: false,
		isUppercase: true,
		fontWeight: 'bold'
	}
};

export const TabWithIcon: Story = {
	args: {
		tabs: [
			{
				id: '#data',
				label: 'datasets',
				icon: 'fas fa-database'
			},
			{
				id: '#mydata',
				label: 'My data',
				icon: 'fas fa-user'
			}
		],
		activeTab: '#data',
		isCentered: false,
		isBoxed: false,
		isUppercase: true,
		fontWeight: 'bold'
	}
};

export const TabWithIconAndCount: Story = {
	args: {
		tabs: [
			{
				id: '#data',
				label: 'datasets',
				icon: 'fas fa-database',
				counter: 1234
			},
			{
				id: '#mydata',
				label: 'My data',
				icon: 'fas fa-user',
				counter: 12
			}
		],
		activeTab: '#data',
		isCentered: false,
		isBoxed: false,
		isUppercase: true,
		fontWeight: 'bold'
	}
};
