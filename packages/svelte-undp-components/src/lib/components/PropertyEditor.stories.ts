import type { Meta, StoryObj } from '@storybook/svelte';
import PropertyEditor from './PropertyEditor.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/PropertyEditor',
	component: PropertyEditor,
	tags: ['autodocs'],
	argTypes: {
		id: {
			type: 'string'
		},
		type: {
			control: 'select',
			options: ['integer', 'number', 'boolean', 'string']
		},
		title: {
			type: 'string'
		},
		description: {
			type: 'string',
			defaultValue: ''
		},
		icon: {
			type: 'string',
			defaultValue: ''
		},
		value: {
			description: 'value which type is either number or string or boolean binded to input element'
		},
		defaultValue: {
			description: 'default value'
		},
		minimum: {
			type: 'number',
			defaultValue: undefined
		},
		maximum: {
			type: 'number',
			defaultValue: undefined
		},
		exclusiveMinimum: {
			type: 'number',
			defaultValue: undefined
		},
		exclusiveMaximum: {
			type: 'number',
			defaultValue: undefined
		},
		showPrefix: {
			type: 'boolean',
			defaultValue: false
		},
		unit: {
			type: 'string',
			defaultValue: ''
		},
		isExpanded: {
			type: 'boolean',
			defaultValue: false
		},
		showEditor: {
			type: 'boolean',
			defaultValue: false
		},
		showRestPip: {
			control: 'select',
			options: ['label', 'pip', true, false],
			description:
				'Whether to show a pip or label for all values except first & last. See https://simeydotme.github.io/svelte-range-slider-pips/en/options/#rest',
			defaultValue: true
		},
		showAll: {
			control: 'select',
			options: ['label', 'pip', false],
			defaultValue: false
		},
		formatter: {
			description:
				'So although we used prefix and suffix to add some formatting before and after the values, we can also use the formatter function to format the values in any way we like. See https://simeydotme.github.io/svelte-range-slider-pips/en/examples/formatter/'
		}
	}
} satisfies Meta<PropertyEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		id: 'property',
		type: 'integer',
		title: 'Property name',
		description: 'Property description',
		value: 5,
		defaultValue: 0,
		minimum: 0,
		maximum: 10
	}
};

export const DefaultCollapsed: Story = {
	args: {
		id: 'property',
		type: 'integer',
		title: 'Property name',
		description: 'Property description',
		value: 0,
		defaultValue: 0
	}
};

export const DefaultExpanded: Story = {
	args: {
		id: 'property',
		type: 'integer',
		title: 'Property name',
		description: 'Property description',
		value: 0,
		defaultValue: 0,
		isExpanded: true
	}
};

export const Icon: Story = {
	args: {
		id: 'property',
		type: 'integer',
		title: 'Property name',
		description: 'Property description',
		icon: 'fas fa-user fa-lg',
		value: 5,
		defaultValue: 0,
		minimum: 0,
		maximum: 10
	}
};

export const IntegerNumberInput: Story = {
	args: {
		id: 'property',
		type: 'integer',
		title: 'Property name',
		description: 'Property description',
		value: 5,
		defaultValue: 0,
		isExpanded: true
	}
};

export const FloatValueNumberInput: Story = {
	args: {
		id: 'property',
		type: 'number',
		title: 'Property name',
		description: 'Property description',
		value: 2.5,
		defaultValue: 0,
		isExpanded: true
	}
};

export const IntegerSlider: Story = {
	args: {
		id: 'property',
		type: 'integer',
		title: 'Property name',
		description: 'Property description',
		value: 5,
		defaultValue: 0,
		minimum: 0,
		maximum: 10,
		isExpanded: true
	}
};

export const IntegerSliderWithEditor: Story = {
	args: {
		id: 'property',
		type: 'integer',
		title: 'Property name',
		description: 'Property description',
		value: 5,
		defaultValue: 0,
		minimum: 0,
		maximum: 10,
		isExpanded: true,
		showEditor: true
	}
};

export const IntegerSliderExclusiveMinMax: Story = {
	args: {
		id: 'property',
		type: 'integer',
		title: 'Property name',
		description: 'Property description',
		value: 5,
		defaultValue: 0,
		exclusiveMinimum: 0,
		exclusiveMaximum: 10,
		isExpanded: true
	}
};

export const FloatValueSlider: Story = {
	args: {
		id: 'property',
		type: 'number',
		title: 'Property name',
		description: 'Property description',
		value: 2.5,
		defaultValue: 0,
		minimum: 0,
		maximum: 10,
		isExpanded: true
	}
};

export const ShowPrefixNumber: Story = {
	args: {
		id: 'property',
		type: 'integer',
		title: 'Property name',
		description: 'Property description',
		value: 5,
		defaultValue: 0,
		isExpanded: true,
		showPrefix: true
	}
};

export const ShowUnit: Story = {
	args: {
		id: 'property',
		type: 'integer',
		title: 'Property name',
		description: 'Property description',
		value: 5,
		defaultValue: 0,
		isExpanded: true,
		unit: '%'
	}
};

export const BooleanValue: Story = {
	args: {
		id: 'property',
		type: 'boolean',
		title: 'Property name',
		description: 'Property description',
		value: true,
		defaultValue: false,
		isExpanded: true
	}
};

export const StringValue: Story = {
	args: {
		id: 'property',
		type: 'string',
		title: 'Property name',
		description: 'Property description',
		value: 'string value....',
		defaultValue: '',
		isExpanded: true
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

export const IntegerSliderWithFormatter: Story = {
	args: {
		id: 'property',
		type: 'integer',
		title: 'Property name',
		description: 'Property description',
		value: 1,
		defaultValue: 1,
		minimum: 0,
		maximum: 5,
		isExpanded: true,
		showAll: 'label',
		showRestPip: true,
		formatter: (value) => {
			const label = options[value];
			return label;
		}
	}
};
