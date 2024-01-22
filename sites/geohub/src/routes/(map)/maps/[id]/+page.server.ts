import type { PageServerLoad } from './$types';
import { getStyleById } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import type { DashboardMapStyle } from '$lib/types';
import { getDomainFromEmail } from '$lib/helper';
import { AccessLevel, Permission } from '$lib/config/AppConfig';

export const load: PageServerLoad = async (event) => {
	const { locals, url, params } = event;
	const session = await locals.getSession();
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

	let domain: string;
	if (user?.email) {
		domain = getDomainFromEmail(user?.email);
	}

	const accessLevel: AccessLevel = style.access_level;
	if (accessLevel === AccessLevel.PRIVATE) {
		if (!(user?.email && user?.email === style.created_user)) {
			if (!(style.permission && style.permission >= Permission.READ)) {
				error(403, { message: 'Permission error' });
			}
		}
	} else if (accessLevel === AccessLevel.ORGANIZATION) {
		if (!(domain && style.created_user?.indexOf(domain) > -1)) {
			if (!(style.permission && style.permission >= Permission.READ)) {
				error(403, { message: 'Permission error' });
			}
		}
	}

	return {
		style
	};
};
