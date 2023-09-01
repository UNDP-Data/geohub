import type { RequestHandler } from './$types';
import { getStyleById } from '$lib/server/helpers';
import type { DashboardMapStyle } from '$lib/types';
import type { RenderOptions } from '@maplibre/maplibre-gl-native';
import { renderMap } from '$lib/server/helpers';

export const GET: RequestHandler = async ({ params, url, locals }) => {
	const session = await locals.getSession();

	const id = Number(params.id);
	const lon = Number(params.lon);
	const lat = Number(params.lat);
	const zoom = Number(params.zoom);
	const bearing = Number(params.bearing);
	const pitch = Number(params.pitch);
	const width = Number(params.width);
	const height = Number(params.height);
	const ratio = 1;

	if (!id) {
		return new Response(JSON.stringify({ message: `id parameter is required.` }), {
			status: 400
		});
	}
	const style: DashboardMapStyle = (await getStyleById(
		id,
		url,
		session?.user?.email
	)) as DashboardMapStyle;

	if (!style) {
		return new Response(undefined, {
			status: 404
		});
	}

	const mapOptions: RenderOptions = {
		zoom: zoom,
		width: width,
		height: height,
		center: [lon, lat],
		bearing: bearing,
		pitch: pitch
	};

	const image = await renderMap(url, style.style, mapOptions, width, height, ratio);

	return new Response(image, {
		headers: {
			'Content-type': 'image/png'
		}
	});
};
