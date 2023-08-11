<script lang="ts">
	import type { PageData } from './$types';
	import MapStyleCardList from '$components/maps/MapStyleCardList.svelte';
	import {
		Stats,
		type StatsCard,
		FluidCarousel,
		type CarouselContent
	} from '@undp-data/svelte-undp-design';
	import { browser } from '$app/environment';

	export let data: PageData;

	let innerWidth: number;
	$: isMobile = innerWidth < 768 ? true : false;

	let stats: StatsCard[] = data.stats;

	let contents: CarouselContent[] = [
		{
			tag: 'Dashboard',
			imageUrl: '/assets/electricity-snapshot.png',
			title: 'GeoHub Electricity Dashboard',
			description:
				'This dashboard presented here are two raster layers that display the likelihood of full electrification for a given area: High Resolution Electricity Access (HREA) and Machine Learning (ML). These are created by the University of Michigan, used to support the 2030 Social Development Goal (SDG) 7: ensuring access to affordable, reliable, sustainable and modern energy for all.',
			linkName: 'Open dashboard',
			linkUrl: '/dashboards/electricity'
		}
	];

	let title = 'GeoHub';
</script>

<svelte:window bind:innerWidth />

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={title} />
	<meta property="og:title" content={title} />
</svelte:head>

<p class="title is-2 mb-4 align-center wordwrap">Explore dashboards</p>
{#if browser}
	<div class="mx-6">
		<FluidCarousel bind:contents />
	</div>
{/if}

<div class="is-divider" />

<div class="main-section m-6">
	<p class="title is-2 my-4 align-center wordwrap">Community Maps</p>

	{#if stats}
		<div class="grid is-flex {isMobile ? 'is-flex-direction-column' : 'is-flex-direction-row'}">
			{#each stats as card}
				<Stats bind:card size={isMobile ? 'medium' : 'small'} />
			{/each}
		</div>
	{/if}

	<div class="mt-6">
		<MapStyleCardList />
	</div>
</div>

<section class="hero is-medium is-link my-4">
	<div class="hero-body">
		<p class="title is-2 align-center text-align-center">Explore GeoHub datasets</p>
		<p class="subtitle is-4 align-center text-align-center wordwrap">
			You can start exploring datasets in GeoHub, then create your own map to share with community.
		</p>

		<div class="align-center">
			<button
				class="button is-large is-primary"
				on:click={() => {
					document.location = '/map';
				}}>Explore data</button
			>
		</div>
	</div>
</section>

<style lang="scss">
	.align-center {
		width: max-content;
		margin-left: auto;
		margin-right: auto;
	}

	.main-section {
		.grid {
			margin: 0 auto;
			width: fit-content;

			:global(.stats-card) {
				margin: 5px;
			}
		}
	}

	.text-align-center {
		width: 90%;
		text-align: center;
	}

	.wordwrap {
		word-wrap: break-word;
	}
</style>
