import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { MapStyleId, SiteInfo } from '$lib/config/AppConfig';
import { upsertUser, isSuperuser } from '$lib/server/helpers';
import type { HeaderLink } from '@undp-data/svelte-undp-design';
import { HeaderItems, type LineName } from '$lib/server/config/HeaderItems';
import { FooterItems } from '$lib/server/config/FooterItems';

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
	const socialImage = `${env.GEOHUB_STATIC_IMAGE_API}/og?url=${ogStyle}`;
	const ogUrl = `${url.origin}${url.pathname}`;

	const footerLinks = FooterItems;

	const items: LineName[] = ['home', 'data', 'map', 'tools'];
	if (env.GEOHUB_DOCS_ENDPOINT) {
		items.push('support');

		// update support link
		const link = footerLinks['GeoHub'].find((l) => l.title.toLocaleLowerCase() === 'support');
		link.url = env.GEOHUB_DOCS_ENDPOINT;
	} else {
		footerLinks['GeoHub'] = [
			...footerLinks['GeoHub'].filter((l) => l.title.toLocaleLowerCase() !== 'support')
		];
	}
	const headerLinks: HeaderLink[] = HeaderItems(items, env.GEOHUB_DOCS_ENDPOINT);

	if (!(session?.user?.is_superuser === true)) {
		if (footerLinks['Management']) {
			delete footerLinks['Management'];
		}
	}

	const staticApiUrl = env.GEOHUB_STATIC_IMAGE_API;
	const devLinks = footerLinks['For Developers'];
	if (staticApiUrl) {
		const link = devLinks.find((l) => l.title === 'Static Image API');
		link.url = staticApiUrl.replace('/api', '');
	}

	if (env.SVELTE_UNDP_DESIGN_ENDPOINT) {
		const link = devLinks.find((l) => l.title === 'Svelte UNDP design sytem');
		link.url = env.SVELTE_UNDP_DESIGN_ENDPOINT;
	}

	if (env.SVELTE_UNDP_COMPONENTS_ENDPOINT) {
		const link = devLinks.find((l) => l.title === 'Svelte UNDP Components');
		link.url = env.SVELTE_UNDP_COMPONENTS_ENDPOINT;
	}
	footerLinks['For Developers'] = [...devLinks.filter((l) => l.url !== '')];

	return {
		session,
		title,
		content,
		site_name,
		site_description,
		socialImage,
		ogUrl,
		staticApiUrl: staticApiUrl,
		headerLinks,
		footerLinks
	};
};
