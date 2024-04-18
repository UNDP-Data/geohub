import type { Meta, StoryObj } from '@storybook/svelte';
import Slider from './Slider.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Slider',
	component: Slider,
	tags: ['autodocs'],
	argTypes: {
		min: {
			type: 'number',
			description: 'Minimum value'
		},
		max: {
			type: 'number',
			description: 'Maximum value'
		},
		step: {
			type: 'number',
			description: 'Step value',
			defaultValue: 1
		},
		values: {
			description:
				'An array of values. If it is only a value, single slider is used. If more than a value, range slider will be shown'
		},
		rest: {
			type: 'boolean',
			description:
				'Whether to show a pip or label for all values except first & last. See https://simeydotme.github.io/svelte-range-slider-pips/en/options/#rest',
			defaultValue: true
		},
		floatLabel: {
			type: 'boolean',
			description:
				'By passing the float prop to the component, we can have a nice label which floats above the handle and shows the current value.',
			defaultValue: true
		},
		disabled: {
			type: 'boolean',
			description: 'If true, the control will be disabled.',
			defaultValue: true
		},
		first: {
			control: 'select',
			options: ['label', 'pip', false],
			defaultValue: 'label'
		},
		last: {
			control: 'select',
			options: ['label', 'pip', false],
			defaultValue: 'label'
		}
	}
} satisfies Meta<Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		min: 0,
		max: 100,
		step: 1,
		values: [50]
	}
};

export const FloatValue: Story = {
	args: {
		min: 0,
		max: 100,
		step: 0.5,
		values: [50]
	}
};

export const RangeSlider: Story = {
	args: {
		min: 0,
		max: 100,
		step: 1,
		values: [30, 60]
	}
};

export const HidePips: Story = {
	args: {
		min: 0,
		max: 100,
		step: 1,
		values: [50],
		rest: false
	}
};

export const HideFloatLabel: Story = {
	args: {
		min: 0,
		max: 100,
		step: 1,
		values: [50],
		floatLabel: false
	}
};

export const HideLabelForFistAndLast: Story = {
	args: {
		min: 0,
		max: 100,
		step: 1,
		values: [50],
		first: 'pip',
		last: 'pip'
	}
};

export const HidePipAndLabel: Story = {
	args: {
		min: 0,
		max: 100,
		step: 1,
		values: [50],
		first: false,
		last: false,
		rest: false
	}
};

export const Disabled: Story = {
	args: {
		min: 0,
		max: 100,
		step: 1,
		values: [50],
		disabled: true
	}
};
