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
			control: 'select',
			options: ['label', 'pip', true, false],
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
		pips: {
			type: 'boolean',
			description: 'Whether to show pips/notches on the Slider. ',
			defaultValue: true
		},
		pipstep: {
			type: 'number',
			description:
				'Every nth step to show a pip for. This has multiple defaults depending on min, max and step properties. A sensible default is chosen, but can be overridden.',
			defaultValue: 1
		},
		all: {
			control: 'select',
			options: ['label', 'pip', false],
			description: `Whether to show a pip or label for every value. Possible values are:
- false all values in the Slider will not have a pip or label
- pip a pip (only) will be shown for all values
- label label (and pip) is shown on all values`,
			defaultValue: false
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
		},
		prefix: {
			type: 'string',
			description: 'Prefix value shown after fist and last label',
			defaultValue: ''
		},
		suffix: {
			type: 'string',
			description: 'Suffix value shown after fist and last label',
			defaultValue: ''
		},
		range: {
			control: 'select',
			options: ['min', 'max', true, false],
			description: `Whether to style as a range picker. Possible values are:
- false no range styling
- true styles like a range with a min and max
- min styles like a range going from min to value
- max styles like a range going from value to max
`,
			defaultValue: false
		},
		showEditor: {
			type: 'boolean',
			description:
				'If enabled, show the manual text editor. Currently only available for first two values.',
			defaultValue: false
		},
		formatter: {
			description:
				'So although we used prefix and suffix to add some formatting before and after the values, we can also use the formatter function to format the values in any way we like. See https://simeydotme.github.io/svelte-range-slider-pips/en/examples/formatter/'
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

export const PrimaryWithTextEditor: Story = {
	args: {
		min: 0,
		max: 100,
		step: 1,
		values: [50],
		showEditor: true
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

export const FloatValueWithTextEditor: Story = {
	args: {
		min: 0,
		max: 100,
		step: 0.1,
		values: [50],
		showEditor: true
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

export const RangeSliderWithTextEditor: Story = {
	args: {
		min: 0,
		max: 100,
		step: 1,
		values: [30, 60],
		showEditor: true
	}
};

export const WithPrefix: Story = {
	args: {
		min: 0,
		max: 10,
		step: 1,
		values: [5],
		suffix: 'x'
	}
};

export const WithSuffix: Story = {
	args: {
		min: 0,
		max: 100,
		step: 1,
		values: [50],
		suffix: '%'
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

const options = [
	'No clouds',
	'Almost no clouds',
	'Very few clouds',
	'Partially cloudy',
	'Cloudy',
	'Very cloudy'
];

export const Formatter: Story = {
	args: {
		min: 0,
		max: 5,
		step: 1,
		values: [1],
		all: 'label',
		formatter: (value) => {
			const label = options[value];
			return label;
		}
	}
};
