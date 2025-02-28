import { Endpoint, z, type RouteModifier, error as apiError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { error } from '@sveltejs/kit';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import { MapStyleIds, type MapStyleType } from '$lib/config/AppConfig';
import { getStyleById } from '$lib/server/helpers/getStyleById';
import type { DashboardMapStyle } from '$lib/types';
import type { LayerSpecification, SourceSpecification, StyleSpecification } from 'maplibre-gl';

export const Output = z.custom<StyleSpecification>().describe('Style object to return');

export const Param = z.object({
	id: z.string().describe('Style ID')
});

export const Query = z.object({
	exclude: z
		.string()
		.optional()
		.default('false')
		.describe('If true, exclude basemap layers from style.json'),
	basemap: z
		.enum(['style', 'aerialstyle', 'dark', 'positron', 'blank'])
		.optional()
		.describe('Optional. Switch basemap to user desired style'),
	hillshade: z
		.string()
		.optional()
		.default('false')
		.describe('Optional. If true, enable hillshade layer in style'),
	terrain: z
		.string()
		.optional()
		.default('false')
		.describe('Optional. If true, enable terrain in style')
});

export const Error = {
	400: apiError(400, `Invalid parameters`),
	404: apiError(403, 'Not found')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'get style.json by ID';
	c.description = 'get style.json by ID';
	c.tags = ['style'];
	c = AddSecurictyModifier(c);
	return c;
};

export default new Endpoint({ Param, Query, Output, Error, Modifier }).handle(
	async (param, { url, locals }) => {
		const session = await locals.auth();

		const styleId = Number(param.id);
		if (!styleId) {
			error(400, { message: `id parameter is required.` });
		}
		const user_email = session?.user.email;

		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}

		const basemap = (param.basemap as MapStyleType) ?? '';
		if (basemap.length > 0 && !MapStyleIds.includes(basemap)) {
			error(400, {
				message: `Invalid basemap parameter. It must be one of ${MapStyleIds.join(', ')}.`
			});
		}

		const hillshade = param.hillshade ?? 'false';
		const isHillshade = hillshade.toLowerCase() === 'true';

		const terrain = param.terrain ?? 'false';
		const isTerrain = terrain.toLowerCase() === 'true';

		const style = (await getStyleById(
			styleId,
			url,
			user_email,
			is_superuser,
			basemap,
			isHillshade,
			isTerrain
		)) as DashboardMapStyle;

		if (!style) {
			error(404, { message: `style not found` });
		}

		// if 'exclude' is True, remove basemap's sources and layers from the output style.json
		const excludeString = param.exclude;
		const exclude = excludeString === 'true' ? true : false;
		if (exclude) {
			const layerIds = style.layers?.map((l) => l.id);

			const layers: LayerSpecification[] = [];
			for (const layer of (style.style as StyleSpecification).layers) {
				if (layerIds?.includes(layer.id)) {
					layers.push(layer);
				}
			}
			(style.style as StyleSpecification).layers = layers;
			const sourceIds = layers.map((l) => l['source']);
			const sources: { [key: string]: SourceSpecification } = {};
			Object.keys((style.style as StyleSpecification).sources).forEach((key) => {
				if (sourceIds.includes(key)) {
					sources[key] = (style.style as StyleSpecification).sources[key];
				}
			});
			(style.style as StyleSpecification).sources = sources;
		}

		return style.style as StyleSpecification;
	}
);
