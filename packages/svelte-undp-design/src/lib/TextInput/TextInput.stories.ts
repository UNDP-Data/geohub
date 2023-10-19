import type { Meta, StoryObj } from '@storybook/svelte';
import TextInput from '$lib/TextInput/TextInput.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Example/TextInput',
	component: TextInput,
	tags: ['autodocs'],
	argTypes: {
		placeholder: {
			type: 'string',
			description: 'Placeholder text.',
			defaultValue: 'Placeholder'
		},
		label: {
			type: 'string',
			description: 'Label text.',
			defaultValue: 'Label'
		},
		name: {
			type: 'string',
			description: 'Input name.',
			defaultValue: 'name'
		},
		value: {
			type: 'string',
			description: 'Input value.',
			defaultValue: ''
		},
		disabled: {
			type: 'boolean',
			description: 'Input disabled.',
			defaultValue: false
		}
	}
} satisfies Meta<TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		placeholder: 'Placeholder',
		label: 'Label',
		name: 'name',
		value: '',
		disabled: false
	}
};
