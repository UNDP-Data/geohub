import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const styleUrl = url.searchParams.get('url');
	if (!styleUrl) {
		throw redirect(300, '/');
	}
};
