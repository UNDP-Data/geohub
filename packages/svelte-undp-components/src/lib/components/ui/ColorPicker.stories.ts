import type { Meta, StoryObj } from '@storybook/svelte';
import ColorPicker from './ColorPicker.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/UI/ColorPicker',
	component: ColorPicker,
	tags: ['autodocs'],
	argTypes: {}
} satisfies Meta<ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		color: {
			r: 255,
			g: 0,
			b: 0,
			a: 1
		}
	}
};
