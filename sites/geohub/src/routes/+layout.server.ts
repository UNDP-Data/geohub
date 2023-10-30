import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { MapStyleId, SiteInfo } from '$lib/config/AppConfig';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const session = await locals.getSession();

	let geohubApi = url.origin;
	if (geohubApi.indexOf('localhost') > -1) {
		geohubApi = env.GEOHUB_API_ENDPOINT;
	}

	const title = 'GeoHub';
	const content = 'Welcome to GeoHub!';
	const site_name = SiteInfo.site_name;
	const site_description = SiteInfo.site_description;

	const ogStyle = `${geohubApi}/api/style/${MapStyleId}.json`;
	const socialImage = `${env.GEOHUB_STATIC_IMAGE_API}/og?content={content}&url=${ogStyle}`;
	const ogUrl = `${url.origin}${url.pathname}`;
	return {
		session,
		title,
		content,
		site_name,
		site_description,
		socialImage,
		ogUrl
	};
};
