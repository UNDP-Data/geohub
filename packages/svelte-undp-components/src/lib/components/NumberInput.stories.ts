import type { Meta, StoryObj } from '@storybook/svelte';
import NumberInput from './NumberInput.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/NumberInput',
	component: NumberInput,
	tags: ['autodocs'],
	argTypes: {
		value: {
			type: 'number',
			description: 'value to be shown',
			defaultValue: 0
		},
		minValue: {
			type: 'number',
			description: 'Minimum value to input',
			defaultValue: 0
		},
		maxValue: {
			type: 'number',
			description: 'Maximum value to input',
			defaultValue: 0
		},
		step: {
			type: 'number',
			description: 'step to increase/descrese.',
			defaultValue: 1
		},
		size: {
			control: 'select',
			options: ['small', 'normal', 'medium', 'large'],
			description: 'Size of controls',
			defaultValue: 'normal'
		},
		readonly: {
			type: 'boolean',
			description: 'If true, become readonly mode.',
			defaultValue: false
		}
	}
} satisfies Meta<NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		value: 5,
		minValue: 0,
		maxValue: 10
	}
};

export const FloatValue: Story = {
	args: {
		value: 5.3,
		minValue: 0,
		maxValue: 10,
		step: 0.1
	}
};

export const Readonly: Story = {
	args: {
		value: 5,
		minValue: 0,
		maxValue: 10,
		readonly: true
	}
};

export const Small: Story = {
	args: {
		value: 5,
		size: 'small'
	}
};

export const Normal: Story = {
	args: {
		value: 5,
		size: 'normal'
	}
};

export const Medium: Story = {
	args: {
		value: 5,
		size: 'medium'
	}
};

export const Large: Story = {
	args: {
		value: 5,
		size: 'large'
	}
};
