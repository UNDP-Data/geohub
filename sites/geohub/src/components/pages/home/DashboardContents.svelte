<script lang="ts">
	import { FluidCarousel, type CarouselContent } from '@undp-data/svelte-undp-design';

	let contents: CarouselContent[] = [
		{
			tag: 'Dashboard',
			imageUrl: '/assets/electricity-snapshot.png',
			title: 'GeoHub Electricity Dashboard',
			description:
				'This dashboard presented here are two raster layers that display the likelihood of full electrification for a given area: High Resolution Electricity Access (HREA) and Machine Learning (ML). These are created by the University of Michigan, used to support the 2030 Social Development Goal (SDG) 7: ensuring access to affordable, reliable, sustainable and modern energy for all.',
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
