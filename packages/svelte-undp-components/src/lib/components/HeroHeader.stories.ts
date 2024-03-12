import type { Meta, StoryObj } from '@storybook/svelte';
import HeroHeader from './HeroHeader.svelte';
import type { BreadcrumbPage } from './Breadcrumbs.svelte';
import type { Tab } from './Tabs.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/HeroHeader',
	component: HeroHeader,
	tags: ['autodocs'],
	argTypes: {
		title: {
			type: 'string',
			description: 'Title of hero'
		},
		breadcrumbs: {
			description: 'An array of BreadcrumbPage objects to be shown as breadcrumbs'
		},
		tabs: {
			description: 'Optional. An array of Tab objects to be shown as tabs.',
			defaultValue: []
		},
		activeTab: {
			type: 'string',
			description: 'Active tab selected, it is available when tabs are used.',
			defaultValue: ''
		},
		button: {
			description: 'Optional HeroHeaderButton object. It will be shown the right side of title.'
		}
	}
} satisfies Meta<HeroHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const breadcrumbs: BreadcrumbPage[] = [
	{ title: 'home', url: '#' },
	{ title: 'datasets', url: '#' }
];

const tabs: Tab[] = [
	{
		id: '#data',
		label: 'Datasets'
	},
	{
		id: '#mydata',
		label: 'My data'
	}
];

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		title: 'Datasets',
		breadcrumbs,
		tabs,
		activeTab: tabs[0].id,
		button: {
			title: 'Data upload',
			href: '#',
			tooltip: 'Please upload your datasets to GeoHub!'
		}
	}
};

export const WithoutButton: Story = {
	args: {
		title: 'Datasets',
		breadcrumbs,
		tabs,
		activeTab: tabs[0].id
	}
};

export const WithoutTabs: Story = {
	args: {
		title: 'Datasets',
		breadcrumbs
	}
};
