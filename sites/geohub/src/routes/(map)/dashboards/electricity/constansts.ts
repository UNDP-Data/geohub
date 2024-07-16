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
			id: 'add1242d0e4a705d75fd93fe7754e179'
		},
		{
			year: 2022,
			id: '6978ef8b35e07ca5e12e263ec5f24ca6'
		},
		{
			year: 2023,
			id: '3504d57c71101d974943410a1403cd1d'
		},
		{
			year: 2024,
			id: '23b67271e93a510e1c5fc4075fecfc9c'
		},
		{
			year: 2025,
			id: 'd5252ef98bfc95ffb6b5152a5783fa70'
		},
		{
			year: 2026,
			id: '3f70e55304345faad0aacd2334ece862'
		},
		{
			year: 2027,
			id: '6befca9038ea303bfc1319415b51f923'
		},
		{
			year: 2028,
			id: '8e3ff7e2b48a07fe39b99c1e8fb7bab7'
		},
		{
			year: 2029,
			id: 'f91d5b1a279ebed4daae06d2c3e55da9'
		},
		{
			year: 2030,
			id: '848131f9ba188d9a5b102ee4fbe4fed3'
		}
	]
};
