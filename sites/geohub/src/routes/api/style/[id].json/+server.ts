import type { RequestHandler } from './$types';
import { getStyleById, isSuperuser } from '$lib/server/helpers';
import type { DashboardMapStyle } from '$lib/types';
import type { LayerSpecification, SourceSpecification } from 'maplibre-gl';

/**
 * Get style.json which is stored in PostgreSQL database
 * GET: ./api/style/{id}.json
 */
export const GET: RequestHandler = async ({ params, url, locals }) => {
	const session = await locals.getSession();

	try {
		const styleId = Number(params.id);
		if (!styleId) {
			return new Response(JSON.stringify({ message: `id parameter is required.` }), {
				status: 400
			});
		}
		const user_email = session?.user.email;

		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}

		const style = (await getStyleById(styleId, url, user_email, is_superuser)) as DashboardMapStyle;

		if (!style) {
			return new Response(undefined, {
				status: 404
			});
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
	} catch (err) {
		return new Response(JSON.stringify({ message: err.message }), {
			status: 400
		});
	}
};
