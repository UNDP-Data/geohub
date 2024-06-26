<script lang="ts">
	import { browser } from '$app/environment';
	import DashboardContents from '$components/pages/home/DashboardContents.svelte';
	import ExploreDatasets from '$components/pages/home/ExploreDatasets.svelte';
	import MapHero from '$components/pages/home/MapHero.svelte';
	import MapStyleCardList from '$components/pages/home/MapStyleCardList.svelte';
	import { MapStyleId } from '$lib/config/AppConfig';
	import type { MapsData } from '$lib/types';
	import { HeroLink, handleEnterKey } from '@undp-data/svelte-undp-components';
	import { Card, DefaultLink, Stats } from '@undp-data/svelte-undp-design';
	import { addProtocol } from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let innerWidth: number;
	$: isMobile = innerWidth < 768 ? true : false;

	let stats = data.stats;
	let mapsData: MapsData = data.styles;

	let docsUrl = data.headerLinks.find((l) => l.title.toLowerCase() === 'support')?.href;

	const scrollTo = (hash: string) => {
		if (browser) {
			const anchor = document.getElementById(hash);
			window.scrollTo({
				top: anchor.offsetTop - 120,
				behavior: 'smooth'
			});
		}
	};

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);
	});
</script>

<svelte:window bind:innerWidth />

