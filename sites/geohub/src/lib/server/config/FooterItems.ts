import type { FooterItem } from '@undp-data/svelte-undp-design';
import { env } from '$env/dynamic/private';

export type FooterItemType = 'geohub' | 'dashboard' | 'dev' | 'dfx' | 'tools' | 'management';

export const getFooterItems = (types: FooterItemType[], is_superuser = false) => {
	const footerItems: {
		[key: string]: FooterItem[];
	} = {};

	types.forEach((type) => {
		switch (type) {
			case 'dfx':
				footerItems['Data Futures Exchange'] = [
					{
						title: 'Home',
						url: 'https://data.undp.org'
					}
				];
				break;
			case 'geohub':
				footerItems['GeoHub'] = [
					{
						title: 'Home',
						url: '/'
					},
					{
						title: 'Data',
						url: '/data'
					},
					{
						title: 'Maps',
						url: '/maps'
					},
					{
						title: 'Tools',
						url: '/tools'
					},
					{
						title: 'Support',
						url: env.GEOHUB_DOCS_ENDPOINT ?? ''
					},
					{
						title: 'Licenses',
						url: '/license'
					}
				];

				if (is_superuser) {
					footerItems['GeoHub'].push(
						...[
							{
								title: 'Management',
								url: '/management'
							}
						]
					);
				}

				break;
			case 'dashboard':
				footerItems['Dashboard'] = [
					{
						title: 'Dashboards',
						url: '/dashboards'
					},
					{
						title: 'Electricity Dashboard',
						url: '/dashboards/electricity'
					},
					{
						title: 'CEEI Dashboard',
						url: '/dashboards/ceei'
					}
				];
				break;

			case 'tools':
				footerItems['Tools'] = [
					{
						title: 'All tools',
						url: '/tools'
					},
					{
						title: 'New map',
						url: '/maps/edit'
					},
					{
						title: 'Storymaps',
						url: '/storymaps'
					}
				];
				break;

			case 'dev':
				footerItems['For Developers'] = [
					{
						title: 'Github Repo',
						url: 'https://github.com/UNDP-Data/geohub'
					},

					{
						title: 'REST API spec',
						url: '/api'
					},
					{
						title: 'Static Image API',
						url: env.GEOHUB_STATIC_IMAGE_API ? env.GEOHUB_STATIC_IMAGE_API.replace('/api', '') : ''
					},
					{
						title: 'Svelte UNDP design sytem',
						url: env.SVELTE_UNDP_DESIGN_ENDPOINT ?? ''
					},
					{
						title: 'Svelte UNDP Components',
						url: env.SVELTE_UNDP_COMPONENTS_ENDPOINT ?? ''
					}
				];

				break;

			case 'management':
				if (is_superuser) {
					footerItems['Management'] = [
						{
							title: 'Management',
							url: '/management'
						},
						{
							title: 'pg_tileserv management',
							url: '/management/pgtileserv'
						},
						{
							title: 'STAC management',
							url: '/management/stac'
						}
					];
				}
				break;

			default:
				break;
		}
	});

	Object.keys(footerItems).forEach((key) => {
		footerItems[key] = [...footerItems[key].filter((l) => l.url !== '')];
	});

	return footerItems;
};
