import type { Meta, StoryObj } from '@storybook/svelte';
import '@undp-data/undp-bulma/dist/style.css';
import Help from './Help.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Help',
	component: Help,
	tags: ['autodocs'],
	argTypes: {
		maxWidth: {
			type: 'number',
			description: 'Max width of help popup',
			defaultValue: 300
		}
	}
} satisfies Meta<Help>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		maxWidth: 300
	}
};
