import type { Meta, StoryObj } from '@storybook/svelte';
import BackToTop from './BackToTop.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/BackToTop',
	component: BackToTop,
	tags: ['autodocs'],
	argTypes: {
		top: {
			type: 'string',
			description: 'The top value where the button is shown from the top of window. Default it 0',
			defaultValue: '0'
		},
		showOnPx: {
			type: 'number',
			description: 'If scrollTop is greater than this value, show the button',
			defaultValue: 150
		},
		hidden: {
			type: 'boolean',
			description: 'The hidden property of the button. Default is true.',
			defaultValue: true
		},
		timeToHidden: {
			type: 'number',
			description: 'Milliseconds to hide the button once it is shown.',
			defaultValue: 5000
		}
	}
} satisfies Meta<BackToTop>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		top: '130px'
	}
};
