import type { PageServerLoad } from './$types';
import type { DatasetFeature } from '$lib/types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const id = params.id;

	const res = await fetch(`/api/datasets/${id}`);
	if (!res.ok) {
		throw error(res.status, { message: res.statusText });
	}
	const feature: DatasetFeature = await res.json();

	return {
		feature
	};
};
