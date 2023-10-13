<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import DataUploadButton from '$components/pages/data/ingesting/DataUploadButton.svelte';
	import IngestingDatasets from '$components/pages/data/ingesting/IngestingDatasets.svelte';
	import PublishedDatasets from '$components/pages/data/datasets/PublishedDatasets.svelte';
	import { getWebPubSubClient } from '$lib/WebPubSubClient';
	import { handleEnterKey } from '$lib/helper';
	import type {
		Continent,
		Country,
		DatasetFeatureCollection,
		IngestingDataset,
		Tag
	} from '$lib/types';
	import chroma from 'chroma-js';
	import { onMount, setContext } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let datasets: DatasetFeatureCollection = data.datasets;
	let ingestingDatasets: IngestingDataset[] = data.ingestingDatasets;

	// setup AzureWebPubSubClient instance and set it in context
	if (data.session) {
		const wpsClient = getWebPubSubClient(data.wss.url, data.wss.group);
		setContext(data.wss.group, wpsClient);
	}

	let selectedSDGs: Tag[];

	const handleRefreshDatasets = async () => {
		datasets = undefined;
		await invalidate('data:datasets');
		datasets = data.datasets;
	};

	const handleRefreshIngestingDatasets = async () => {
		ingestingDatasets = undefined;
		await invalidate('data:ingestingDatasets');
		ingestingDatasets = data.ingestingDatasets;
	};

	enum TabNames {
		DATA = 'Data',
		MYDATA = 'My data'
	}

	let tabs = [
		{
			id: '#data',
			label: TabNames.DATA,
			icon: 'fas fa-database'
		}
	];

	if (data.session) {
		tabs = [
			...tabs,
			{
				id: '#mydata',
				label: TabNames.MYDATA,
				icon: 'fas fa-user'
			}
		];
	}

	let activeTab: string = tabs[0].label;

	onMount(async () => {
		const hash = $page.url.hash;
		tabs.forEach((t) => {
			if (t.id === hash) {
				activeTab = t.label;
				return;
			}
		});

		if (activeTab !== 'mydata') {
			setTimeout(() => {
				// if any sdg, continent or country are selected in URL, scroll to data table
				const params = $page.url.searchParams;
				const sdg = params.getAll('sdg_goal');
				const continent = params.get('continent');
				const country = params.get('country');
				const query = params.get('query') ?? '';

				if (sdg.length > 0 || country || continent || query.length > 0) {
					scrollTo('manual-search');
				}
			}, 500);
		}
	});

	const scrollTo = (hash: string) => {
		if (browser) {
			const anchor = document.getElementById(hash);
			window.scrollTo({
				top: anchor.offsetTop - 100,
				behavior: 'smooth'
			});
		}
	};

	const handleSDGSelected = async (sdg: number) => {
		const url = $page.url;
		url.searchParams.delete('sdg_goal');
		url.searchParams.set('sdg_goal', `${sdg}`);

		selectedSDGs = [
			{
				key: 'sdg_goal',
				value: `${sdg}`
			}
		];

		history.replaceState({}, null, url);
		handleRefreshDatasets();

		scrollTo('manual-search');
	};

	let selectedContinent: Continent;
	let selectedContinents: string[];
	let selectedCountries: Tag[];

	let continents: Continent[] = [];
	const getContinents = async () => {
		const res = await fetch('/api/continents?filterbytag=true');
		const json = (await res.json()) as Continent[];
		return json;
	};

	let countries: Country[] = [];

	const getCountries = async () => {
		if (!selectedContinent) return [];
		const res = await fetch(
			`/api/countries?continent=${selectedContinent.continent_code}&filterbytag=true`
		);
		const json = await res.json();
		return json as Country[];
	};

	const handleContinentSelected = async (
		continentName: 'Global' | 'Africa' | 'Americas' | 'Antarctica' | 'Asia' | 'Europe' | 'Oceania'
	) => {
		if (!(continents?.length > 0)) {
			continents = await getContinents();
		}

		const url = $page.url;
		url.searchParams.delete('continent');
		url.searchParams.delete('country');
		selectedCountries = [];

		if (continentName !== 'Global') {
			selectedContinent = continents.find((c) => c.continent_name === continentName);
			countries = await getCountries();
			url.searchParams.set('continent', `${selectedContinent.continent_name}`);
			selectedContinents = [selectedContinent.continent_name];
		} else {
			selectedContinents = [];
		}

		datasets = undefined;
		history.replaceState({}, null, url);
		handleRefreshDatasets();

		if (countries.length === 0) {
			scrollTo('manual-search');
		} else {
			scrollTo('country-select');
		}
	};

	const handleCountrySelected = async (country: Country) => {
		const url = $page.url;
		url.searchParams.delete('continent');
		selectedContinents = [];
		url.searchParams.set('country', `${country.iso_3}`);

		selectedCountries = [
			{
				key: 'country',
				value: country.iso_3
			}
		];

		datasets = undefined;
		history.replaceState({}, null, url);
		handleRefreshDatasets();

		scrollTo('manual-search');
	};
</script>

