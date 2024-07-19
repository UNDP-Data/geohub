import type { Meta, StoryObj } from '@storybook/svelte';

import Carousel from './Carousel.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Carousel',
	component: Carousel,
	tags: ['autodocs']
} satisfies Meta<Carousel>;

export default meta;

type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {};
