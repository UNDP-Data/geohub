<script lang="ts">
	import { FluidCarousel, type CarouselContent } from '@undp-data/svelte-undp-design';

	let contents: CarouselContent[] = [
		{
			tag: 'Dashboard',
			imageUrl: '/assets/electricity-snapshot.png',
			title: 'GeoHub Electricity Dashboard',
			description:
				'This dashboard presented here is a raster layer that display the likelihood of full electrification for a given area with High Resolution Electricity Access (HREA). These are created by the University of Michigan, used to support the 2030 Social Development Goal (SDG) 7: ensuring access to affordable, reliable, sustainable and modern energy for all.',
			linkName: 'Open dashboard',
			linkUrl: '/dashboards/electricity'
		}
	];
</script>

<FluidCarousel bind:contents />
