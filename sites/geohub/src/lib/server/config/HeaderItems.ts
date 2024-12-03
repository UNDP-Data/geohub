import type { HeaderLink } from '@undp-data/svelte-undp-design';
import { env } from '$env/dynamic/private';

export type LineName = 'home' | 'map' | 'support' | 'data' | 'tools';

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
			children: [
				{
					id: 'header-link-map-1',
					title: 'Create a map',
					href: '/maps/edit'
				},
				{
					id: 'header-link-map-2',
					title: 'Explore maps',
					href: '/maps'
				}
			]
		},
		support: {
			id: 'header-link-support',
			title: 'Support',
			href: env.GEOHUB_DOCS_ENDPOINT ?? '',
			children: [
				{
					id: 'header-sublink-documentation',
					title: 'Documentation',
					href: env.GEOHUB_DOCS_ENDPOINT ?? ''
				},
				{
					id: 'header-sublink-github',
					title: 'GitHub repo',
					href: 'https://github.com/UNDP-Data/geohub'
				},
				{
					id: 'header-sublink-contactus',
					title: 'Contact us',
					href: 'https://data.undp.org/contact-us'
				}
			]
		},
		data: {
			id: 'header-link-data',
			title: 'Data',
			children: [
				{
					id: 'header-link-data-1',
					title: 'Upload dataset',
					href: '/data/upload'
				},
				{
					id: 'header-link-data-2',
					title: 'Explore datasets',
					href: '/data'
				}
			]
		},
		tools: {
			id: 'header-link-tool',
			title: 'Tools',
			children: [
				{
					id: 'header-link-tool-1',
					title: 'Explore tools',
					href: '/tools'
				},
				{
					id: 'header-link-tool-2',
					title: 'Create storymap',
					href: '/storymaps/edit'
				},
				{
					id: 'header-link-tool-3',
					title: 'Explore Storymaps',
					href: '/storymaps'
				},
				{
					id: 'header-link-tool-4',
					title: 'Electricity dashboard',
					href: '/dashboards/electricity'
				},
				{
					id: 'header-link-tool-5',
					title: 'CEEI dashboard',
					href: '/dashboards/ceei'
				},
				{
					id: 'header-link-tool-6',
					title: 'Zanbibar dashboard',
					href: '/dashboards/zanzibar'
				}
			]
		}
	};

	let linkItems = linkNames.map((name) => links[name]);

	linkItems = linkItems.filter((l) => l.href !== '');

	return linkItems;
};
