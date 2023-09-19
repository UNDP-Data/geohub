import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	return {
		session,
		providers: [{ id: 'azure-ad', label: 'UNDP account' }]
	};
};
