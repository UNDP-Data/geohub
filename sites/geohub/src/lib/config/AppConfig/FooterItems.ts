export const FooterItems: { [key: string]: { title: string; url: string }[] } = {
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
	]
};
