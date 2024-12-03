import type { Meta, StoryObj } from '@storybook/svelte';
import TextInput from '$lib/TextInput/TextInput.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/TextInput',
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
		disabled: false,
		formType: 'text'
	}
};

export const Calendar: Story = {
	args: {
		placeholder: 'Placeholder',
		label: 'Label',
		name: 'name',
		value: '',
		disabled: false,
		formType: 'date'
	}
};

export const Number: Story = {
	args: {
		placeholder: 'Enter search term',
		label: 'Label',
		name: 'name',
		value: '',
		disabled: false,
		formType: 'number'
	}
};

export const Password: Story = {
	args: {
		placeholder: 'Password',
		label: 'Label',
		name: 'name',
		value: '',
		disabled: false,
		formType: 'password'
	}
};

export const Telephone: Story = {
	args: {
		placeholder: '+234 000 000 0000',
		label: 'Label',
		name: 'name',
		value: '',
		disabled: false,
		formType: 'tel'
	}
};

export const Disabled: Story = {
	args: {
		placeholder: 'Placeholder',
		label: 'Label',
		name: 'name',
		value: '',
		disabled: true,
		formType: 'text'
	}
};

export const Error: Story = {
	args: {
		placeholder: 'Placeholder',
		label: 'Label',
		name: 'name',
		value: '',
		disabled: false,
		formType: 'text',
		errorMessage: '*Error: this field is required'
	}
};
