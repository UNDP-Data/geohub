import type { Breadcrumb } from '@undp-data/svelte-undp-design';
import type { RequestHandler } from './$types';
import { DataCategories } from '$lib/config/AppConfig';
import type { Continent, Country } from '$lib/types';

export const GET: RequestHandler = async ({ locals, url }) => {
	const session = await locals.auth();
	const breadcrumbs = url.searchParams.get('breadcrumbs') ?? 'Home';

	const selectedMenus = breadcrumbs.split(',');

	let items: Breadcrumb[] = [];
	if (selectedMenus.length === 1) {
		items = session
			? DataCategories
			: DataCategories.filter((category) => !['Favourite', 'My data'].includes(category.name));
	} else if (selectedMenus.length > 1) {
		const lastMenu = selectedMenus[selectedMenus.length - 1];

		if (lastMenu === 'SDG') {
			items = await createSDGMenu(fetch, url);
		} else if (lastMenu === 'Continent') {
			items = await createRegionMenu(fetch, url);
		} else {
			const regions = await createRegionMenu(fetch, url);
			const name = selectedMenus[selectedMenus.length - 1];
			const region = regions.find((r) => r.name.toLowerCase() === name.toLowerCase());
			const country = url.searchParams.get('country');
			if (!country && region) {
				items = await createCountryMenu(fetch, url, region);
			}
		}
	}

	return new Response(
		JSON.stringify({
			items
		})
	);
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
