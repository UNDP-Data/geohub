import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import type { StyleSpecification } from 'maplibre-gl';

import voyagerStyle from '@undp-data/style/dist/style.json';
import aerialStyle from '@undp-data/style/dist/aerialstyle.json';
import darkstyle from '@undp-data/style/dist/dark.json';
import positronstyle from '@undp-data/style/dist/positron.json';
import blankStyle from '@undp-data/style/dist/blank.json';
import { resolveSpriteUrl } from '$lib/server/helpers';

export const Param = z.object({
	id: z.enum(['style', 'dark', 'aerialstyle', 'positron', 'blank']).describe('basemap id')
});

export const Output = z.custom<StyleSpecification>().describe('returns maplibre style.json');

const description = `
Get Maplibre style.json for basemap.

The style files are hosted by the following structure

- /mapstyle/style.json
- /mapstyle/dark.json
- /mapstyle/positron.json
- /mapstyle/aerialstyle.json
- /mapstyle/blank.json
- /mapstyle/sprite/sprite
- /mapstyle/sprite-non-sdf/sprite

Maplibre Stylefiles are managed at https://github.com/UNDP-Data/style
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get Maplibre Basemap Style';
	c.description = description;
	c.tags = ['BaseMapStyle'];
	return c;
};

export default new Endpoint({ Param, Output, Modifier }).handle(async (param, { url }) => {
	const styleId = param.id;

	let style: StyleSpecification = JSON.parse(JSON.stringify(voyagerStyle));
	if (styleId === 'aerialstyle') {
		style = JSON.parse(JSON.stringify(aerialStyle));
	} else if (styleId === 'dark') {
		style = JSON.parse(JSON.stringify(darkstyle));
	} else if (styleId === 'positron') {
		style = JSON.parse(JSON.stringify(positronstyle));
	} else if (styleId === 'blank') {
		style = JSON.parse(JSON.stringify(blankStyle));
	}
	if (style.sprite) {
		style.sprite = resolveSpriteUrl(style.sprite, url.origin);
	}
	return style;
});
