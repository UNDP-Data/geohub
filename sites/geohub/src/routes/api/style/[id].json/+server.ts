import type { RequestHandler } from './$types';
import { getStyleById, isSuperuser } from '$lib/server/helpers';
import type { DashboardMapStyle } from '$lib/types';
import type { LayerSpecification, SourceSpecification } from 'maplibre-gl';
import { error } from '@sveltejs/kit';
import { MapStyleIds, type MapStyleType } from '$lib/config/AppConfig';

/**
 * Get style.json which is stored in PostgreSQL database
 * GET: ./api/style/{id}.json
 */
export const GET: RequestHandler = async ({ params, url, locals }) => {
	const session = await locals.auth();

	const styleId = Number(params.id);
	if (!styleId) {
		error(400, { message: `id parameter is required.` });
	}
	const user_email = session?.user.email;

	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const basemap = (url.searchParams.get('basemap') as MapStyleType) ?? '';
	if (basemap.length > 0 && !MapStyleIds.includes(basemap)) {
		error(400, {
			message: `Invalid basemap parameter. It must be one of ${MapStyleIds.join(', ')}.`
		});
	}

	const hillshade = url.searchParams.get('hillshade') ?? 'false';
	const isHillshade = hillshade.toLowerCase() === 'true';

	const terrain = url.searchParams.get('terrain') ?? 'false';
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
	const excludeString = url.searchParams.get('exclude');
	const exclude = excludeString === 'true' ? true : false;
	if (exclude) {
		const layerIds = style.layers.map((l) => l.id);

		const layers: LayerSpecification[] = [];
		for (const layer of style.style.layers) {
			if (layerIds.includes(layer.id)) {
				layers.push(layer);
			}
		}
		style.style.layers = layers;
		const sourceIds = layers.map((l) => l['source']);
		const sources: { [key: string]: SourceSpecification } = {};
		Object.keys(style.style.sources).forEach((key) => {
			if (sourceIds.includes(key)) {
				sources[key] = style.style.sources[key];
			}
		});
		style.style.sources = sources;
	}

	return new Response(JSON.stringify(style.style));
};
