import type { HeaderLink } from '@undp-data/svelte-undp-design';

type LineName = 'home' | 'map' | 'support' | 'data' | 'tools';

export const HeaderItems = (linkNames: LineName[]) => {
	const links: { [key: string]: HeaderLink } = {
		home: {
			id: 'header-link-home',
			title: 'Home',
			href: '/'
		},
		map: {
			id: 'header-link-map',
			title: 'Maps',
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
		},
		tools: {
			id: 'header-link-tool',
			title: 'Tools',
			tooltip: 'Explore tools',
			href: '/tools'
		}
	};

	return linkNames.map((name) => links[name]);
};
