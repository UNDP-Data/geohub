import type { Meta, StoryObj } from '@storybook/svelte';
import CountrySelector from './CountrySelector.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/CountrySelector',
	component: CountrySelector,
	tags: ['autodocs'],
	argTypes: {
		selected: {
			description: 'The list of iso3 country codes which are selcted',
			defaultValue: []
		},
		geohubOrigin: {
			type: 'string',
			description: 'Set GeoHub origin URL if you want to use it in other places',
			defaultValue: ''
		}
	}
} satisfies Meta<CountrySelector>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		selected: [],
		geohubOrigin: 'https://dev.undpgeohub.org'
	}
};

export const ShowOnlyCountryExists: Story = {
	args: {
		selected: [],
		showOnlyExists: true,
		geohubOrigin: 'https://dev.undpgeohub.org'
	}
};

export const Selected: Story = {
	args: {
		selected: ['KEN', 'RWA'],
		geohubOrigin: 'https://dev.undpgeohub.org'
	}
};
