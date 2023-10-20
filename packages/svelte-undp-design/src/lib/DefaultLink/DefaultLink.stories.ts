import type { Meta, StoryObj } from '@storybook/svelte';

import DefaultLink from './DefaultLink.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Example/DefaultLink',
	component: DefaultLink,
	tags: ['autodocs'],
	argTypes: {
		title: {
			type: 'string',
			description: 'Label and tooltip to be shown in link',
			defaultValue: 'UNDP'
		},
		href: {
			type: 'boolean',
			description: 'The URL that the hyperlink points to',
			defaultValue: false
		}
	}
} satisfies Meta<DefaultLink>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		title: 'UNDP',
		href: 'https://undp.org'
	}
};
