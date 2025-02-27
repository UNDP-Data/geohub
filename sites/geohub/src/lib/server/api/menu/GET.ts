import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import type { Continent, Country } from '$lib/types';
import type { Breadcrumb } from '@undp-data/svelte-undp-design';
import { DataCategories } from '$lib/config/AppConfig';
import { AddSecurictyModifier } from '$api/securityModifier';

export const Query = z.object({
	breadcrumbs: z
		.string()
		.default('Home')
		.describe(
			`current breadcrumbs setting. It should be specified by using comma for multiple breadcrumbs name. For example, 'Home', 'Home,SDG' etc.`
		)
});

export const Output = z
	.object({
		items: z
			.custom<Breadcrumb[]>()
			.describe('The list of continents including continent code and name.')
	})
	.openapi({
		example: {
			items: [
				{
					name: 'SDG',
					icon: '/assets/sdgs/SDG Wheel_WEB.png',
					url: '/api/tags?key=sdg_goal'
				},
				{
					name: 'Continent',
					icon: 'fa-solid fa-globe',
					url: '/api/continents?filterbytag=true'
				},
				{
					name: 'UNDP',
					icon: '/assets/undp-images/undp-logo-blue.svg',
					url: '/api/datasets?provider=undp'
				},
				{
					name: 'UNICEF',
					icon: '/assets/unicef.png',
					url: '/api/datasets?provider=unicef'
				},
				{
					name: 'UNEP',
					icon: '/assets/unep.png',
					url: '/api/datasets?provider=unep'
				},
				{
					name: 'FAO',
					icon: '/assets/fao.svg',
					url: '/api/datasets?provider=fao'
				},
				{
					name: 'Satellite imagery',
					icon: 'fa-solid fa-satellite',
					url: '/api/datasets?type=stac'
				},
				{
					name: 'Dynamic vector data',
					icon: '/assets/postgresql.png',
					url: '/api/datasets?type=pgtileserv'
				},
				{
					name: 'Favourite',
					icon: '/assets/star.png',
					url: '/api/datasets?staronly=true'
				},
				{
					name: 'My data',
					icon: 'fa-solid fa-circle-user',
					url: '/api/datasets?mydata=true'
				}
			]
		}
	});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get menu items for data searching navigation';
	c.description = `Get menu items for data tab at maps page according to the current breadcrumbs setting. The reponse maybe will be different if users do not sign in.`;
	c.tags = ['menu'];
	c = AddSecurictyModifier(c);
	return c;
};

export default new Endpoint({ Query, Output, Modifier }).handle(async (param, { locals, url }) => {
	const session = await locals.auth();
	const breadcrumbs = param.breadcrumbs ?? 'Home';

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
				items = (await createCountryMenu(fetch, url, region)) as Breadcrumb[];
			}
		}
	}

	return {
		items
	};
});

const createSDGMenu = async (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	url: URL
) => {
	const sdgBreadcrumb = DataCategories.find((b) => b.name === 'SDG') as Breadcrumb;

	const apiUrl = new URL(`${url.origin}${sdgBreadcrumb.url}`);

	const res = await fetch(apiUrl.toString());
	const json = await res.json();
	const values: [{ value: string; count: number }] = json[Object.keys(json)[0]];

	let num_values = values.map((v) => Number(v.value));
	num_values = num_values.sort((a, b) => a - b);
	const sdgs = num_values.map((num) => {
		return {
			name: `SDG${num}`,
			icon: `sdg-${num}`,
			url: `/api/datasets?sdg_goal=${num}`
		} as Breadcrumb;
	});
	return sdgs;
};

const createRegionMenu = async (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	url: URL
) => {
	const continentBreadcrumb = DataCategories.find((b) => b.name === 'Continent') as Breadcrumb;
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
