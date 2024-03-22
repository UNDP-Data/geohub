import type { FooterItem } from '@undp-data/svelte-undp-design';

export const FooterItems: {
	[key: string]: FooterItem[];
} = {
	GeoHub: [
		{
			title: 'Home',
			url: '/'
		},
		{
			title: 'Data',
			url: '/data'
		},
		{
			title: 'Data upload',
			url: '/data/upload'
		},
		{
			title: 'Maps',
			url: '/maps'
		},
		{
			title: 'Tools',
			url: '/tools'
		},
		{
			title: 'Support',
			url: ''
		},
		{
			title: 'Licenses',
			url: '/license'
		}
	],
	Dashboard: [
		{
			title: 'Dashboards',
			url: '/dashboards'
		},
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
			title: 'REST API spec',
			url: '/api'
		},
		{
			title: 'Static Image API',
			url: ''
		},
		{
			title: 'Svelte UNDP design sytem',
			url: 'https://svelte-undp-design.undpgeohub.org'
		},
		{
			title: 'Svelte UNDP Components',
			url: 'https://svelte-components.undpgeohub.org'
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
		},
		{
			title: 'STAC management',
			url: '/management/stac'
		}
	]
};
