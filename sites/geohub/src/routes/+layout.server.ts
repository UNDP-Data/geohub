import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { MapStyleId, SiteInfo } from '$lib/config/AppConfig';
import { upsertUser, isSuperuser } from '$lib/server/helpers';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const session = await locals.getSession();

	let geohubApi = url.origin;
	if (geohubApi.indexOf('localhost') > -1) {
		geohubApi = env.GEOHUB_API_ENDPOINT;
	}

	if (session?.user?.email && url.origin.indexOf('localhost') === -1) {
		// if not localhost, store signed up user email to database. If not first time visit, update last accessed time column
		await upsertUser(session.user.email);
	}

	if (session?.user?.email) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		session.user.is_superuser = await isSuperuser(session.user.email);
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
		ogUrl,
		staticApiUrl: env.GEOHUB_STATIC_IMAGE_API
	};
};
