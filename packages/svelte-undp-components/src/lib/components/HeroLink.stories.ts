import type { Meta, StoryObj } from '@storybook/svelte';
import HeroLink from './HeroLink.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/HeroLink',
	component: HeroLink,
	tags: ['autodocs'],
	argTypes: {
		title: {
			type: 'string',
			description: 'Title of hero'
		},
		linkName: {
			type: 'string',
			description: 'The title of link button'
		},
		href: {
			type: 'string',
			description: 'URL of a link'
		},
		size: {
			control: 'select',
			options: ['small', 'normal', 'medium', 'large'],
			description: 'The size of hero',
			defaultValue: 'normal'
		}
	}
} satisfies Meta<HeroLink>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		title: 'Fully open source',
		linkName: 'Open GitHub',
		href: '#'
	}
};

export const Small: Story = {
	args: {
		title: 'Fully open source',
		linkName: 'Open GitHub',
		href: '#',
		size: 'small'
	}
};

export const Normal: Story = {
	args: {
		title: 'Fully open source',
		linkName: 'Open GitHub',
		href: '#',
		size: 'normal'
	}
};

export const Medium: Story = {
	args: {
		title: 'Fully open source',
		linkName: 'Open GitHub',
		href: '#',
		size: 'medium'
	}
};

export const Large: Story = {
	args: {
		title: 'Fully open source',
		linkName: 'Open GitHub',
		href: '#',
		size: 'large'
	}
};
