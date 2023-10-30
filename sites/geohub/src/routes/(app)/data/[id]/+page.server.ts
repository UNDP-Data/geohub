import type { PageServerLoad } from './$types';
import type { DatasetFeature } from '$lib/types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, params }) => {
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

	return {
		feature
	};
};
