import type { LayoutServerLoad } from './$types';
import { getSTACs } from '$lib/server/helpers';

export const load: LayoutServerLoad = async ({ locals }) => {
	const stacs = await getSTACs(locals.pool);
	return {
		stacs
	};
};
