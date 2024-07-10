import type { PageServerLoad } from './$types';
import type { StoryMapConfig } from '$lib/types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const id = params.id;

	const res = await fetch(`/api/storymaps/${id}`);
	if (!res.ok) {
		if (res.status === 403) {
			error(res.status, { message: 'No permission to access' });
		} else if (res.status === 404) {
			error(res.status, { message: 'No storymap found' });
		} else {
			error(res.status, { message: res.statusText });
		}
	}
	const storymap: StoryMapConfig = await res.json();

	return {
		storymap
	};
};
