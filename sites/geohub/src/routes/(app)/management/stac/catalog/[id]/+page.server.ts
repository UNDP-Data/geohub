import type { PageServerLoad } from './$types';
import { getSTAC } from '$lib/server/helpers';
import type { DatasetFeature } from '$lib/types';
import { fail, type Actions, error } from '@sveltejs/kit';
import { generateHashKey } from '$lib/helper';
import { env } from '$env/dynamic/private';
import DatasetManager from '$lib/server/DatasetManager';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const id = params.id;
	const stac = await getSTAC(id);
	if (!stac) {
		error(404, `This stac ID (${id}) is not found.`);
	}
	const datasetId = generateHashKey(stac.url);
	const res = await fetch(`/api/datasets/${datasetId}`);
	const isRegistered = res.status !== 404;
	let dataset: DatasetFeature = undefined;
	if (res.ok) {
		dataset = await res.json();
	}

	const title = `${stac.name} | STAC Catalog management | GeoHub`;
	const content = stac.name;

	return {
		title,
		content,
		stac,
		datasetId,
		isRegistered,
		dataset,
		titilerUrl: env.TITILER_ENDPOINT?.replace('/cog', '') ?? ''
	};
};

export const actions = {
	register: async (event) => {
		const { request, locals } = event;

		const session = await locals.auth();
		if (!session) {
			return fail(403, { message: 'No permission' });
		}
		const data = await request.formData();

		const featureString = data.get('feature') as string;
		const dataset: DatasetFeature = JSON.parse(featureString);

		const user_email = session?.user.email;
		const now = new Date().toISOString();
		if (!dataset.properties.created_user) {
			dataset.properties.created_user = user_email;
			dataset.properties.createdat = now;
		}
		dataset.properties.updated_user = user_email;
		dataset.properties.updatedat = now;

		const dsManager = new DatasetManager(dataset);
		await dsManager.upsert();

		return dataset;
	}
} satisfies Actions;
