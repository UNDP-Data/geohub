import type { Meta, StoryObj } from '@storybook/svelte';
import LegendColorMapRow from './LegendColorMapRow.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Maplibre/util/LegendColorMapRow',
	component: LegendColorMapRow,
	tags: ['autodocs'],
	argTypes: {}
} satisfies Meta<LegendColorMapRow>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const RangedValues: Story = {
	args: {
		colorMapRow: {
			start: 0,
			end: 100,
			color: [255, 0, 0, 1]
		},
		colorMapName: 'viridis',
		hasUniqueValues: false,
		readonly: false
	}
};

export const RangedValuesReadonly: Story = {
	args: {
		colorMapRow: {
			start: 0,
			end: 100,
			color: [255, 0, 0, 1]
		},
		colorMapName: 'viridis',
		hasUniqueValues: false,
		readonly: true
	}
};

export const UniqueValue: Story = {
	args: {
		colorMapRow: {
			value: 'Unique value category',
			color: [255, 0, 0, 1]
		},
		colorMapName: 'viridis',
		hasUniqueValues: true,
		readonly: false
	}
};

export const UniqueValueReadonly: Story = {
	args: {
		colorMapRow: {
			value: 'Unique value category',
			color: [255, 0, 0, 1]
		},
		colorMapName: 'viridis',
		hasUniqueValues: true,
		readonly: true
	}
};
