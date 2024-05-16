import type { CarouselContent } from '$lib/interfaces';
import type { Meta, StoryObj } from '@storybook/svelte';

import FluidCarousel from './FluidCarousel.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/FluidCarousel',
	component: FluidCarousel,
	tags: ['autodocs'],
	argTypes: {
		contents: {
			// type: 'string',
			description: 'The arraylist of carousel objects to be shown',
			defaultValue: undefined
		}
	}
} satisfies Meta<FluidCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const contents: CarouselContent[] = [
	{
		tag: 'Blog post',
		imageUrl: 'media/fluid-carousel-img.jpg',
		title: 'Entry and Exit Points: Violent Extremism in South-East Asia',
		description:
			'This study summarizes four complementary in-depth papers that explore the localized…',
		linkName: 'Read More',
		linkUrl: '#'
	},
	{
		tag: 'Blog post',
		imageUrl: 'media/fluid-carousel-img.jpg',
		title: 'Entry and Exit Points: Violent Extremism in South-East Asia',
		description:
			'This study summarizes four complementary in-depth papers that explore the localized…',
		linkName: 'Read More',
		linkUrl: '#'
	},
	{
		tag: 'Blog post',
		imageUrl: 'media/fluid-carousel-img.jpg',
		title: 'Entry and Exit Points: Violent Extremism in South-East Asia',
		description:
			'This study summarizes four complementary in-depth papers that explore the localized…',
		linkName: 'Read More',
		linkUrl: '#'
	}
];

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		contents: contents
	}
};
