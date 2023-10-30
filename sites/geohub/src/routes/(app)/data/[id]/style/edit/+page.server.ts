import type { PageServerLoad } from './$types';
import type { DatasetFeature } from '$lib/types';
import { error } from '@sveltejs/kit';
import { getDomainFromEmail } from '$lib/helper';
import { AccessLevel } from '$lib/config/AppConfig';

export const load: PageServerLoad = async ({ fetch, params, locals }) => {
	const session = await locals.getSession();
	if (!session) {
		throw error(403, { message: 'Permission error' });
	}

	const id = params.id;

	const res = await fetch(`/api/datasets/${id}`);
	if (!res.ok) {
		if (res.status === 403) {
			throw error(res.status, { message: 'No permission to access' });
		} else if (res.status === 404) {
			throw error(res.status, { message: 'No dataset found' });
		} else {
			throw error(res.status, { message: res.statusText });
		}
	}
	const feature: DatasetFeature = await res.json();

	const is_stac = feature.properties.tags?.find((t) => t.key === 'type')?.value === 'stac';
	if (is_stac) {
		throw error(400, { message: 'STAC layer is not supported.' });
	}

	const is_superuser = session?.user?.is_superuser ?? false;
	if (!is_superuser) {
		const user_email = session?.user.email;
		const domain = user_email ? getDomainFromEmail(user_email) : undefined;
		const access_level: AccessLevel = feature.properties.access_level;
		if (access_level === AccessLevel.PRIVATE) {
			if (feature.properties.created_user !== user_email) {
				throw error(403, { message: `No permission to access to this dataset.` });
			}
		} else if (access_level === AccessLevel.ORGANIZATION) {
			if (!feature.properties.created_user.endsWith(domain)) {
				throw error(403, { message: `No permission to access to this dataset.` });
			}
		}
	}

	return {
		feature
	};
};
