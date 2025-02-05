// must specify dataset ID of GeoHub api

import type { DashBoardDataset } from './+page.svelte';

// token and URL of datasets will be retrieved from /api/datasets/{id} API
export const ELECTRICITY_DATASETS: { [key: string]: DashBoardDataset[] } = {
	hrea: [
		{
			year: 2012,
			id: '2d4a3091ff7a97e6ebea5c86267ae37d'
		},
		{
			year: 2013,
			id: '3f738c54bedbc52a08735bc4efa63d20'
		},
		{
			year: 2014,
			id: 'e20bcc8ef2024d811fb4cf3e69c3ae37'
		},
		{
			year: 2015,
			id: '60566fcdfe72a3bd74eebf9af0a0e078'
		},
		{
			year: 2016,
			id: '0c99b27a7ac2fdee636f17f2a8aa8854'
		},
		{
			year: 2017,
			id: 'e7e87d4aea658252239e5f0814e43dc0'
		},
		{
			year: 2018,
			id: '58b0cedfafab6157c851dd650607cc71'
		},
		{
			year: 2019,
			id: '3493ef92a9609f435cd56414dd1d2db0'
		},
		{
			year: 2020,
			id: '2a0f67d579e404b0447040b55c2297e0'
		},
		{
			year: 2021,
			id: 'f9ffacfc690536d81a0a717c730be456'
		},
		{
			year: 2022,
			id: 'ad586554a64bab5109675f83bdf86692'
		},
		{
			year: 2023,
			id: 'a3879ca5d88fd7f9b3dcc673849723cc'
		},
		{
			year: 2024,
			id: '868b9f6c6286e71bcb45ea0992d5cdff'
		},
		{
			year: 2025,
			id: '6b21989538ea91c6e66a954511aa8bb9'
		},
		{
			year: 2026,
			id: 'b08ca6fe789fcac1e88fd055a23dffcd'
		},
		{
			year: 2027,
			id: '49968b41e89940ff9da64ba8fb4b12b6'
		},
		{
			year: 2028,
			id: '203f0ff05d030a253a5bb6350f1db142'
		},
		{
			year: 2029,
			id: '9df4a1f87a15ab634dafdea4d82e828d'
		},
		{
			year: 2030,
			id: '12225a0bc97b522681daed74951bd24f'
		}
	]
};

export const HREA_MAX_YEAR = 2030;
export const HREA_MIN_YEAR = 2012;
