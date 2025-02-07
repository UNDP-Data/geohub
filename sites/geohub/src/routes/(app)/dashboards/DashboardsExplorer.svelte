<script lang="ts">
	import { browser } from '$app/environment';
	import { FluidCarousel, type CarouselContent } from '@undp-data/svelte-undp-design';

	let contents: CarouselContent[] = $state([
		{
			tag: 'Dashboard',
			imageUrl: '/assets/electricity-snapshot.webp',
			title: 'GeoHub Electricity Access Dashboard',
			description: `Explore the latest and future trends in electricity access to understand the distribution and location of populations at risk of being left behind in more than 100 countries. These datasets complement household-derived information on electricity access at the subnational level, providing more granular and up-to-date statistics to support electrification plans and investments aimed at achieving universal access by 2030 (SDG7).`,
			linkName: 'Open dashboard',
			linkUrl: '/dashboards/electricity'
		},
		{
			tag: 'Dashboard',
			imageUrl: '/assets/ceei-snapshot.webp',
			title: 'CEEI Dashboard',
			description:
				'This dashboard maps the Clean Energy Equity Index (CEEI) for the area. The dashboard allows the user to adjust the data computation to simulate various scenarios for the CEEI value.',
			linkName: 'Open dashboard',
			linkUrl: '/dashboards/ceei'
		},
		{
			tag: 'Dashboard',
			imageUrl: 'https://www.undp.org/sites/g/files/zskgke326/files/2022-07/Zanzibar%20tourism.jpg',
			title: 'Zanzibar tourism',
			description: `
			This dashboard maps the beauty of the world famous and popular destination - Zanzibar, Tanzania.
			The UNDP Accelerator Lab collaborated with OpenMap Development Tanzania and the State University of Zanzibar's youth mappers chapter to map unpopular tourist attractions with the goal of assessing the existing situation through crowd mapping and mobile surveys.
			`,
			linkName: 'Open dashboard',
			linkUrl: '/dashboards/zanzibar'
		}
	]);
</script>

{#if browser}
	<FluidCarousel bind:contents />
{/if}
