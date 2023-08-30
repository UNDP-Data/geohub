import { DataCategories, MapStyles, TagSearchKeys } from '$lib/config/AppConfig';
import type { UserConfig } from '$lib/config/DefaultUserConfig';
import type { Continent, Country, DatasetFeatureCollection, Tag } from '$lib/types';
import type { Breadcrumb } from '@undp-data/svelte-undp-design';
import type { LayoutServerLoad } from './$types';
import type { StyleSpecification } from 'maplibre-gl';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = async (event) => {
	const { locals, url, fetch } = event;
	const session = await locals.getSession();

	let config: UserConfig;
	const response = await fetch('/api/settings');
	if (response.ok) {
		config = await response.json();
	}

	const defaultStyle = await getDefaultMapStyle(fetch);

	const data: {
		session: App.Session;
		config: UserConfig;
		azureUrl: string;
		defaultStyle: StyleSpecification;
		menu?: Breadcrumb[];
		breadcrumbs?: Breadcrumb[];
		promises: {
			features?: Promise<DatasetFeatureCollection>;
			tags?: Promise<{ [key: string]: Tag[] }>;
		};
	} = {
		session,
		config,
		azureUrl: `https://${env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
		defaultStyle,
		promises: {}
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

	const breadcrumbs = url.searchParams.get('breadcrumbs') ?? 'Home';

	const apiUrl = new URL(url.toString());
	Object.keys(params).forEach((k) => {
		apiUrl.searchParams.set(k, params[k]);
	});

	const selectedMenus = breadcrumbs.split(',');
	if (selectedMenus.length === 1) {
		DataCategories.forEach((c) => {
			const search = c.url.split('?')[1];
			if (url.search.indexOf(search) > -1) {
				selectedMenus.push(c.name);
			}
		});
	}
	if (selectedMenus.length < 2) {
		const menu: Breadcrumb[] = session
			? DataCategories
			: DataCategories.filter((category) => !['Favourite', 'My data'].includes(category.name));

		data.menu = menu;
	} else if (selectedMenus[selectedMenus.length - 1] === 'SDG') {
		data.menu = await createSDGMenu(fetch, url);
	} else if (selectedMenus[selectedMenus.length - 1] === 'Continent') {
		data.menu = await createRegionMenu(fetch, url);
	} else {
		const regions = await createRegionMenu(fetch, url);
		const name = selectedMenus[selectedMenus.length - 1];
		const region = regions.find((r) => r.name.toLowerCase() === name.toLowerCase());
		const country = url.searchParams.get('country');
		if (!country && region) {
			data.menu = await createCountryMenu(fetch, url, region);
		}
	}

	const query = apiUrl.searchParams.get('query');

	if (selectedMenus.length === 1 && (query?.length > 0 || tags?.length > 0)) {
		if (!selectedMenus.includes('Search result')) {
			selectedMenus.push('Search result');
		}
	}

	data.breadcrumbs = await getBreadcrumbs(fetch, apiUrl, selectedMenus);
	data.promises.tags = getTags(fetch, new URL(`${url.origin}/api/datasets${apiUrl.search}`));

	if (
		query ||
		DataCategories.find(
			(c: Breadcrumb) => apiUrl.search.indexOf(c.url.replace('/api/datasets?', '')) !== -1
		) ||
		apiUrl.searchParams.get('sdg_goal') ||
		tags.length > 0 ||
		data.breadcrumbs[data.breadcrumbs.length - 1].url.indexOf('/api/datasets') > -1
	) {
		apiUrl.searchParams.delete('style');
		const fc = getDatasets(fetch, apiUrl);
		data.promises.features = fc;
	}
	return data;
};

const getDefaultMapStyle = async (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
) => {
	const url = MapStyles[0].uri;
	const res = await fetch(url);
	const style = await res.json();
	return style as StyleSpecification;
};

const getBreadcrumbs = async (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	url: URL,
	menus: string[]
) => {
	const sdg_goal = url.searchParams.get('sdg_goal');
	const regions = await createRegionMenu(fetch, url);
	let region: Breadcrumb;
	let countries: Breadcrumb[];
	if (menus.length > 2) {
		region = regions.find((r) => r.name.toLowerCase() === menus[2].toLowerCase());
		if (region) {
			countries = await createCountryMenu(fetch, url, region);
		}
	}

	const breadcrumbs = menus.map((m) => {
		let bc: Breadcrumb;
		if (m === 'Home') {
			bc = {
				name: 'Home',
				icon: 'fas fa-house',
				url: ''
			};
		} else if (['SDG', 'Continent'].includes(m)) {
			bc = DataCategories.find((c) => c.name.toLowerCase() === m.toLowerCase());
		} else if (m === 'Search result') {
			bc = {
				name: 'Search result',
				icon: 'fas fa-magnifying-glass',
				url: `/api/datasets${url.search}`
			};
		} else {
			if (sdg_goal) {
				bc = {
					name: `SDG${sdg_goal}`,
					icon: `/assets/sdgs/${sdg_goal}.png`,
					url: `/api/datasets?sdg_goal=${sdg_goal}`
				};
			} else {
				const country = countries?.find((r) => r.name.toLowerCase() === m.toLowerCase());
				if (regions.find((r) => r.name.toLowerCase() === m.toLowerCase())) {
					bc = region;
				} else if (country) {
					bc = country;
				} else {
					bc = DataCategories.find((c) => c.name.toLowerCase() === m.toLowerCase());
				}
			}
		}
		return bc;
	});
	return breadcrumbs;
};

const createSDGMenu = async (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	url: URL
) => {
	const sdgBreadcrumb = DataCategories.find((b) => b.name === 'SDG');

	const apiUrl = new URL(`${url.origin}${sdgBreadcrumb.url}`);

	const res = await fetch(apiUrl.toString());
	const json = await res.json();
	const values: [{ value: string; count: number }] = json[Object.keys(json)[0]];

	let num_values = values.map((v) => Number(v.value));
	num_values = num_values.sort((a, b) => a - b);
	const sdgs = num_values.map((num) => {
		return {
			name: `SDG${num}`,
			icon: `/assets/sdgs/${num}.png`,
			url: `/api/datasets?sdg_goal=${num}`
		} as Breadcrumb;
	});
	return sdgs;
};

const createRegionMenu = async (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	url: URL
) => {
	const continentBreadcrumb = DataCategories.find((b) => b.name === 'Continent');
	const apiUrl = new URL(`${url.origin}${continentBreadcrumb.url}`);

	const res = await fetch(apiUrl.toString());
	const continents: Continent[] = await res.json();

	const all = {
		name: `Global`,
		icon: 'fa-solid fa-globe',
		url: `/api/datasets?extent=global`
	};

	return [
		all,
		...continents.map((c) => {
			if (c.continent_name.toLowerCase() === 'antarctica') {
				return {
					name: `${c.continent_name}`,
					icon: 'fa-solid fa-globe',
					url: `/api/datasets?continent=${c.continent_name}`
				};
			} else {
				return {
					name: `${c.continent_name}`,
					icon: `fa-solid fa-earth-${c.continent_name.toLowerCase()}`,
					url: `/api/countries?continent=${c.continent_code}&filterbytag=true`
				};
			}
		})
	];
};

const createCountryMenu = async (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	url: URL,
	region: Breadcrumb
) => {
	if (region?.url.indexOf('/api/datasets') > -1) {
		return;
	}
	const apiUrl = new URL(`${url.origin}${region.url}`);
	const res = await fetch(apiUrl.toString());
	const countries: Country[] = await res.json();
	const all = {
		name: `All`,
		icon: region.icon,
		url: `/api/datasets?continent=${region.name}`
	};
	const countriesData = countries.map((c) => {
		const icon = c.iso_2 ? `fi fi-${c.iso_2.toLowerCase()}` : 'no-flag fa-solid fa-flag fa-2xl';
		return {
			name: `${c.country_name}`,
			icon: icon,
			url: `/api/datasets?country=${c.iso_3}`
		};
	});
	return [all, ...countriesData];
};

const getDatasets = async (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	url: URL
) => {
	const res = await fetch(`/api/datasets${url.search}`);
	const fc: DatasetFeatureCollection = await res.json();
	return fc;
};

const getTags = async (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	url: URL
) => {
	url.searchParams.delete('style');
	const apiUrl = `${url.origin}/api/tags?url=${encodeURIComponent(url.toString())}`;
	const res = await fetch(apiUrl);
	const json: { [key: string]: Tag[] } = await res.json();

	const tags: { [key: string]: Tag[] } = {};
	TagSearchKeys.forEach((t) => {
		if (!json[t.key]) return;
		tags[t.key] = json[t.key];
	});
	return tags;
};
