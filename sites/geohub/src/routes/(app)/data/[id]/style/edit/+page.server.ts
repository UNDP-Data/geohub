import type { PageServerLoad } from './$types';
import type { DatasetFeature } from '$lib/types';
import { error } from '@sveltejs/kit';
import { getDomainFromEmail } from '$lib/helper';
import { AccessLevel, Permission } from '$lib/config/AppConfig';

export const load: PageServerLoad = async ({ fetch, params, parent }) => {
	const { session } = await parent();
	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const id = params.id;

	const res = await fetch(`/api/datasets/${id}`);
	if (!res.ok) {
		if (res.status === 403) {
			error(res.status, { message: 'No permission to access' });
		} else if (res.status === 404) {
			error(res.status, { message: 'No dataset found' });
		} else {
			error(res.status, { message: res.statusText });
		}
	}
	const feature: DatasetFeature = await res.json();

	const is_stac = feature.properties.tags?.find((t) => t.key === 'type')?.value === 'stac';
	if (is_stac) {
		error(400, { message: 'STAC layer is not supported.' });
	}

	const is_superuser = session?.user?.is_superuser ?? false;
	if (!is_superuser) {
		const user_email = session?.user.email;

		if (!(feature.properties.permission && feature.properties.permission >= Permission.READ)) {
			const domain = user_email ? getDomainFromEmail(user_email) : undefined;
			const access_level: AccessLevel = feature.properties.access_level;
			if (access_level === AccessLevel.PRIVATE) {
				if (feature.properties.created_user !== user_email) {
					error(403, { message: `No permission to access to this dataset.` });
				}
			} else if (access_level === AccessLevel.ORGANIZATION) {
				if (!feature.properties.created_user.endsWith(domain)) {
					error(403, { message: `No permission to access to this dataset.` });
				}
			}
		}
	}

	const title = `Style edit | ${feature.properties.name} | Data | GeoHub`;
	const content = feature.properties.name;
	const site_description = feature.properties.description;

	return {
		title,
		content,
		site_description,
		feature
	};
};
