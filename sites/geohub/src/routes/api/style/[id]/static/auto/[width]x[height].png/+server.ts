import type { RequestHandler } from './$types';
import { getStyleById } from '$lib/server/helpers';
import type { DashboardMapStyle } from '$lib/types';
import type { RenderOptions } from '@maplibre/maplibre-gl-native';
import { renderMap } from '$lib/server/helpers/renderMap';

export const GET: RequestHandler = async ({ params, url, locals }) => {
	const session = await locals.getSession();

	const id = Number(params.id);
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

	const center: [number, number] = (style.style.center as [number, number]) ?? [0, 0];
	const zoom = style.style.zoom ?? 0;
	const bearing = style.style.bearing ?? 0;
	const pitch = style.style.pitch ?? 0;

	const mapOptions: RenderOptions = {
		zoom: zoom,
		width: width,
		height: height,
		center: center,
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
