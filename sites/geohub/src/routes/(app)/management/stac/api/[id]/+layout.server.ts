import type { LayoutServerLoad } from './$types';
import { getSTAC } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = async ({ params }) => {
	const id = params.id;
	const titilerUrl = env.TITILER_ENDPOINT?.replace('/cog', '') ?? '';

	const stac = await getSTAC(id);

	if (!stac) {
		error(404, `This stac ID (${id}) is not found.`);
	}
	return {
		stac,
		titilerUrl
	};
};
