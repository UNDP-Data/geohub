import type { Meta, StoryObj } from '@storybook/svelte';

import Card from './Card.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Card',
	component: Card,
	tags: ['autodocs'],
	argTypes: {
		linkName: {
			control: 'text',
			description: 'Name of link',
			defaultValue: 'READ MORE'
		},
		url: {
			control: 'text',
			description: 'URL to link',
			defaultValue: '#'
		},
		title: {
			control: 'text',
			description: 'Title of the post goes here and it’s two lines'
		},
		tag: {
			control: 'text',
			description: 'Content tag'
		},
		description: {
			control: 'text',
			description: 'Description of content'
		},
		isEmphasize: {
			control: 'boolean',
			description: 'If enabled, emphasize content by accent color.',
			defaultValue: false
		},
		accent: {
			control: 'select',
			options: ['global', 'yellow', 'green', 'red', 'blue'],
			description: 'accent color. global, yellow, red, blue, green is available',
			defaultValue: 'global'
		}
	}
} satisfies Meta<Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'global'
	}
};
