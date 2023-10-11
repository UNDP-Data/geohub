import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const session = await locals.getSession();

	let geohubApi = url.origin;
	if (geohubApi.indexOf('localhost') > -1) {
		geohubApi = env.GEOHUB_API_ENDPOINT;
	}

	const styleId = 209;
	const ogStyle = `${geohubApi}/api/style/${styleId}.json`;

	return {
		session,
		ogStyle,
		staticImageApi: env.GEOHUB_STATIC_IMAGE_API
	};
};
