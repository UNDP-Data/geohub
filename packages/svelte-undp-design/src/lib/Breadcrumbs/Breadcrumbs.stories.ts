import type { Meta, StoryObj } from '@storybook/svelte';

import Breadcrumbs from './Breadcrumbs.svelte';
import type { Breadcrumb } from '../interfaces';

const breadcrumbs: Breadcrumb[] = [
	{
		name: 'Home',
		icon: 'fas fa-house',
		url: ''
	},
	{
		name: 'Search result',
		icon: 'fas fa-magnifying-glass',
		url: ''
	}
];

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Breadcrumbs',
	component: Breadcrumbs,
	tags: ['autodocs'],
	argTypes: {
		breadcrumbs: {
			description: `Breadcrumbs data to be shown. Each object should contain 'name', 'icon' and 'url'. URL is optional. Icon can use either fontawesome of any icon image's URL. flag-icon package's icon also can be used. You have to import fontawesome or flag-icon CSS if you want to use it.`,
			defaultValue: []
		},
		fontSize: {
			type: 'string',
			description: 'Font size either large, medium or small',
			defaultValue: 'medium',
			control: { type: 'select' },
			options: ['small', 'medium', 'large']
		},
		disabled: {
			type: 'boolean',
			description: 'Disable breadcrumbs',
			defaultValue: false
		}
	}
} satisfies Meta<Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		breadcrumbs: breadcrumbs
	}
};

export const Small: Story = {
	args: {
		breadcrumbs: breadcrumbs,
		fontSize: 'small'
	}
};

export const Medium: Story = {
	args: {
		breadcrumbs: breadcrumbs,
		fontSize: 'medium'
	}
};

export const Large: Story = {
	args: {
		breadcrumbs: breadcrumbs,
		fontSize: 'large'
	}
};

export const Disabled: Story = {
	args: {
		breadcrumbs: breadcrumbs,
		disabled: true
	}
};
