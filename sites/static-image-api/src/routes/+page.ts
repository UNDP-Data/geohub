import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	const title = ' GeoHub Static API';

	const examples = [
		'https://dev.undpgeohub.org/api/mapstyle/style.json',
		'https://dev.undpgeohub.org/api/mapstyle/aerialstyle.json',
		'https://dev.undpgeohub.org/api/mapstyle/positron.json',
		'https://dev.undpgeohub.org/api/mapstyle/dark.json',
		'https://narwassco.github.io/mapbox-stylefiles/unvt/style.json',
		'https://narwassco.github.io/mapbox-stylefiles/unvt/style-aerial.json'
	];

	let styleUrl = url.searchParams.get('url');
	if (!styleUrl) {
		styleUrl = examples[0];
	}

	return {
		title,
		examples,
		styleUrl
	};
};
