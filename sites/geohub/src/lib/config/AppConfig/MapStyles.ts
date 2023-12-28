import type { StyleDefinition } from '@undp-data/style-switcher';

const STYLE_VERSION = '1.2.1';

export const MapStyles: StyleDefinition[] = [
	{
		title: 'Carto',
		uri: `https://unpkg.com/@undp-data/style@${STYLE_VERSION}/dist/style.json`,
		image: `https://staticimage.undpgeohub.org/api/style/static/36.975,-1.364,1,0,0/60x60.webp?url=https://unpkg.com/@undp-data/style@${STYLE_VERSION}/dist/style.json&ratio=2`
	},
	{
		title: 'Bing Aerial',
		uri: `https://unpkg.com/@undp-data/style@${STYLE_VERSION}/dist/aerialstyle.json`,
		image: `https://staticimage.undpgeohub.org/api/style/static/36.975,-1.364,1,0,0/60x60.webp?url=https://unpkg.com/@undp-data/style@${STYLE_VERSION}/dist/aerialstyle.json&ratio=2`
	}
];
