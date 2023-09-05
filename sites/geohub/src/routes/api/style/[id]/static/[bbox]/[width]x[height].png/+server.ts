import type { RequestHandler } from './$types';
import { getStyleById } from '$lib/server/helpers';
import type { DashboardMapStyle } from '$lib/types';
import type { RenderOptions } from '@maplibre/maplibre-gl-native';
import { renderMap } from '$lib/server/helpers/renderMap';
import geoViewport from '@mapbox/geo-viewport';

export const GET: RequestHandler = async ({ params, url, locals }) => {
	const session = await locals.getSession();

	const id = Number(params.id);
	const bbox = params.bbox;
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

	if (!(style && style.style)) {
		return new Response(undefined, {
			status: 404
		});
	}

	const bounds: geoViewport.BoundingBox = bbox
		.split(',')
		.map((c) => Number(c)) as geoViewport.BoundingBox;
	const viewport = geoViewport.viewport(
		bounds,
		[width, height],
		undefined,
		undefined,
		undefined,
		true
	);
	const zoom = Math.max(viewport.zoom - 1, 0);
	const center = viewport.center;

	const mapOptions: RenderOptions = {
		zoom: zoom,
		width: width,
		height: height,
		center: center
	};

	const image = await renderMap(url, style.style, mapOptions, width, height, ratio);

	return new Response(image, {
		headers: {
			'Content-type': 'image/png'
		}
	});
};
