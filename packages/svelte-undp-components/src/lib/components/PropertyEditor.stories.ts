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
		isExpanded: {
			type: 'boolean',
			defaultValue: false
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
