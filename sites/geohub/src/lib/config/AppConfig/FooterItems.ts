import type { FooterItem } from '@undp-data/svelte-undp-design';

export const FooterItems: {
	[key: string]: FooterItem[];
} = {
	GeoHub: [
		{
			title: 'GeoHub',
			url: '/'
		},
		{
			title: 'Data',
			url: '/data'
		},
		{
			title: 'Map',
			url: '/map'
		},
		{
			title: 'Support',
			url: 'https://docs.undpgeohub.org'
		}
	],
	Dashboard: [
		{
			title: 'Electricity Dashboard',
			url: '/dashboards/electricity'
		}
	],
	'For Developers': [
		{
			title: 'Github Repo',
			url: 'https://github.com/UNDP-Data/geohub'
		},
		{
			title: 'GeoHub API documentation',
			url: '/api'
		},
		{
			title: 'Svelte UNDP design sytem',
			url: 'https://svelte-undp-design.undpgeohub.org'
		}
	],
	Management: [
		{
			title: 'Management tools',
			url: '/management'
		},
		{
			title: 'pg_tileserv management',
			url: '/management/pgtileserv'
		}
	]
};
