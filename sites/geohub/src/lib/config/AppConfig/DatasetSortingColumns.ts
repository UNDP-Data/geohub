import type { Radio } from '@undp-data/svelte-undp-design';

export const DatasetSortingColumns: Radio[] = [
	{
		value: 'name,asc',
		label: 'A to Z'
	},
	{
		value: 'name,desc',
		label: 'Z to A'
	},
	{
		value: 'no_stars,desc',
		label: 'Most favourite'
	},
	{
		value: 'updatedat,desc',
		label: 'Most recent'
	},
	{
		value: 'updatedat,asc',
		label: 'Less recent'
	}
];
