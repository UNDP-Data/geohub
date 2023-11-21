import type { StyleDefinition } from '@undp-data/style-switcher';

export const MapStyles: StyleDefinition[] = [
	{
		title: 'Carto',
		uri: 'https://unpkg.com/@undp-data/style@latest/dist/style.json',
		image:
			'https://staticimage.undpgeohub.org/api/style/static/36.975,-1.364,1,0,0/60x60.webp?url=https://unpkg.com/@undp-data/style@latest/dist/style.json&ratio=2'
	},
	{
		title: 'Bing Aerial',
		uri: 'https://unpkg.com/@undp-data/style@latest/dist/aerialstyle.json',
		image:
			'https://staticimage.undpgeohub.org/api/style/static/36.975,-1.364,1,0,0/60x60.webp?url=https://unpkg.com/@undp-data/style@latest/dist/aerialstyle.json&ratio=2'
	}
];
