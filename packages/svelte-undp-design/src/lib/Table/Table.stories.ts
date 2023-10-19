import type { Meta, StoryObj } from '@storybook/svelte';
import Table from '$lib/Table/Table.svelte';

const data = [
	{
		id: 1,
		name: 'John Doe',
		email: 'john.doe@gmail.com'
	},
	{
		id: 2,
		name: 'Jane Doe',
		email: 'jane.doe@gmail.com'
	},
	{
		id: 3,
		name: 'John Smith',
		email: 'john.smith@gmail.com'
	}
];
// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Example/Table',
	component: Table,
	tags: ['autodocs'],
	argTypes: {
		variant: {
			type: 'string',
			description: 'Table variant.',
			defaultValue: 'default'
		},
		size: {
			type: 'string',
			description: 'Table size.',
			defaultValue: 'small',
			control: { type: 'select' },
			options: ['small', 'large']
		},
		data: {
			type: undefined,
			description: 'Table data.',
			defaultValue: data
		}
	}
} satisfies Meta<Table>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		variant: 'default',
		size: 'small',
		data: data
	}
};
