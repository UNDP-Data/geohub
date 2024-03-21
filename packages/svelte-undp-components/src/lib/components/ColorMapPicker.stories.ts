import type { Meta, StoryObj } from '@storybook/svelte';
import {
	DivergingColorMaps,
	QualitativeColorMaps,
	SequentialColormaps
} from './ColorMapPickerCard.svelte';
import ColorMapPicker from './ColorMapPicker.svelte';

const allColormaps = [...SequentialColormaps, ...DivergingColorMaps, ...QualitativeColorMaps];
allColormaps.push(...allColormaps.map((c) => `${c}_r`));

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/ColorMapPicker',
	component: ColorMapPicker,
	tags: ['autodocs'],
	argTypes: {
		colorMapName: {
			control: 'select',
			options: allColormaps
		}
	}
} satisfies Meta<ColorMapPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		colorMapName: allColormaps[0]
	}
};

export const ReverseColor: Story = {
	args: {
		colorMapName: `${allColormaps[0]}_r`
	}
};
