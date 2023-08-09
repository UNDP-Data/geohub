import type { HeaderLink } from '@undp-data/svelte-undp-design';

type LineName = 'home' | 'maps' | 'dashboard' | 'userguide' | 'data';

export const HeaderItems = (linkNames: LineName[]) => {
	const links: { [key: string]: HeaderLink } = {
		home: {
			id: 'header-link-home',
			title: 'Home',
			tooltip: 'GeoHub home',
			href: '/'
		},
		maps: {
			id: 'header-link-maps',
			title: 'Maps',
			tooltip: 'Explore shared maps',
			href: '/maps'
		},
		dashboard: {
			id: 'header-link-dashboard',
			title: 'Dashboards',
			tooltip: 'Go to dashboards',
			href: '/dashboards'
		},
		userguide: {
			id: 'header-link-documentation',
			title: 'User guide',
			tooltip: 'Read user guide documentation',
			href: 'https://docs.undpgeohub.org'
		},
		data: {
			id: 'header-link-data',
			title: 'Data',
			tooltip: 'Manage my datasets',
			href: '/data'
		}
	};

	return linkNames.map((name) => links[name]);
};