{#if data.session}
	<div class="tabs is-fullwidth is-medium data-tabs">
		<ul>
			{#each tabs as tab}
				<li class={activeTab === tab.label ? 'is-active' : ''}>
					<a
						href={tab.id}
						role="tab"
						tabindex="0"
						on:click={() => (activeTab = tab.label)}
						on:keydown={handleEnterKey}
					>
						<span class="icon is-small"><i class={tab.icon} aria-hidden="true"></i></span>
						<span>{tab.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
{/if}
<div class="m-4 pb-2 {data.session ? 'pt-4' : 'pt-6'}">
	<div hidden={activeTab !== TabNames.DATA}>
		<section class="hero">
			<div class="hero-body">
				<p class="title is-2 is-flex is-flex-direction-column is-align-items-center">
					Explore the datasets from the below options
				</p>

				<div class="tile is-vertical is-ancestor">
					<div class="tile is-vertical">
						<div class="tile is-full">
							<div
								class="tile is-half mr-1"
								role="button"
								tabindex="0"
								on:click={() => scrollTo('sdg-search')}
								on:keydown={handleEnterKey}
							>
								<article
									class=" clickable-tile tile is-child notification is-warning is-light is-flex is-flex-direction-column is-align-items-center"
								>
									<p class="title">Start searching by SDG</p>
									<!-- <p class="subtitle">Aligned with the right tile</p>-->
									<div class="content">
										<img
											src="/assets/sdgs/SDG Wheel_Transparent_WEB.png"
											alt="sdgs"
											width="128"
											height="128"
										/>
									</div>
								</article>
							</div>
							<div
								class="tile is-half ml-1"
								role="button"
								tabindex="0"
								on:click={() => scrollTo('country-search')}
								on:keydown={handleEnterKey}
							>
								<article
									class="clickable-tile tile is-child notification is-link is-light is-flex is-flex-direction-column is-align-items-center"
								>
									<p class="title">Start searching by a region</p>
									<!-- <p class="subtitle">Aligned with the right tile</p>-->
									<div class="content">
										<i class="fa-solid fa-globe fa-10x"></i>
									</div>
								</article>
							</div>
						</div>

						<div
							class="tile is-full mt-2"
							role="button"
							tabindex="0"
							on:click={() => scrollTo('manual-search')}
							on:keydown={handleEnterKey}
						>
							<article
								class="clickable-tile tile is-child notification is-success is-light is-flex is-flex-direction-column is-align-items-center"
							>
								<p class="title">Search manually</p>
								<!-- <p class="subtitle">Aligned with the right tile</p>-->
								<div class="content">
									<i class="fa-solid fa-gear fa-5x"></i>
								</div>
							</article>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section id="sdg-search" class="hero">
			<div class="hero-body">
				<p class="title is-2 is-flex is-flex-direction-column is-align-items-center">
					Search datasets by SDG
				</p>

				<div class="sdg-grid m-2">
					{#each [...Array(17)].map((v, i) => i + 1) as sdg}
						<div
							class="selectable-sdg-card"
							role="button"
							tabindex="0"
							on:click={() => {
								handleSDGSelected(sdg);
							}}
							on:keydown={handleEnterKey}
						>
							<img src="/assets/sdgs/{sdg}.png" alt="sdg{sdg}" width="128" height="128" />
						</div>
					{/each}
				</div>
			</div>
		</section>

		<section id="country-search" class="hero">
			<div class="hero-body">
				<p class="title is-2 is-flex is-flex-direction-column is-align-items-center">
					Search datasets by a region
				</p>

				<p class="title is-3 is-flex is-justify-content-center">Please select a continent</p>

				<div class="is-flex is-flex-direction-column is-justify-content-center">
					<div class="tile is-ancestor">
						<div class="tile is-2">
							<div
								class="tile is-parent"
								role="button"
								tabindex="0"
								on:click={() => handleContinentSelected('Global')}
								on:keydown={handleEnterKey}
							>
								<article
									class="clickable-tile tile is-child notification is-success is-flex is-flex-direction-column is-align-items-center"
								>
									<p class="title">Global</p>
									<div class="content">
										<i class="fa-solid fa-globe fa-5x"></i>
									</div>
								</article>
							</div>
						</div>
						<div class="tile is-vertical">
							<div class="tile">
								<div
									class="tile is-parent is-4"
									role="button"
									tabindex="0"
									on:click={() => handleContinentSelected('Americas')}
									on:keydown={handleEnterKey}
								>
									<article
										class="clickable-tile tile is-child notification is-danger is-light is-flex is-flex-direction-column is-align-items-center"
									>
										<p class="title">Americas</p>
										<div class="content">
											<i class="fa-solid fa-earth-americas fa-5x"></i>
										</div>
									</article>
								</div>
								<div class="tile is-vertical">
									<div class="tile">
										<div
											class="tile is-parent"
											role="button"
											tabindex="0"
											on:click={() => handleContinentSelected('Europe')}
											on:keydown={handleEnterKey}
										>
											<article
												class="clickable-tile tile is-child notification is-warning is-light is-flex is-flex-direction-column is-align-items-center"
											>
												<p class="title">Europe</p>
												<div class="content">
													<i class="fa-solid fa-earth-europe fa-5x"></i>
												</div>
											</article>
										</div>
										<div
											class="tile is-parent"
											role="button"
											tabindex="0"
											on:click={() => handleContinentSelected('Asia')}
											on:keydown={handleEnterKey}
										>
											<article
												class="clickable-tile tile is-child notification is-link is-light is-flex is-flex-direction-column is-align-items-center"
											>
												<p class="title">Asia</p>
												<div class="content">
													<i class="fa-solid fa-earth-asia fa-5x"></i>
												</div>
											</article>
										</div>
									</div>
									<div class="tile">
										<div
											class="tile is-parent"
											role="button"
											tabindex="0"
											on:click={() => handleContinentSelected('Africa')}
											on:keydown={handleEnterKey}
										>
											<article
												class="clickable-tile tile is-child notification is-success is-light is-flex is-flex-direction-column is-align-items-center"
											>
												<p class="title">Africa</p>
												<div class="content">
													<i class="fa-solid fa-earth-africa fa-5x"></i>
												</div>
											</article>
										</div>
										<div
											class="tile is-parent"
											role="button"
											tabindex="0"
											on:click={() => handleContinentSelected('Oceania')}
											on:keydown={handleEnterKey}
										>
											<article
												class="clickable-tile tile is-child notification is-info is-light is-flex is-flex-direction-column is-align-items-center"
											>
												<p class="title">Oceania</p>
												<div class="content">
													<i class="fa-solid fa-earth-oceania fa-5x"></i>
												</div>
											</article>
										</div>
									</div>
								</div>
							</div>
							<div
								class="tile is-parent"
								role="button"
								tabindex="0"
								on:click={() => handleContinentSelected('Antarctica')}
								on:keydown={handleEnterKey}
							>
								<article
									class="clickable-tile tile is-child notification is-light is-flex is-flex-direction-column is-align-items-center"
								>
									<p class="title">Antarctica</p>
								</article>
							</div>
						</div>
					</div>
				</div>

				{#if countries.length > 0 && selectedContinent}
					<section id="country-select">
						<p class="title is-3 is-flex is-justify-content-center mt-4">Please select a country</p>

						<div class="is-flex is-flex-direction-column is-justify-content-center">
							<div class="country-grid">
								{#each countries as country}
									<div
										class="clickable-tile tile is-vertical is-child is-flex is-flex-direction-column is-align-items-center"
										role="button"
										tabindex="0"
										on:click={() => {
											handleCountrySelected(country);
										}}
										on:keydown={handleEnterKey}
									>
										<figure
											class={`tile country-flag image is-128x128 is-flex is-justify-content-center is-align-items-center`}
											data-testid="icon-figure"
										>
											{#if country.iso_2}
												<span class="fi fi-{country.iso_2.toLowerCase()}" />
											{:else}
												<i
													class="no-flag fa-solid fa-flag fa-4x"
													style="color: {chroma.random().css()}"
												/>
											{/if}
										</figure>
										<div class="tile">
											<p>{country.country_name}</p>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</section>
				{/if}
			</div>
		</section>

		<br />

		<section id="manual-search">
			<PublishedDatasets
				bind:datasets
				on:change={handleRefreshDatasets}
				bind:selectedSDGs
				bind:selectedContinents
				bind:selectedCountries
			/>
		</section>
	</div>
	<div hidden={activeTab !== TabNames.MYDATA}>
		{#if data.session}
			<div class="pb-4">
				<DataUploadButton />

				<button class="button is-primary my-2" on:click={handleRefreshIngestingDatasets}>
					<span class="icon">
						<i class="fa-solid fa-rotate" />
					</span>
					<span>Refresh</span>
				</button>
			</div>

			<IngestingDatasets datasets={ingestingDatasets} on:change={handleRefreshIngestingDatasets} />
		{/if}
	</div>
</div>

<section class="hero is-small">
	<div class="hero-body">
		<p class="title is-3 is-flex is-justify-content-center has-text-centered wordwrap">
			No datasets found?
			{#if !data.session}
				Please sign in to your account first,
				<br />
				then please upload your datasets to GeoHub!
			{:else}
				Please upload your datasets to GeoHub!
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

<style lang="scss">
	@import '/node_modules/flag-icons/css/flag-icons.min.css';

	.sdg-grid {
		display: grid;
		grid-auto-columns: auto;
		grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
		grid-gap: 0.8rem;

		@media (max-width: 48em) {
			grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
		}
	}

	.country-grid {
		display: grid;
		grid-auto-columns: auto;
		grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
		grid-gap: 1rem;

		.country-flag {
			width: fit-content;
			margin: auto;
		}

		.fi {
			width: 128px !important;
			line-height: 6em !important;
		}

		.no-flag {
			margin: 0 auto;
		}
	}

	.clickable-tile {
		cursor: pointer;
	}

	.selectable-sdg-card {
		cursor: pointer;
	}
</style>
