import type { PageServerLoad } from '../../../(map)/maps/[id]/$types';
import { getStyleById } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import type { DashboardMapStyle } from '$lib/types';
import { getDomainFromEmail } from '$lib/helper';
import { AccessLevel, Permission } from '$lib/config/AppConfig';

export const load: PageServerLoad = async (event) => {
	const { url, params, parent } = event;
	const { session, socialImage } = await parent();
	const user = session?.user;
	const is_superuser = user?.is_superuser ?? false;
	const styleId = params.id;
	const style = (await getStyleById(
		Number(styleId),
		url,
		user?.email,
		is_superuser
	)) as DashboardMapStyle;
	if (!style) {
		error(404, `Not found`);
	}

	const accessLevel: AccessLevel = style.access_level;
	if (accessLevel === AccessLevel.PRIVATE) {
		if (!(style.permission && style.permission >= Permission.READ)) {
			error(403, { message: 'Permission error' });
		}
	} else if (accessLevel === AccessLevel.ORGANIZATION) {
		let domain: string;
		if (user?.email) {
			domain = getDomainFromEmail(user?.email);
		}
		if (!(domain && style.created_user?.indexOf(domain) > -1)) {
			if (!(style.permission && style.permission >= Permission.READ)) {
				error(403, { message: 'Permission error' });
			}
		}
	}

	const styleUrl = style.links?.find((l) => l.rel === 'stylejson')?.href;
	const staticUrl = new URL(socialImage);
	if (styleUrl) {
		staticUrl.searchParams.set('url', styleUrl);
	}

	return {
		style,
		socialImage: staticUrl.href
	};
};
