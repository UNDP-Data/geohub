import type { Meta, StoryObj } from '@storybook/svelte';

import CardWithImage from './CardWithImage.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Example/CardWithImage',
	component: CardWithImage,
	tags: ['autodocs'],
	argTypes: {
		linkName: {
			type: 'string',
			description: 'Name of link',
			defaultValue: 'READ MORE'
		},
		url: {
			type: 'string',
			description: 'URL to link',
			defaultValue: '#'
		}
	}
} satisfies Meta<CardWithImage>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		linkName: 'READ MORE',
		url: '#'
	}
};

// Example of usage
// <CardWithImage linkName="READ MORE">
// <div slot="title">
// 	<h6>content tag</h6>
// </div>
// <div slot="image">
// 	<img src="media/card-thumbnail.jpg" alt="media/card-thumbnail.jpg" />
// </div>
// <div slot="description">
// 	<h5>Title of the post goes here and it’s two lines</h5>
// </div>
// </CardWithImage>
