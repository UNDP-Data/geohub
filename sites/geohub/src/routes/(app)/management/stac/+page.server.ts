import { upsertSTAC } from '$lib/server/helpers';
import type { Stac } from '$lib/types';
import { fail, type Actions } from '@sveltejs/kit';

export const actions = {
	register: async (event) => {
		const { request, locals } = event;
		try {
			const session = await locals.auth();
			if (!session) {
				return fail(403, { message: 'No permission' });
			}
			const data = await request.formData();

			const providers = data.get('providers') as unknown as string;
			const stac: Stac = {
				id: data.get('id') as string,
				name: data.get('name') as string,
				url: data.get('url') as string,
				type: data.get('type') as string,
				providers: providers ? JSON.parse(providers) : undefined
			};
			const user_email = session.user.email;
			await upsertSTAC(stac, user_email);
		} catch (error) {
			return fail(500, { status: error.status, message: 'error:' + error.message });
		}
	}
} satisfies Actions;
