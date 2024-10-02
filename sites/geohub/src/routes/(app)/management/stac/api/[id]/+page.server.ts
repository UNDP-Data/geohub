import { upsertDataset } from '$lib/server/helpers';
import type { DatasetFeature } from '$lib/types';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { stac } = await parent();
	const title = `${stac.name} | STAC API management | GeoHub`;
	const content = stac.name;

	return {
		title,
		content,
		stac
	};
};

export const actions = {
	register: async (event) => {
		const { request, locals } = event;
		try {
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

			await upsertDataset(dataset);

			return dataset;
		} catch (error) {
			return fail(500, { status: error.status, message: 'error:' + error.message });
		}
	}
} satisfies Actions;
