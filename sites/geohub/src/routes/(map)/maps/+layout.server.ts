import { MapStyles } from '$lib/config/AppConfig';
import type { UserConfig } from '$lib/config/DefaultUserConfig';
import type { LayoutServerLoad } from './$types';
import type { StyleSpecification } from 'maplibre-gl';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = async (event) => {
	const { fetch } = event;

	const response = await fetch('/api/settings');
	if (!response.ok) {
		error(response.status, { message: response.statusText });
	}
	const config: UserConfig = await response.json();

	const url = MapStyles.find((s) => s.title === config.DefaultMapStyle).uri ?? MapStyles[0].uri;
	const res = await fetch(url);
	if (!res.ok) {
		error(res.status, { message: res.statusText });
	}
	const defaultStyle: StyleSpecification = await res.json();

	return {
		config,
		defaultStyle,
		maptilerKey: env.MAPTILER_API_KEY
	};
};
