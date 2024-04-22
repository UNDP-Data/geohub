import type { RequestHandler } from './$types';
import type { StyleSpecification } from 'maplibre-gl';

import voyagerStyle from '@undp-data/style/dist/style.json';
import aerialStyle from '@undp-data/style/dist/aerialstyle.json';
import { resolveSpriteUrl } from '$lib/server/helpers';

export const GET: RequestHandler = async ({ params, url }) => {
	const styleId = params.id;

	let style: StyleSpecification = JSON.parse(JSON.stringify(voyagerStyle));
	if (styleId === 'aerialstyle') {
		style = JSON.parse(JSON.stringify(aerialStyle));
	}
	style.sprite = resolveSpriteUrl(style.sprite, url.origin);
	return new Response(JSON.stringify(style));
};
