import type { Meta, StoryObj } from '@storybook/svelte';

import Card from './Card.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Card',
	component: Card,
	tags: ['autodocs'],
	argTypes: {
		linkName: {
			control: 'text',
			description: 'Name of link',
			defaultValue: 'READ MORE'
		},
		url: {
			control: 'text',
			description: 'URL to link',
			defaultValue: '#'
		},
		title: {
			control: 'text',
			description: 'Title of the post goes here and it’s two lines'
		},
		tag: {
			control: 'text',
			description: 'Content tag'
		},
		description: {
			control: 'text',
			description: 'Description of content'
		},
		isEmphasize: {
			control: 'boolean',
			description: 'If enabled, emphasize content by accent color.',
			defaultValue: false
		},
		accent: {
			control: 'select',
			options: ['global', 'yellow', 'green', 'red', 'blue'],
			description: 'accent color. global, yellow, red, blue, green is available',
			defaultValue: 'global'
		},
		icon: {
			type: 'string',
			description: 'Optional. Fontawesome icon class name.'
		}
	}
} satisfies Meta<Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'global'
	}
};

export const Emphasize: Story = {
	args: {
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'global',
		isEmphasize: true
	}
};

export const AccentYellow: Story = {
	args: {
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'yellow'
	}
};

export const AccentYellowEmphasized: Story = {
	args: {
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'yellow',
		isEmphasize: true
	}
};

export const AccentGreen: Story = {
	args: {
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'green'
	}
};

export const AccentGreenEmphasized: Story = {
	args: {
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'green',
		isEmphasize: true
	}
};

export const AccentRed: Story = {
	args: {
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'red'
	}
};

export const AccentRedEmphasized: Story = {
	args: {
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'red',
		isEmphasize: true
	}
};

export const AccentBlue: Story = {
	args: {
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'blue'
	}
};

export const AccentBlueEmphasized: Story = {
	args: {
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'blue',
		isEmphasize: true
	}
};

export const TitleWithIcon: Story = {
	args: {
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'global',
		icon: 'fas fa-home'
	}
};
