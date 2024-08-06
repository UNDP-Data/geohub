import type { HeaderLink } from '@undp-data/svelte-undp-design';
import { env } from '$env/dynamic/private';

export type LineName = 'home' | 'map' | 'support' | 'data' | 'tools' | 'storymap';

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
			href: env.GEOHUB_DOCS_ENDPOINT ?? ''
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
		},
		storymap: {
			id: 'header-link-storymap',
			title: 'Storymaps',
			tooltip: 'Explore storymaps',
			href: '/storymaps'
		}
	};

	let linkItems = linkNames.map((name) => links[name]);

	linkItems = linkItems.filter((l) => l.href !== '');

	return linkItems;
};
