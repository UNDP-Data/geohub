import type { Meta, StoryObj } from '@storybook/svelte';

import Radios from './Radios.svelte';
import type { Radio } from '$lib/interfaces';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Radios',
	component: Radios,
	tags: ['autodocs'],
	argTypes: {
		radios: {
			// type: 'string',
			description: 'Items to be shown as radio buttons',
			defaultValue: undefined
		},
		groupName: {
			type: 'string',
			description: 'Group name of radio buttons',
			defaultValue: undefined
		},
		value: {
			type: 'string',
			description: 'Selected radio button value binded in this component',
			defaultValue: undefined
		},
		isVertical: {
			type: 'boolean',
			description: 'If enabled, radio buttons are shown in vertical alignment',
			defaultValue: false
		},
		allowHtml: {
			type: 'boolean',
			description: 'If enabled, HTML text can be used in label of radio buttons',
			defaultValue: false
		}
	}
} satisfies Meta<Radios>;

export default meta;
type Story = StoryObj<typeof meta>;

const radios: Radio[] = [
	{
		label: 'radio A',
		value: 'a'
	},
	{ label: 'radio B', value: 'b' }
];
const selectedValue = radios[0].value;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		radios: radios,
		groupName: 'radio-buttons-1',
		value: selectedValue,
		isVertical: false
	}
};

const radios2: Radio[] = [
	{
		label: '<b>radio A</b>',
		value: 'a'
	},
	{ label: '<b>radio B</b>', value: 'b' }
];
const selectedValue2 = radios[0].value;

export const CustomStyledLabel: Story = {
	args: {
		radios: radios2,
		groupName: 'radio-buttons-2',
		value: selectedValue2,
		isVertical: false,
		allowHtml: true
	}
};

export const Vertical: Story = {
	args: {
		radios: radios,
		groupName: 'radio-buttons-3',
		value: selectedValue,
		isVertical: true
	}
};
