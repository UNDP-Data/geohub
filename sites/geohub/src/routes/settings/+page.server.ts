import type { PageServerLoad } from './$types';
import { DefaultUserConfig } from '$lib/config/DefaultUserConfig';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.getSession();
	if (!session) throw redirect(300, url.origin);
};

export const actions = {
	save: async (event) => {
		const { request, locals } = event;
		const session = await locals.getSession();
		if (!session) {
			return fail(403, { message: 'No permission' });
		}
		const data = await request.formData();

		const settings: { [key: string]: number | string } = {};
		Object.keys(DefaultUserConfig).forEach((key) => {
			const defaultValue = DefaultUserConfig[key];
			const value = data.get(key)?.toString();
			if (!value) return;
			if (parseFloat(defaultValue)) {
				settings[key] = parseFloat(value);
			} else if (parseInt(defaultValue)) {
				settings[key] = parseInt(value);
			} else {
				settings[key] = value;
			}
		});

		const response = await event.fetch('/api/settings', {
			method: 'POST',
			body: JSON.stringify(settings)
		});
		if (response.ok) {
			return {
				status: 200,
				body: { message: 'Settings saved' }
			};
		}
		return fail(500, { message: 'Failed to save settings' });
	}
};
