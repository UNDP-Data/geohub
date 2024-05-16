import type { Meta, StoryObj } from '@storybook/svelte';

import Pagination from './Pagination.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Pagination',
	component: Pagination,
	tags: ['autodocs'],
	argTypes: {
		totalPages: {
			type: 'number',
			description: 'Total page count of pagination',
			defaultValue: 1
		},
		currentPage: {
			type: 'number',
			description: 'Current page number of pagination',
			defaultValue: 1
		}
	}
} satisfies Meta<Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		totalPages: 10,
		currentPage: 1
	}
};
