import type { Meta, StoryObj } from '@storybook/svelte';

import Footer from './Footer.svelte';

const footerItems: { [key: string]: { title: string; url: string }[] } = {
	GeoHub: [
		{
			title: 'GeoHub',
			url: 'https://geohub.data.undp.org'
		},
		{
			title: 'GeoHub dashboard',
			url: 'https://geohub.data.undp.org/dashboards'
		},
		{
			title: 'GeoHub electricity dashboard',
			url: 'https://geohub.data.undp.org/dashboards/electricity'
		}
	],
	GeoHub1: [
		{
			title: 'GeoHub',
			url: 'https://geohub.data.undp.org'
		},
		{
			title: 'GeoHub dashboard',
			url: 'https://geohub.data.undp.org/dashboards'
		},
		{
			title: 'GeoHub electricity dashboard',
			url: 'https://geohub.data.undp.org/dashboards/electricity'
		}
	],
	GeoHub2: [
		{
			title: 'GeoHub',
			url: 'https://geohub.data.undp.org'
		},
		{
			title: 'GeoHub dashboard',
			url: 'https://geohub.data.undp.org/dashboards'
		},
		{
			title: 'GeoHub electricity dashboard',
			url: 'https://geohub.data.undp.org/dashboards/electricity'
		}
	],
	GeoHub3: [
		{
			title: 'GeoHub',
			url: 'https://geohub.data.undp.org'
		},
		{
			title: 'GeoHub dashboard',
			url: 'https://geohub.data.undp.org/dashboards'
		},
		{
			title: 'GeoHub electricity dashboard',
			url: 'https://geohub.data.undp.org/dashboards/electricity'
		}
	]
};

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Footer',
	component: Footer,
	tags: ['autodocs'],
	argTypes: {
		logoUrl: {
			type: 'string',
			description: 'UNDP logo URL',
			defaultValue: undefined
		},
		footerItems: {
			// type: 'string',
			description: 'Items to be shown in footer',
			defaultValue: undefined
		}
	}
} satisfies Meta<Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		logoUrl: 'assets/undp-logo-white.svg',
		footerItems: footerItems
	}
};
