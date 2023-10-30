import type { Meta, StoryObj } from '@storybook/svelte';

import CtaLink from './CtaLink.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Example/CtaLink',
	component: CtaLink,
	tags: ['autodocs'],
	argTypes: {
		label: {
			type: 'string',
			description: 'label to be shown in link',
			defaultValue: undefined
		},
		isArrow: {
			type: 'boolean',
			description: 'If enabled, arrow will be shown in link',
			defaultValue: false
		}
	}
} satisfies Meta<CtaLink>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		label: 'Read more',
		isArrow: true
	}
};

export const Arrow: Story = {
	args: {
		label: 'Read more',
		isArrow: true
	}
};

export const WithoutArrow: Story = {
	args: {
		label: 'Read more',
		isArrow: false
	}
};

export const WithHref: Story = {
	args: {
		label: 'Read more',
		isArrow: false,
		href: '#'
	}
};
