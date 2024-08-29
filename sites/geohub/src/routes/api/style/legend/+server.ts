import type { RequestHandler } from './$types';
import type { DashboardMapStyle } from '$lib/types';
import { error } from '@sveltejs/kit';
import { generateLegendFromStyle } from '$lib/server/helpers';

export const POST: RequestHandler = async ({ request, url }) => {
	const debug = url.searchParams.get('debug')
		? url.searchParams.get('debug')?.toLowerCase() === 'true'
		: false;

	const visibleOnly = url.searchParams.get('visible_only')
		? url.searchParams.get('visible_only')?.toLowerCase() === 'true'
		: false;

	const width = url.searchParams.get('width') ?? '100%';

	const style: DashboardMapStyle = await request.json();

	if (!style.layers) {
		error(400, { message: 'No layer in this style' });
	}
	const data = await generateLegendFromStyle(style, debug, visibleOnly, width);

	return new Response(JSON.stringify(data));
};
