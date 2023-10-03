<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import MapHero from '$components/MapHero.svelte';
	import DataUploadButton from '$components/data-upload/DataUploadButton.svelte';
	import MapStyleCardList from '$components/maps/MapStyleCardList.svelte';
	import { FooterItems, HeaderItems } from '$lib/config/AppConfig';
	import { fromLocalStorage, storageKeys } from '$lib/helper';
	import type { MapsData } from '$lib/types';
	import {
		FluidCarousel,
		Stats,
		type CarouselContent,
		type StatsCard
	} from '@undp-data/svelte-undp-design';
	import maplibregl from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import type { PageData } from './$types';

	let protocol = new pmtiles.Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);

	export let data: PageData;

	let innerWidth: number;
	$: isMobile = innerWidth < 768 ? true : false;

	let stats: StatsCard[] = data.stats;
	let mapsData: MapsData = data.styles;

	const handleMapChanged = async () => {
		mapsData = undefined;
		await invalidate('data:styles');
		mapsData = data.styles;
	};

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

	const scrollTo = (hash: string) => {
		if (browser) {
			const anchor = document.getElementById(hash);
			window.scrollTo({
				top: anchor.offsetTop - 120,
				behavior: 'smooth'
			});
		}
	};

	const mapStyleIdStorageKey = storageKeys.mapStyleId($page.url.host);
	const initialMapStyleId: string = fromLocalStorage(mapStyleIdStorageKey, null)?.toString();
</script>

<svelte:window bind:innerWidth />

<div class="map-hero">
	<MapHero interactive={false} />

	<div class="map-title p-2">
		<img src="/assets/undp-images/undp-logo-blue.svg" alt="logo" class="logo" />
		<div class="is-flex is-flex-direction-column">
			<p class="title is-1 py-3">GeoHub</p>
			<p class="subtitle is-4 pt-2">UNDP's one stop shop for spatial data and analytics</p>
		</div>
		<div class="mt-4 grid-buttons">
			<button
				class="button is-primary {innerWidth < 768 ? 'is-small' : 'is-normal'}"
				on:click={() => scrollTo('dashboards')}
			>
				<span class="icon">
					<i class="fas fa-map"></i>
				</span>
				<span>Explore maps</span>
			</button>

			<a
				class="button is-primary {innerWidth < 768 ? 'is-small' : 'is-normal'}"
				href="/data"
				data-sveltekit-preload-code="viewport"
				data-sveltekit-preload-data="hover"
			>
				<span class="icon">
					<i class="fas fa-database"></i>
				</span>
				<span>Explore datasets</span>
			</a>

			<a
				data-sveltekit-preload-code="viewport"
				data-sveltekit-preload-data="hover"
				class="button is-primary {innerWidth < 768 ? 'is-small' : 'is-normal'}"
				href={initialMapStyleId ? `/map/${initialMapStyleId}` : '/map'}
			>
				<span class="icon">
					<i class="fas fa-rocket"></i>
				</span>
				<span>Launch map</span>
			</a>

			<a
				data-sveltekit-preload-code="viewport"
				data-sveltekit-preload-data="hover"
				class="button is-link {innerWidth < 768 ? 'is-small' : 'is-normal'}"
				href={HeaderItems(['support'])[0].href}
			>
				<span class="icon">
					<i class="fas fa-circle-question"></i>
				</span>
				<span>User Guide</span>
			</a>
		</div>
	</div>
</div>

<section class="hero is-medium is-link">
	<div class="hero-body">
		<p class="title is-3 is-flex is-justify-content-center has-text-centered wordwrap">
			UNDP GeoHub is a centralised ecosystem of geospatial services to support staff and development
			policy makers in the context of SDGs.
		</p>
	</div>
</section>

<p class="title is-2 mt-6 mb-4 has-text-centered">Why GeoHub?</p>
<div
	class="is-flex is-justify-content-center is-flex-direction-column has-text-centered wordwrap py-4"
>
	<p class="subtitle is-3">The reasons and challenges why we developed GeoHub:</p>
	<div class="is-flex is-flex-direction-column">
		<div class="pb-5">
			<span class="icon">
				<i class="fas fa-database fa-2x"></i>
			</span>
			<p class="subtitle is-4">No centralised geospatial repository</p>
		</div>
		<div class="pb-5">
			<span class="icon">
				<i class="fas fa-chart-simple fa-2x"></i>
			</span>
			<p class="subtitle is-4">Spatialised staff and skills required to work with geospatial</p>
		</div>
		<div class="pb-5">
			<span class="icon">
				<i class="fas fa-dollar-sign fa-2x"></i>
			</span>
			<p class="subtitle is-4">Geospatial analytics and work was carried out by consultants</p>
		</div>
		<div class="pb-5">
			<span class="icon">
				<i class="fas fa-server fa-2x"></i>
			</span>
			<p class="subtitle is-4">Limited hardware/software capabilities, mainly commercial</p>
		</div>
	</div>
