import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { MapStyleId } from '$lib/config/AppConfig';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const session = await locals.getSession();

	let geohubApi = url.origin;
	if (geohubApi.indexOf('localhost') > -1) {
		geohubApi = env.GEOHUB_API_ENDPOINT;
	}

	const ogStyle = `${geohubApi}/api/style/${MapStyleId}.json`;

	return {
		session,
		ogStyle,
		staticImageApi: env.GEOHUB_STATIC_IMAGE_API
	};
};
