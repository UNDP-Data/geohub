import type { PageServerLoad } from './$types';
import type { DatasetFeature } from '$lib/types';
import { error } from '@sveltejs/kit';
import { Permission } from '$lib/config/AppConfig';

export const load: PageServerLoad = async ({ fetch, params, parent }) => {
	const { session } = await parent();
	if (!session) {
		error(403, { message: 'No permission to access' });
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

	if (!(feature.properties.permission >= Permission.READ)) {
		error(403, { message: 'No permission to access' });
	}

	return {
		feature
	};
};
