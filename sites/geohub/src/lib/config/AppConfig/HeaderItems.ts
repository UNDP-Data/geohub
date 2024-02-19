import type { HeaderLink } from '@undp-data/svelte-undp-design';

type LineName = 'home' | 'map' | 'support' | 'data';

export const HeaderItems = (linkNames: LineName[]) => {
	const links: { [key: string]: HeaderLink } = {
		home: {
			id: 'header-link-home',
			title: 'Home',
			href: '/'
		},
		map: {
			id: 'header-link-map',
			title: 'Map',
			tooltip: 'Explore maps',
			href: '/maps'
		},
		support: {
			id: 'header-link-documentation',
			title: 'Support',
			tooltip: 'Go to userguide',
			href: 'https://docs.undpgeohub.org'
		},
		data: {
			id: 'header-link-data',
			title: 'Data',
			tooltip: 'Explore datasets',
			href: '/data'
		}
	};

	return linkNames.map((name) => links[name]);
};
