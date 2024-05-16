import type { PageServerLoad } from './$types';
import { DefaultUserConfig } from '$lib/config/DefaultUserConfig';
import { error, fail } from '@sveltejs/kit';
import { FontJsonUrl } from '$lib/config/AppConfig';

export const load: PageServerLoad = async ({ parent }) => {
	const { session } = await parent();
	if (!session) {
		error(403, {
			message: `No permission to access.`
		});
	}
	const fonts = await getFonts();
	return {
		fonts
	};
};

const getFonts = async () => {
	const res = await fetch(FontJsonUrl);
	const json: string[] = await res.json();
	return json;
};

export const actions = {
	save: async (event) => {
		const { request, locals } = event;
		const session = await locals.auth();
		if (!session) {
			return fail(403, { message: 'No permission' });
		}
		const data = await request.formData();

		const settings: { [key: string]: number | string | boolean } = {};
		Object.keys(DefaultUserConfig).forEach((key) => {
			const defaultValue = DefaultUserConfig[key];
			const value = data.get(key)?.toString();
			if (!value) return;
			if (key === 'MaplibreDevMode') {
				settings[key] = value.toLowerCase() === 'true' ? true : false;
			} else if (parseFloat(defaultValue)) {
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
