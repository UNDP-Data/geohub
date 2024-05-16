import type { Meta, StoryObj } from '@storybook/svelte';
import Breadcrumbs, { type BreadcrumbPage } from './Breadcrumbs.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Breadcrumbs',
	component: Breadcrumbs,
	tags: ['autodocs'],
	argTypes: {
		pages: { type: undefined },
		size: {
			control: 'select',
			options: ['small', 'normal', 'medium', 'large'],
			defaultValue: 'small'
		}
	}
} satisfies Meta<Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

const pages: BreadcrumbPage[] = [
	{
		title: 'home',
		url: '#'
	},
	{
		title: 'SDGs',
		url: '#'
	},
	{
		title: 'SDG6',
		url: '#'
	},
	{
		title: 'result',
		url: '#'
	}
];

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		pages,
		size: 'normal'
	}
};

export const Small: Story = {
	args: {
		pages,
		size: 'small'
	}
};

export const Normal: Story = {
	args: {
		pages,
		size: 'normal'
	}
};

export const Medium: Story = {
	args: {
		pages,
		size: 'medium'
	}
};

export const Large: Story = {
	args: {
		pages,
		size: 'large'
	}
};

export const DispatchClickEvent: Story = {
	args: {
		pages: [
			{
				title: 'home'
			},
			{
				title: 'SDGs'
			},
			{
				title: 'SDG6'
			},
			{
				title: 'result'
			}
		],
		size: 'normal'
	}
};