</div>

<section id="dashboards" class="hero is-medium is-link mb-6">
	<div
		class="hero-body is-flex is-justify-content-center is-flex-direction-column has-text-centered"
	>
		<p class="title is-2">Explore dashboards</p>
		<p class="subtitle is-4 wordwrap">
			GeoHub dashboards are special use cases which use the datasets from GeoHub repository. You can
			explore our dashboards.
		</p>
	</div>
</section>

{#if browser}
	<div class="mx-6">
		<FluidCarousel bind:contents />
	</div>
{/if}

<section class="hero is-medium is-link my-6">
	<div
		class="hero-body is-flex is-justify-content-center is-flex-direction-column has-text-centered"
	>
		<p class="title is-2">Community Maps</p>
		<p class="subtitle is-4 wordwrap">
			Community maps are created and shared by users to visualise GeoHub datasets for their
			purposes. You can also start creating your own maps by customising a community maps other than
			making from scratch.
		</p>
	</div>
</section>

<div class="main-section m-6">
	<div class="grid is-flex {isMobile ? 'is-flex-direction-column' : 'is-flex-direction-row'}">
		{#each stats as card}
			<Stats bind:card size={isMobile ? 'medium' : 'small'} />
		{/each}
	</div>

	<div class="mt-6">
		<MapStyleCardList bind:mapData={mapsData} on:change={handleMapChanged} />
	</div>
</div>

<section id="map" class="hero is-medium is-link my-4">
	<div class="hero-body">
		<div
			class="is-flex is-justify-content-center is-flex-direction-column has-text-centered wordwrap py-4"
		>
			<p class="title is-2">Explore GeoHub datasets</p>
			<p class="subtitle is-4 wordwrap">
				You can start exploring and analysing datasets in GeoHub, or start creating your own map.
			</p>

			<div class="explore-button-grid">
				<a
					class="button is-large is-primary"
					href={`/data`}
					data-sveltekit-preload-code="off"
					data-sveltekit-preload-data="off"
				>
					Explore datasets
				</a>
				<a
					class="button is-large is-primary"
					href={initialMapStyleId ? `/map/${initialMapStyleId}` : '/map'}
				>
					Launch map
				</a>
			</div>
		</div>

		<p class="pt-4 subtitle is-4 is-flex is-justify-content-center has-text-centered wordwrap">
			{#if data.session}
				Start uploading your datasets to GeoHub.
			{:else}
				Sign in to start uploading your datasets to GeoHub.
			{/if}
		</p>
		<div class="is-flex is-justify-content-center has-text-centered">
			{#if data.session}
				<DataUploadButton size="large" />
			{:else}
				<a class="button is-primary is-large" href="/auth/signIn"> SIGN IN </a>
			{/if}
		</div>
	</div>
</section>

<section id="github" class="my-4">
	<div
		class="is-flex is-justify-content-center is-flex-direction-column has-text-centered wordwrap py-4"
	>
		<p class="title is-2 py-4">Fully open source</p>

		<p class="subtitle is-4">
			GeoHub is being developed under an open source software license, and most datasets are
			published as open data.
			<br />
			The source code is available from the below button. Feel free to create an issue or ask questions
			in the GitHub!
		</p>
		<div>
			<a class="button is-large is-link" href={FooterItems['For Developers'][0].url}>
				<span class="icon">
					<i class="fab fa-github"></i>
				</span>
				<span>GitHub</span>
			</a>
		</div>
	</div>
</section>

<style lang="scss">
	.map-hero {
		position: relative;

		.map-title {
			position: absolute;
			background-color: rgba(255, 255, 255, 0.7);
			width: 400px;
			height: fit-content;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);

			@media (max-width: 48em) {
				width: 80%;
			}

			.logo {
				position: absolute;
				height: 64px;
			}

			.title {
				text-align: center;
			}

			.subtitle {
				text-align: center;
				border-top: 1px solid gray;
			}

			.grid-buttons {
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 10px;
			}
		}
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

	.wordwrap {
		word-wrap: break-word;
	}

	.explore-button-grid {
		margin-left: auto;
		margin-right: auto;
		display: grid;
		grid-template-columns: repeat(1, 200px);
		gap: 20px;

		@media (max-width: 48em) {
			grid-template-columns: 1fr;
		}
	}
</style>
