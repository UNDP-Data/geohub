import type { Meta, StoryObj } from '@storybook/svelte';
import OpacityEditor from './OpacityEditor.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/OpacityEditor',
	component: OpacityEditor,
	tags: ['autodocs'],
	argTypes: {
		opacity: {
			type: 'number',
			description: 'Opacity value',
			defaultValue: 1
		},
		showOpacity: {
			type: 'boolean',
			description: 'If false, opacity control is hidden. default is true',
			defaultValue: true
		}
	}
} satisfies Meta<OpacityEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Visible: Story = {
	args: {
		opacity: 1
	}
};

export const HalfTransparent: Story = {
	args: {
		opacity: 50
	}
};

export const Transparent: Story = {
	args: {
		opacity: 0
	}
};

export const OpacityHidden: Story = {
	args: {
		opacity: 1,
		showOpacity: false
	}
};
