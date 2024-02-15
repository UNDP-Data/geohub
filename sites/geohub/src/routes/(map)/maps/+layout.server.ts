import { MapStyles, TagSearchKeys } from '$lib/config/AppConfig';
import type { UserConfig } from '$lib/config/DefaultUserConfig';
import type { Tag } from '$lib/types';
import type { LayoutServerLoad } from './$types';
import type { StyleSpecification } from 'maplibre-gl';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async (event) => {
	const { url, fetch } = event;

	let config: UserConfig;
	const response = await fetch('/api/settings');
	if (response.ok) {
		config = await response.json();
	} else {
		error(500, { message: response.statusText });
	}

	const defaultStyle = await getDefaultMapStyle(fetch, config.DefaultMapStyle);

	const data: {
		config: UserConfig;
		defaultStyle: StyleSpecification;
	} = {
		config,
		defaultStyle
	};

	const tags: Tag[] = [];
	TagSearchKeys.forEach((tag) => {
		const values = url.searchParams.getAll(tag.key);
		values.forEach((v) => {
			tags.push({ key: tag.key, value: v });
		});
	});

	const values = url.searchParams.getAll('country');
	values.forEach((v) => {
		tags.push({ key: 'country', value: v });
	});

	// reset default query params if it is not in queryparams
	const params: { [key: string]: string } = {};
	const queryoperator = url.searchParams.get('queryoperator');
	if (!queryoperator) {
		params.queryoperator = config.DatasetSearchQueryOperator;
	}
	const operator = url.searchParams.get('operator');
	if (!operator) {
		params.operator = config.TagSearchOperator;
	}
	const sortby = url.searchParams.get('sortby');
	if (!sortby) {
		params.sortby = config.DatasetSortingColumn;
	}
	const limit = url.searchParams.get('limit');
	if (!limit) {
		params.limit = `${config.DatasetSearchLimit}`;
	}

	const apiUrl = new URL(url.toString());
	Object.keys(params).forEach((k) => {
		apiUrl.searchParams.set(k, params[k]);
	});

	return data;
};

const getDefaultMapStyle = async (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	defaultStyle: string
) => {
	const url = MapStyles.find((s) => s.title === defaultStyle).uri ?? MapStyles[0].uri;
	const res = await fetch(url);
	const style = await res.json();
	return style as StyleSpecification;
};
