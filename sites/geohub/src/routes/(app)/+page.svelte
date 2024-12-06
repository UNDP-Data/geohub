<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import MapHero from '$components/pages/map/MapHero.svelte';
	import MapStyleCardList from '$components/pages/map/MapStyleCardList.svelte';
	import { MapStyleId } from '$lib/config/AppConfig';
	import type { MapsData, StorymapsData } from '$lib/types';
	import { HEADER_HEIGHT_CONTEXT_KEY, type HeaderHeightStore } from '$stores';
	import { type BreadcrumbPage, Breadcrumbs, HeroLink } from '@undp-data/svelte-undp-components';
	import { Button, Card, CardWithImage, Loader } from '@undp-data/svelte-undp-design';
	import { addProtocol } from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { getContext, onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let innerWidth: number;
	// $: isMobile = innerWidth < 768 ? true : false;
	let headerHeightStore: HeaderHeightStore = getContext(HEADER_HEIGHT_CONTEXT_KEY);

	let stats = data.stats;
	let mapsData: MapsData = data.styles;

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'DATA FUTURES EXCHANGED', url: 'https://data.undp.org' },
		{ title: data.title, url: $page.url.href }
	];
	let storiesData: StorymapsData | undefined;

	const loadStorymaps = async () => {
		storiesData = undefined;

		const res = await fetch(`/api/storymaps?limit=3&sortby=updatedat,desc&accesslevel=3`);
		const stories: StorymapsData = await res.json();

		storiesData = stories;
		return storiesData;
	};

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);
	});
</script>

<svelte:window bind:innerWidth />

<section class="top-section columns mb-0" style="margin-top: {$headerHeightStore}px;">
	<div class="column p-0">
		<div class="top-content is-flex is-flex-direction-column is-justify-space-between">
			<Breadcrumbs pages={breadcrumbs} />

			<div class="content is-flex is-flex-direction-column">
				<h1 class="title is-1">
					{data.title}
				</h1>
				<p class="summary is-size-2 mb-0">
					open-source geospatial services for supporting SDG development
				</p>

				<div class="map-button">
					<Button
						title="CREATE MAP"
						isArrow={true}
						on:clicked={() => {
							goto('/maps/edit');
						}}
					></Button>
				</div>
			</div>
		</div>
	</div>
	<div class="column p-0 is-7">
		<MapHero styleId={MapStyleId} interactive={false} />
	</div>
</section>

<section class="overview-section">
	<div class="overview-header is-flex is-align-items-flex-start">
		<h2 class="title is-2 has-text-white">Overview</h2>
		<p class="has-text-white is-size-4">
			UNDP GeoHub is an <u>open-source</u> centralized platform offering geospatial tools and data to
			help policymakers and staff make informed decisions and drive progress on the SDGs.
		</p>
	</div>
	<div class="fixed-grid has-3-cols">
		<div class="grid is-gap-4">
			<div class="cell">
				<Card
					linkName="CREAT MAP"
					url="/maps/edit"
					tag=""
					title="Create and customize maps"
					description="Explore datasets and extract key insights through interactive maps."
				/>
			</div>
			<div class="cell">
				<Card
					linkName="Explore tools"
					url="/tools"
					tag=""
					title="Analyze data with tools"
					description="Use advanced analytical tools to refine data and create tailored maps."
				/>
			</div>
			<div class="cell">
				<Card
					linkName="Create storymap"
					url="/storymaps/edit"
					tag=""
					title="Share findings with stories"
					description="Create map-based stories that communicate your insights effectively."
				/>
			</div>
		</div>
	</div>
</section>

