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
		showOnlyExists: {
			type: 'boolean',
			description: 'If true, it shows countries which are registered for GeoHub datasets',
			defaultValue: false
		},
		placeholder: {
			type: 'string',
			description: 'Placeholder text shown in search box.',
			defaultValue: 'Type country name or ISO code'
		},
		geohubOrigin: {
			type: 'string',
			description: 'Set GeoHub origin URL if you want to use it in other places',
			defaultValue: ''
		},
		continents: {
			description:
				'An array of continent code returned from /api/continents API. If regions are set, continets will be ignored.',
			defaultValue: []
		},
		regions: {
			description: 'An array of region code returned from /api/regions API.',
			defaultValue: []
		},
		showSelectedCountries: {
			type: 'boolean',
			description: 'If true, show selected countries in the top of tooltip.',
			defaultValue: true
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

export const hideSelectedCountryChips: Story = {
	args: {
		selected: [],
		showOnlyExists: true,
		geohubOrigin: 'https://dev.undpgeohub.org',
		showSelectedCountries: false
	}
};

export const FilterByAfrica: Story = {
	args: {
		selected: [],
		geohubOrigin: 'https://dev.undpgeohub.org',
		continents: [2]
	}
};

export const FilterByAfricaAndAsia: Story = {
	args: {
		selected: [],
		geohubOrigin: 'https://dev.undpgeohub.org',
		continents: [2, 142]
	}
};

export const FilterByEastAsia: Story = {
	args: {
		selected: [],
		geohubOrigin: 'https://dev.undpgeohub.org',
		regions: [30]
	}
};

export const FilterByCentralAndEastAsia: Story = {
	args: {
		selected: [],
		geohubOrigin: 'https://dev.undpgeohub.org',
		regions: [143, 30]
	}
};
