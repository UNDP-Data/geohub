<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidate } from '$app/navigation';
	import MapHero from '$components/pages/home/MapHero.svelte';
	import MapStyleCardList from '$components/pages/home/MapStyleCardList.svelte';
	import { FooterItems, HeaderItems, MapStyleId } from '$lib/config/AppConfig';
	import type { MapsData } from '$lib/types';
	import {
		CtaLink,
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
</script>

<svelte:window bind:innerWidth />

<div class="map-hero">
	<MapHero styleId={MapStyleId} interactive={false} />

	<div class="map-menu columns p-4">
		<div class="column is-4">
			<div class="is-flex is-flex-direction-column p-3 map-menu-box">
				<p class="is-size-4 is-size-5-mobile mb-2">Maps</p>
				<p class="is-size-6 is-size-7-mobile mb-5">
					Explore comunity maps created and shared by users or create your own map
				</p>
				<div class="cta-link">
					<CtaLink label="Explore" on:clicked={() => scrollTo('maps')} />
				</div>
			</div>
		</div>
		<div class="column is-4">
			<div class="is-flex is-flex-direction-column p-3 map-menu-box">
				<p class="is-size-4 is-size-5-mobile mb-2">Datasets</p>
				<p class="is-size-6 is-size-7-mobile mb-5">
					Explore data catalogue or upload your datasets
				</p>
				<div class="cta-link">
					<CtaLink label="Explore" href="/data" />
				</div>
			</div>
		</div>
		<div class="column is-4">
			<div class="is-flex is-flex-direction-column p-3 map-menu-box">
				<p class="is-size-4 is-size-5-mobile mb-2">User Guide</p>
				<p class="is-size-6 is-size-7-mobile mb-5">
					User guide is available to describe core features.
				</p>
				<div class="cta-link">
					<CtaLink label="Read more" href={HeaderItems(['support'])[0].href} />
				</div>
			</div>
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

	<div id="maps" class="mt-6">
		<MapStyleCardList bind:mapData={mapsData} on:change={handleMapChanged} />
	</div>
</div>

<section id="launch-map" class="hero my-4">
	<div class="hero-body">
		<div
			class="is-flex is-justify-content-center is-flex-direction-column has-text-centered wordwrap py-4"
		>
			<p class="title is-2">Create your own map</p>
			<p class="subtitle is-4 wordwrap">
				Create a map with GeoHub datasets to share with your colleagues.
			</p>

			<p>
				<a class="button is-large is-primary" href="/map">
					<span class="icon">
						<i class="fas fa-rocket"></i>
					</span>
					<span>Launch map</span>
				</a>
			</p>
		</div>
	</div>
</section>

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

<section id="explore-data" class="hero is-medium is-link my-4">
	<div class="hero-body">
		<div
			class="is-flex is-justify-content-center is-flex-direction-column has-text-centered wordwrap py-4"
		>
			<p class="title is-2">Explore GeoHub datasets</p>
			<p class="subtitle is-4 wordwrap">
				You can start exploring and analysing datasets in GeoHub, or upload your datasets.
			</p>

			<p>
				<a class="button is-large is-primary" href={`/data`}>
					<span class="icon">
						<i class="fas fa-database"></i>
					</span>
					<span>Explore datasets</span>
				</a>
			</p>
		</div>
	</div>
</section>

<section id="github" class="my-4">
	<div
		class="is-flex is-justify-content-center is-flex-direction-column has-text-centered wordwrap py-4"
	>
		<p class="title is-2 py-4">Fully open source</p>

		<p class="subtitle is-4 px-6 py-2">
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

		.map-menu {
			position: absolute;
			width: 100%;
			bottom: 40px;
			left: 51%;
			transform: translateX(-50%);

			.map-menu-box {
				position: relative;
				height: 180px;
				background-color: white;

				@media (max-width: 48em) {
					height: fit-content;
				}

				.cta-link {
					position: absolute;
					bottom: 1rem;
				}
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
</style>
