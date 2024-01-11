import type { LayoutServerLoad } from './$types';
import { getSTAC } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ params }) => {
	const id = params.id;
	const stac = await getSTAC(id);
	if (!stac) {
		error(404, `This stac ID (${id}) is not found.`);
	}
	return {
		stac
	};
};
