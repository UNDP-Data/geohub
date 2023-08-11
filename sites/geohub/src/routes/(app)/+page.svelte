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
	import MapHero from './MapHero.svelte';
	import { HeaderItems } from '$lib/config/AppConfig';

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

	const scrollTo = (hash: string) => {
		const anchor = document.getElementById(hash);
		window.scrollTo({
			top: anchor.offsetTop - 120,
			behavior: 'smooth'
		});
	};

	const openSupportPage = () => {
		const url = HeaderItems(['support'])[0].href;
		document.location = url;
	};
</script>

<svelte:window bind:innerWidth />

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={title} />
	<meta property="og:title" content={title} />
</svelte:head>

<div class="map-hero">
	<MapHero />

	<div class="map-title p-2">
		<img src="/assets/undp-images/undp-logo-blue.svg" alt="logo" class="logo" />
		<div class="is-flex is-flex-direction-column">
			<p class="title is-1">GeoHub</p>
			<p class="subtitle is-4">UNDP's one stop shop for spatial data and analytics</p>
		</div>
		<div class="mt-4 is-flex is-flex-direction-row is-justify-content-space-evenly">
			<button
				class="button is-primary {innerWidth < 768 ? 'is-small' : 'is-normal'}"
				on:click={() => scrollTo('dashboards')}>Explore maps</button
			>
			<button
				class="button is-primary {innerWidth < 768 ? 'is-small' : 'is-normal'}"
				on:click={() => scrollTo('map')}>Launch map</button
			>
			<button
				class="button is-link {innerWidth < 768 ? 'is-small' : 'is-normal'}"
				on:click={openSupportPage}>Userguide</button
			>
		</div>
	</div>
</div>

<p id="dashboards" class="title is-2 mt-6 mb-4 align-center wordwrap">Explore dashboards</p>
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

<section id="map" class="hero is-medium is-link my-4">
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
				}}>Launch map</button
			>
		</div>
	</div>
</section>

<style lang="scss">
	.map-hero {
		position: relative;

		.map-title {
			position: absolute;
			background-color: rgba(255, 255, 255, 0.5);
			width: 400px;
			height: fit-content;
			right: 10%;
			bottom: 150px;

			@media (max-width: 48em) {
				width: 80%;
			}

			.logo {
				position: absolute;
				height: 55px;
			}

			.title {
				text-align: right;
			}

			.subtitle {
				text-align: right;
				border-top: 1px solid gray;
			}
		}
	}

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
