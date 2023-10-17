import type { RequestHandler } from './$types';
import geoViewport from '@mapbox/geo-viewport';

export const GET: RequestHandler = async ({ params }) => {
	const lon = Number(params.lon);
	const lat = Number(params.lat);
	const zoom = Number(params.zoom);
	const width = Number(params.width);
	const height = Number(params.height);

	const bounds = geoViewport.bounds([lon, lat], zoom, [width, height]);

	return new Response(JSON.stringify({ bounds }));
};
