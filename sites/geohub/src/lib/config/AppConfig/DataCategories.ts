import type { Breadcrumb } from '@undp-data/svelte-undp-design';

export const DataCategories: Breadcrumb[] = [
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
	// {
	//   name: 'WFP',
	//   icon: '/assets/wfp.svg',
	//   url: '/api/datasets?provider=wfp',
	// },
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
];