<section class="dataset-section p-6 my-4">
	<h2 class="title is-2">
		Visualize {stats.dataset.find((d) => d.title === 'Public datasets')?.stat} datasets
	</h2>
	<p class="description is-size-4">
		Explore datasets and extract key insights through interactive maps.
	</p>

	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 798" height="798" width="100%">
		<rect width="100%" height="100%" fill="white" stroke="gray" stroke-width="2" />
		<text
			x="50%"
			y="50%"
			dominant-baseline="middle"
			text-anchor="middle"
			fill="black"
			font-size="48px"
			font-family="Arial"
		>
			Dummy
		</text>
	</svg>
	<div class="turn-data-section is-flex is-flex-direction-column has-text-centered">
		<h2 class="title is-2">Turn data into insights</h2>
		<p class="is-size-5">
			Bring your ideas to life by transforming data into interactive maps.
			<br />
			Use GeoHub’s tools to visualize and analyze the data.
		</p>
		<div class="is-flex mt-6 mx-auto">
			<div>
				<Button
					title="EXPLORE DATASETS"
					isArrow={true}
					on:clicked={() => {
						goto('/data');
					}}
				></Button>
			</div>
			<a
				class="upload-button is-flex is-align-items-center has-text-black is-uppercase has-text-weight-bold py-4 pl-5 ml-5"
				href="/data/upload"
			>
				upload dataset

				<span class="ml-3 icon is-small">
					<i class="fa-solid fa-chevron-right has-text-primary"></i>
				</span>
			</a>
		</div>
	</div>

	<div class="map-section">
		<h3 class="title is-3 mb-5">Explore maps</h3>

		<div class="mb-5">
			<MapStyleCardList bind:mapData={mapsData} showMenu={false} />
		</div>

		<div class="explore-button">
			<Button
				title="EXPLORE ALL MAPS"
				isArrow={true}
				on:clicked={() => {
					goto('/maps');
				}}
			></Button>
		</div>
	</div>
</section>

<section class="storymap-section p-6 my-4">
	<h2 class="title is-2">Share your findings</h2>
	<p class="description is-size-4">Create a storymap to present and share your insights.</p>
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 798" height="798" width="100%">
		<rect width="100%" height="100%" fill="white" stroke="gray" stroke-width="2" />
		<text
			x="50%"
			y="50%"
			dominant-baseline="middle"
			text-anchor="middle"
			fill="black"
			font-size="48px"
			font-family="Arial"
		>
			Dummy
		</text>
	</svg>

	<div class="map-section">
		<h3 class="title is-3 mb-5">Explore storymaps</h3>

		<div class="mb-5">
			{#await loadStorymaps()}
				<div class="is-flex is-justify-content-center">
					<Loader size="large" />
				</div>
			{:then stories}
				<div class="columns is-multiline is-mobile">
					{#each stories.stories as story}
						{@const storyLink = story.links?.find((l) => l.rel === 'storymap')?.href}
						{@const staticLink = story.links?.find((l) => l.rel === 'static-auto')?.href}

						<div class="column is-one-third-tablet is-one-third-desktop is-full-mobile">
							<CardWithImage
								title={story.title ?? ''}
								url={storyLink}
								tag="Story"
								image={staticLink?.replace('{width}', '298').replace('{height}', '180') ?? ''}
								width={298}
								height={180}
								linkName="Explore"
							/>
						</div>
					{/each}
				</div>
			{/await}
		</div>
		<div class="explore-button">
			<Button
				title="EXPLORE ALL STORYMAPS"
				isArrow={true}
				on:clicked={() => {
					goto('/storymaps');
				}}
			></Button>
		</div>
	</div>
</section>

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
	.top-section {
		.top-content {
			margin-left: 117.5px;
			padding-top: 100px;

			.content {
				margin-top: 150px;
				.title {
					font-size: 55px !important;
				}
				.summary {
					font-size: 35px;
					line-height: 39.97px;
				}
				.map-button {
					width: 173px;
					margin-top: 48px;
				}
			}
		}
	}

	.overview-section {
		padding: 100px 142px;
		background-color: var(--undpds-color-gray-700);

		.overview-header {
			gap: 119px;
			margin-bottom: 4rem;

			.title {
				width: fit-content;
				white-space: nowrap;
			}
		}

		:global(.content-card) {
			border-top: 1px solid var(--undpds-color-white) !important;
			background-color: transparent !important;
		}
		:global(.content-caption) {
			color: var(--undpds-color-white) !important;
		}
		:global(.cta__link) {
			color: var(--undpds-color-white) !important;
		}
	}

	.dataset-section {
		.title {
			line-height: 109%;
		}

		.turn-data-section {
			background: var(--undpds-color-gray-300);
			margin: 64px 0;
			padding: 96px 144px;

			.upload-button {
				border: none;
				background-color: transparent;
			}
		}

		.map-section {
			.explore-button {
				width: 240px;
			}
		}
	}

	.storymap-section {
		.title {
			line-height: 109%;
		}

		.description {
			margin-bottom: 32px;
		}

		.map-section {
			margin-top: 32px;
			.explore-button {
				width: 300px;
			}
		}
	}
</style>
