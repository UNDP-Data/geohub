import type { Meta, StoryObj } from '@storybook/svelte';

import Sidebar from './Sidebar.svelte';
import type { SidebarItem } from '$lib';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Example/Sidebar',
	component: Sidebar,
	tags: ['autodocs'],
	argTypes: {
		data: {
			description: 'An array of SidebarItem object to be shown at sidebar component'
		},
		isNarrow: {
			type: 'boolean',
			defaultValue: false,
			description: 'If enabled, make height narrower.'
		},
		isFixed: {
			type: 'boolean',
			defaultValue: false,
			description:
				'If true, sidebar width is fixed. if false, width will be flexiblely changed in accordance with parent component.'
		}
	}
} satisfies Meta<Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const data: SidebarItem[] = [
	{
		href: '#',
		title: 'PAGE TITLE',
		children: [
			{
				href: '#',
				title: 'Subpage title'
			},
			{
				href: '#',
				title: 'Subpage with an exceptionally long title on two lines'
			},
			{
				href: '#',
				title: 'Subpage title'
			}
		]
	},
	{
		title: 'PAGE TITLE callback example',
		callback: () => {
			alert('clicked');
		}
	},
	{
		href: '#',
		title: 'PAGE TITLE',
		children: [
			{
				href: '#',
				title: 'Subpage title'
			},
			{
				href: '#',
				title: 'Subpage with an exceptionally long title on two lines'
			},
			{
				title: 'Subpage title callback example',
				callback: () => {
					alert('clicked');
				}
			}
		]
	},
	{
		href: '#',
		title: 'PAGE TITLE'
	},
	{
		href: '#',
		title: 'PAGE TITLE'
	}
];

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		data,
		isNarrow: false
	}
};

export const Narrow: Story = {
	args: {
		data,
		isNarrow: true
	}
};

export const FullWidth: Story = {
	args: {
		data,
		isNarrow: false,
		isFixed: false
	}
};
