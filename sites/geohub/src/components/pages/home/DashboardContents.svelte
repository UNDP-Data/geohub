<script lang="ts">
	import { FluidCarousel, type CarouselContent } from '@undp-data/svelte-undp-design';

	let contents: CarouselContent[] = [
		{
			tag: 'Dashboard',
			imageUrl: '/assets/electricity-snapshot.png',
			title: 'GeoHub Electricity Access Dashboard',
			description: `Explore the latest and future trends in electricity access to understand the distribution and location of populations at risk of being left behind in more than 100 countries. These datasets complement household-derived information on electricity access at the subnational level, providing more granular and up-to-date statistics to support electrification plans and investments aimed at achieving universal access by 2030 (SDG7).`,
			linkName: 'Open dashboard',
			linkUrl: '/dashboards/electricity'
		},
		{
			tag: 'Dashboard',
			imageUrl: '/assets/ceei-snapshot.png',
			title: 'CEEI Dashboard',
			description:
				'This dashboard maps the Clean Energy Equity Index (CEEI) for the area. The dashboard allows the user to adjust the data computation to simulate various scenarios for the CEEI value.',
			linkName: 'Open dashboard',
			linkUrl: '/dashboards/ceei'
		}
	];
</script>

<FluidCarousel bind:contents />
