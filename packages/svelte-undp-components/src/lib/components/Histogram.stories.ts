import type { Meta, StoryObj } from '@storybook/svelte';
import Histogram from './Histogram.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Histogram',
	component: Histogram,
	tags: ['autodocs'],
	argTypes: {
		counts: {
			description: 'number[]. counts for histogram.'
		},
		bins: {
			description: 'number[]. bins for histogram'
		},
		unit: {
			type: 'string',
			description: 'Unit of x axis',
			defaultValue: ''
		},
		xLabel: {
			type: 'string',
			description: 'Label of x axis',
			defaultValue: ''
		},
		yLabel: {
			type: 'string',
			description: 'Label of y axis',
			defaultValue: ''
		}
	}
} satisfies Meta<Histogram>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		counts: [26, 29, 19, 10, 2],
		bins: [
			618171.2204, 3461570.8983199997, 6304970.576239999, 9148370.254159998, 11991769.932079997,
			14835169.609999996
		],
		unit: 'm2',
		xLabel: 'Area',
		yLabel: 'Count'
	}
};

export const WithoutLabel: Story = {
	args: {
		counts: [26, 29, 19, 10, 2],
		bins: [
			618171.2204, 3461570.8983199997, 6304970.576239999, 9148370.254159998, 11991769.932079997,
			14835169.609999996
		]
	}
};
