import type { RequestHandler } from './$types';
import type { DashboardMapStyle } from '$lib/types';
import { error } from '@sveltejs/kit';
import { generateLegendFromStyle } from '$lib/server/helpers';

export const GET: RequestHandler = async ({ params, fetch, url }) => {
	const styleId = Number(params.id);
	if (!styleId) {
		return new Response(JSON.stringify({ message: `id parameter is required.` }), {
			status: 400
		});
	}
	const debug = url.searchParams.get('debug')
		? url.searchParams.get('debug')?.toLowerCase() === 'true'
		: false;

	const visibleOnly = url.searchParams.get('visible_only')
		? url.searchParams.get('visible_only')?.toLowerCase() === 'true'
		: false;

	const width = url.searchParams.get('width') ?? '100%';

	const res = await fetch(`/api/style/${styleId}`);
	if (!res.ok) {
		const body = await res.json();
		error(res.status, body);
	}
	const style: DashboardMapStyle = await res.json();

	if (!style.layers) {
		error(400, { message: 'No layer in this style' });
	}
	const layers = await generateLegendFromStyle(style, debug, visibleOnly, width);

	return new Response(JSON.stringify(layers));
};
