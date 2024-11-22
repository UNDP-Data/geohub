import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const title = 'Sign Out | GeoHub';
	const content = 'Sign Out';

	const session = await locals.auth();
	if (!session) {
		redirect(307, '/auth/signIn');
	}

	return {
		title,
		content
	};
};
