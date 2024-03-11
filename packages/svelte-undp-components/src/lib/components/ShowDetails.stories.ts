import type { Meta, StoryObj } from '@storybook/svelte';
import ShowDetails from './ShowDetails.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/ShowDetails',
	component: ShowDetails,
	tags: ['autodocs'],
	argTypes: {
		show: {
			type: 'boolean',
			description: 'Switch the state of the component to either expanded or collapsed.',
			defaultValue: false
		}
	}
} satisfies Meta<ShowDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		show: true
	}
};
