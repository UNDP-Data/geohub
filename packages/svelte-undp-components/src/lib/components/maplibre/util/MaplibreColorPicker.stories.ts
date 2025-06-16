import type { Meta, StoryObj } from '@storybook/sveltekit';
import MaplibreColorPicker from './MaplibreColorPicker.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Maplibre/util/MaplibreColorPicker',
	component: MaplibreColorPicker,
	tags: ['autodocs'],
	argTypes: {}
} satisfies Meta<MaplibreColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		rgba: 'rgba(255,0,0,1)'
	}
};

export const Readonly: Story = {
	args: {
		rgba: 'rgba(255,0,0,1)',
		readonly: true
	}
};

export const NarrowWidth: Story = {
	args: {
		rgba: 'rgba(255,0,0,1)',
		width: '40px'
	}
};