<div class="map-hero">
	<MapHero styleId={MapStyleId} interactive={false} />

	<div class="map-menu columns p-4">
		<div class="column is-4 p-1">
			<Card
				linkName="Explore"
				url="/maps"
				tag=""
				title="Maps"
				description={!isMobile
					? 'Explore comunity maps created and shared by users or create your own map'
					: ''}
			/>
		</div>
		<div class="column is-4 p-1">
			<Card
				linkName="Explore"
				url="/data"
				tag=""
				title="Datasets"
				description={!isMobile ? 'Explore data catalogue or upload your datasets' : ''}
			/>
		</div>
		{#if docsUrl}
			<div class="column is-4 p-1">
				<Card
					linkName="Read more"
					url={docsUrl}
					tag=""
					title="User Guide"
					description={!isMobile ? 'User guide is available to describe core features.' : ''}
				/>
			</div>
		{/if}
	</div>

	<div class="scroll-down-arrow">
		<!-- svelte-ignore a11y-missing-attribute -->
		<a
			role="button"
			tabindex="0"
			on:click={() => scrollTo('top')}
			on:keydown={handleEnterKey}
			data-sveltekit-preload-data="off"
			data-sveltekit-preload-code="off"
		>
			<span class="icon has-text-grey"><i class="fa-solid fa-angle-down fa-4x"></i></span>
		</a>
	</div>
</div>

<section id="top" class="hero is-medium is-link">
	<div class="hero-body has-text-centered">
		<p class="title is-3 mx-auto max-width">
			UNDP GeoHub is a centralised ecosystem of geospatial services to support staff and development
			policy makers in the context of SDGs.
		</p>
	</div>
</section>

<p class="title is-2 mt-6 mb-4 has-text-centered">Why GeoHub?</p>
<div
	class="is-flex is-justify-content-center is-flex-direction-column has-text-centered p-4 mx-auto max-width"
>
	<p class="is-size-5 mb-4">The reasons and challenges why we developed GeoHub:</p>
	<div class="is-flex is-flex-direction-column">
		<div class="pb-5">
			<span class="icon">
				<i class="fas fa-database fa-2x"></i>
			</span>
			<p class="is-size-6">No centralised geospatial repository</p>
		</div>
		<div class="pb-5">
			<span class="icon">
				<i class="fas fa-chart-simple fa-2x"></i>
			</span>
			<p class="is-size-6">Specialized staff and skills required to work with geospatial</p>
		</div>
		<div class="pb-5">
			<span class="icon">
				<i class="fas fa-dollar-sign fa-2x"></i>
			</span>
			<p class="is-size-6">Geospatial analytics and work was carried out by consultants</p>
		</div>
		<div class="pb-5">
			<span class="icon">
				<i class="fas fa-server fa-2x"></i>
			</span>
			<p class="is-size-6">Limited hardware/software capabilities, mainly commercial</p>
		</div>
	</div>

	<p class="is-size-5">
		GeoHub was designed for users to do geospatial analytical works without having advanced
		geospatial knowledge and skills
	</p>
</div>

<section class="hero is-link py-6 my-6">
	<div class="hero-body has-text-centered">
		<h2 class="title is-2 mb-4 has-text-white has-text-weight-bold">Community Maps</h2>

		<p class="is-size-5 has-text-white mx-auto mb-4 max-width">
			Community maps are created and shared by users to visualize GeoHub datasets for their
			purposes. You can start <DefaultLink href="/maps" title="exploring more maps" target="" /> or
			<DefaultLink href="/maps/edit" title="creating a new map" target="" />.
		</p>
	</div>
</section>

<div class="main-section m-6">
	<div id="maps">
		<MapStyleCardList bind:mapData={mapsData} showMenu={false} />
	</div>
</div>

<section id="explore-data" class="hero is-link py-6 my-4">
	<div class="hero-body has-text-centered">
		<h2 class="title is-2 mb-4 has-text-white has-text-weight-bold">Explore GeoHub datasets</h2>

		<p class="is-size-5 has-text-white mx-auto mb-4 max-width">
			You can start exploring and analysing datasets in GeoHub, or upload your datasets.
		</p>
	</div>
</section>

<section>
	<div
		class="stat-grid is-flex {isMobile ? 'is-flex-direction-column' : 'is-flex-direction-row'} my-4"
	>
		{#each stats.dataset as card}
			<Stats bind:card size={isMobile ? 'medium' : 'small'} />
		{/each}
	</div>

	<ExploreDatasets />
</section>

<HeroLink title="Analytical tools" linkName="Explore analytical tools" href="/tools">
	More and more geospatial analytical tools for decision making are being developed to GeoHub.
</HeroLink>

<section id="dashboards" class="hero is-link py-6 mb-6">
	<div class="hero-body has-text-centered">
		<h2 class="title is-2 mb-4 has-text-white has-text-weight-bold">Explore dashboards</h2>

		<p class="is-size-5 has-text-white mx-auto mb-4 max-width">
			GeoHub dashboards are special use cases which use the datasets from GeoHub repository. You can
			explore our dashboards.
		</p>
	</div>
</section>

{#if browser}
	<div class="mx-6 my-6">
		<DashboardContents />
	</div>
{/if}

<HeroLink
	title="Fully open source"
	linkName="Open GitHub"
	href={data.footerLinks['For Developers'][0].url}
>
	GeoHub is being developed under an open source software license, and most datasets are published
	as open data. The source code is available from the below button. Feel free to create an issue or
	ask questions in the GitHub!
</HeroLink>

<style lang="scss">
	.map-hero {
		position: relative;

		.map-menu {
			position: absolute;
			width: 100%;
			bottom: 50px;
			left: 51%;
			transform: translateX(-50%);
		}

		.scroll-down-arrow {
			position: absolute;
			bottom: 40px;
			left: 50%;
			transform: translateX(-50%);
			cursor: pointer;

			a {
				padding-top: 70px;

				span {
					position: absolute;
					bottom: 15px;
					left: 50%;
					width: 24px;
					height: 24px;
					margin-left: -12px;
					-webkit-animation: sdb05 1.5s infinite;
					animation: sdb05 1.5s infinite;
					box-sizing: border-box;

					@-webkit-keyframes sdb05 {
						0% {
							-webkit-transform: translate(0, 0);
							opacity: 0;
						}
						50% {
							opacity: 1;
						}
						100% {
							-webkit-transform: translate(0, 20px);
							opacity: 0;
						}
					}
					@keyframes sdb05 {
						0% {
							transform: translate(0, 0);
							opacity: 0;
						}
						50% {
							opacity: 1;
						}
						100% {
							transform: translate(0, 20px);
							opacity: 0;
						}
					}
				}
			}
		}
	}

	.stat-grid {
		margin: 0 auto;
		width: fit-content;

		:global(.stats-card) {
			margin: 5px;
		}
	}

	.max-width {
		max-width: 768px;
	}
</style>
