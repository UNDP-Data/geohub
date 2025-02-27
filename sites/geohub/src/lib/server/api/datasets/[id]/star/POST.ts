import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { db } from '$lib/server/db';
import { datasetFavouriteInGeohub } from '$lib/server/schema';
import { getDatasetStarCount } from '$lib/server/helpers/getDatasetStarCount';
import { error } from '@sveltejs/kit';

export const Output = z.object({
	dataset_id: z.string().describe('Dataset ID'),
	user_email: z.string().describe('user email address'),
	savedat: z.string().describe('saved date'),
	no_stars: z.number().describe('The number of stars')
});

export const Param = z.object({
	id: z.string().describe('Dataset ID')
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Register dataset to favourite';
	c.description = 'Register dataset to favourite This API only can be used when user sign in.';
	c.tags = ['datasets'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No dataset found.`),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Param, Output, Modifier, Error }).handle(
	async (param, { locals }) => {
		const session = await locals.auth();
		if (!session) {
			error(403, { message: 'Permission error' });
		}

		const dataset_id = param.id;
		const user_email = session.user.email;
		const now = new Date().toISOString();

		await db
			.insert(datasetFavouriteInGeohub)
			.values({ datasetId: dataset_id, userEmail: user_email, savedat: now })
			.onConflictDoUpdate({
				target: [datasetFavouriteInGeohub.datasetId, datasetFavouriteInGeohub.userEmail],
				set: {
					savedat: now
				}
			});

		const stars = await getDatasetStarCount(dataset_id);

		return {
			dataset_id,
			user_email,
			savedat: now,
			no_stars: stars
		};
	}
);
