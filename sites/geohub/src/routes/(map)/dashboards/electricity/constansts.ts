// must specify dataset ID of GeoHub api

import type { DashBoardDataset } from './+page.svelte';

// token and URL of datasets will be retrieved from /api/datasets/{id} API
export const ELECTRICITY_DATASETS: { [key: string]: DashBoardDataset[] } = {
	hrea: [
		{
			year: 2012,
			id: 'c41c45f0cd161ba9cbc9a509b69c5802'
		},
		{
			year: 2013,
			id: 'fc14b802052964da92279dac72d3c882'
		},
		{
			year: 2014,
			id: '3ebea4abe8cea3ead91a1bd530d1ece4'
		},
		{
			year: 2015,
			id: '2294a356bcc4888f3d17ad1446bf8271'
		},
		{
			year: 2016,
			id: 'b5c13eafae9512877b36e3c538512829'
		},
		{
			year: 2017,
			id: '9425d222908f3d41ea4e8c6546d4e6d8'
		},
		{
			year: 2018,
			id: 'a9eb4d7d312043c0401763e908f5d413'
		},
		{
			year: 2019,
			id: 'f47903f864bc064d8e12e2ece591c238'
		},
		{
			year: 2020,
			id: '724417aac902cc839818fcca21548b2e'
		}
	]
};
