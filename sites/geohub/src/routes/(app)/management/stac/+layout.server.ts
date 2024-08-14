import type { LayoutServerLoad } from './$types';
import { getSTACs } from '$lib/server/helpers';

export const load: LayoutServerLoad = async () => {
	const stacs = await getSTACs();
	return {
		stacs
	};
};
