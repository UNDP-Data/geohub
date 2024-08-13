import type { Meta, StoryObj } from '@storybook/svelte';

import PagewideFeaturedContentCard from './PagewideFeaturedContentCard.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/PagewideFeaturedContentCard',
	component: PagewideFeaturedContentCard,
	tags: ['autodocs'],
	argTypes: {
		href: {
			type: 'string'
		},
		title: {
			type: 'string'
		},
		description: {
			type: 'string'
		},
		image: {
			type: 'string'
		},
		buttonText: {
			type: 'string',
			defaultValue: 'READ MORE'
		},
		accent: {
			type: 'string',
			defaultValue: 'global',
			control: { type: 'select' },
			options: ['global', 'yello', 'red', 'green', 'blue']
		},
		tag: {
			type: 'string',
			defaultValue: ''
		}
	}
} satisfies Meta<PagewideFeaturedContentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		href: '#',
		title: 'Socio-economic impact of COVID-19',
		description:
			'Across the globe, the UN is supporting countries in preparing assessments of the socio-economic impacts of Covid-19. What are these assessments saying and what are the key socio-economic issues caused by the pandemic that the UN and its partners are seeing on the ground?',
		image: '/media/Pagewide.7759e116.jpg',
		tag: 'CONTENT TAG'
	}
};
