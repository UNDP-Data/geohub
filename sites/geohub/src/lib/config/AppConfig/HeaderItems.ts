import type { HeaderLink } from '@undp-data/svelte-undp-design';

type LineName = 'home' | 'map' | 'support' | 'data';

export const HeaderItems = (linkNames: LineName[]) => {
	const links: { [key: string]: HeaderLink } = {
		home: {
			id: 'header-link-home',
			title: 'Home',
			tooltip: 'GeoHub home',
			href: '/'
		},
		map: {
			id: 'header-link-map',
			title: 'Map',
			tooltip: 'Open map editor',
			href: '/map'
		},
		support: {
			id: 'header-link-documentation',
			title: 'Support',
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
