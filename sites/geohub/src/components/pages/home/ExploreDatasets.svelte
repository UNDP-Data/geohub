<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import type { Continent, Country } from '$lib/types';
	import { handleEnterKey } from '@undp-data/svelte-undp-components';
	import chroma from 'chroma-js';
	import { onMount } from 'svelte';

	let searchOption: 'SDG' | 'region' | 'manual' = 'manual';

	let selectedContinent: Continent;

	let continents: Continent[] = [];
	let countries: Country[] = [];

	onMount(() => {
		getContinents();
		getCountries();
	});

	const getContinents = async () => {
		const res = await fetch('/api/continents?filterbytag=true');
		const json = (await res.json()) as Continent[];
		continents = json;
		return json;
	};

	const getCountries = async () => {
		const res = await fetch(`/api/countries?filterbytag=true`);
		const json = await res.json();
		countries = json;
		return json as Country[];
	};

	const handleContinentSelected = async (
		continentName: 'Global' | 'Africa' | 'Americas' | 'Antarctica' | 'Asia' | 'Europe' | 'Oceania'
	) => {
		selectedContinent = continents.find((c) => c.continent_name === continentName);

		let targetCountries = countries.filter(
			(c) => c.continent_name === selectedContinent.continent_name
		);

		if (targetCountries.length === 0) {
			goto(`/data?continent=${selectedContinent.continent_name}`);
		} else {
			setTimeout(() => {
				scrollTo('country-select');
			}, 300);
		}
	};

	const scrollTo = (hash: string) => {
		if (browser) {
			const anchor = document.getElementById(hash);
			window.scrollTo({
				top: anchor.offsetTop - 100,
				behavior: 'smooth'
			});
		}
	};
</script>

<div class="grid">
	<div
		class="cell"
		role="button"
		tabindex="0"
		on:click={() => {
			selectedContinent = undefined;
			searchOption = 'SDG';
			setTimeout(() => {
				scrollTo('sdg-search');
			}, 200);
		}}
		on:keydown={handleEnterKey}
	>
		<article
			class="clickable-tile notification is-warning is-light is-flex is-flex-direction-column is-align-items-center"
		>
			<p class="title">Explore by SDG</p>
			<div class="content">
				<img src="/assets/sdgs/SDG Wheel_Transparent_WEB.png" alt="sdgs" width="122" height="122" />
			</div>
		</article>
	</div>
	<div
		class="cell"
		role="button"
		tabindex="0"
		on:click={() => {
			selectedContinent = undefined;
			searchOption = 'region';
			setTimeout(() => {
				scrollTo('country-search');
			}, 200);
		}}
		on:keydown={handleEnterKey}
	>
		<article
			class="clickable-tile notification is-link is-light is-flex is-flex-direction-column is-align-items-center"
		>
			<p class="title">Explore by a region</p>
			<div class="content">
				<i class="fa-solid fa-globe fa-8x"></i>
			</div>
		</article>
	</div>

	<a class="cell" href="/data?type=stac">
		<article
			class="clickable-tile notification is-success is-light is-flex is-flex-direction-column is-align-items-center"
		>
			<p class="title">Explore satellite data</p>
			<div class="content">
				<i class="fa-solid fa-satellite fa-8x"></i>
			</div>
		</article>
	</a>
</div>
<div class="is-flex is-justify-content-center mt-4">
	<a class="button is-link is-uppercase has-text-weight-bold" href="/data">
		<span>Explore manually</span>
	</a>
</div>

{#if searchOption === 'SDG'}
	<section id="sdg-search" class="hero">
		<div class="hero-body">
			<p class="title is-2 is-flex is-flex-direction-column is-align-items-center">Choose a SDG</p>

			<div class="sdg-grid m-2">
				{#each [...Array(17)].map((v, i) => i + 1) as sdg}
					<a class="selectable-sdg-card" href="/data?sdg_goal={sdg}">
						<img src="/assets/sdgs/{sdg}.png" alt="sdg{sdg}" width="128" height="128" />
					</a>
				{/each}
			</div>
		</div>
	</section>
{:else if searchOption === 'region'}
	{@const existAntarctica = continents?.find((c) => c.continent_name === 'Antarctica')}
	<section id="country-search" class="hero">
		<div class="hero-body">
			<p class="title is-3 is-flex is-justify-content-center">Please select a region</p>

			<div class="is-flex is-flex-direction-column is-justify-content-center">
				<div class="fixed-grid has-4-cols">
					<div class="grid">
						<div class="cell is-row-span-{existAntarctica ? 3 : 2}">
							<a href="/data">
								<article
									class="clickable-tile notification is-success is-flex is-flex-direction-column is-align-items-center is-fullheight"
								>
									<p class="title">Global</p>
									<div class="content">
										<i class="fa-solid fa-globe fa-5x"></i>
									</div>
								</article>
							</a>
						</div>
						<div
							class="cell is-row-span-2"
							role="button"
							tabindex="0"
							on:click={() => handleContinentSelected('Americas')}
							on:keydown={handleEnterKey}
						>
							<article
								class="clickable-tile notification is-danger is-light is-flex is-flex-direction-column is-align-items-center is-fullheight"
							>
								<p class="title">Americas</p>
								<div class="content">
									<i class="fa-solid fa-earth-americas fa-5x"></i>
								</div>
							</article>
						</div>
						<div
							class="cell"
							role="button"
							tabindex="0"
							on:click={() => handleContinentSelected('Europe')}
							on:keydown={handleEnterKey}
						>
							<article
								class="clickable-tile notification is-warning is-light is-flex is-flex-direction-column is-align-items-center"
							>
								<p class="title">Europe</p>
								<div class="content">
									<i class="fa-solid fa-earth-europe fa-5x"></i>
								</div>
							</article>
						</div>
						<div
							class="cell"
							role="button"
							tabindex="0"
							on:click={() => handleContinentSelected('Asia')}
							on:keydown={handleEnterKey}
						>
							<article
								class="clickable-tile notification is-link is-light is-flex is-flex-direction-column is-align-items-center"
							>
								<p class="title">Asia</p>
								<div class="content">
									<i class="fa-solid fa-earth-asia fa-5x"></i>
								</div>
							</article>
						</div>
						<div
							class="cell"
							role="button"
							tabindex="0"
							on:click={() => handleContinentSelected('Africa')}
							on:keydown={handleEnterKey}
						>
							<article
								class="clickable-tile notification is-success is-light is-flex is-flex-direction-column is-align-items-center"
							>
								<p class="title">Africa</p>
								<div class="content">
									<i class="fa-solid fa-earth-africa fa-5x"></i>
								</div>
							</article>
						</div>
						<div
							class="cell"
							role="button"
							tabindex="0"
							on:click={() => handleContinentSelected('Oceania')}
							on:keydown={handleEnterKey}
						>
							<article
								class="clickable-tile notification is-info is-light is-flex is-flex-direction-column is-align-items-center"
							>
								<p class="title">Oceania</p>
								<div class="content">
									<i class="fa-solid fa-earth-oceania fa-5x"></i>
								</div>
							</article>
						</div>
						{#if existAntarctica}
							<div
								class="cell is-col-span-3"
								role="button"
								tabindex="0"
								on:click={() => handleContinentSelected('Antarctica')}
								on:keydown={handleEnterKey}
							>
								<article
									class="clickable-tile notification is-light is-flex is-flex-direction-column is-align-items-center"
								>
									<p class="title">Antarctica</p>
								</article>
							</div>
						{/if}
					</div>
				</div>
			</div>

			{#if selectedContinent}
				{@const regionCountries = countries.filter(
					(c) => c.continent_name === selectedContinent.continent_name
				)}
				{#if regionCountries.length > 0}
					<section id="country-select">
						<p class="title is-3 is-flex is-justify-content-center mt-4">Please select a country</p>

						<div class="is-flex is-flex-direction-column is-justify-content-center">
							<div class="country-grid grid">
								{#each regionCountries as country}
									<a
										class="clickable-tile cell is-flex is-flex-direction-column is-align-items-center"
										href="/data?country={country.iso_3}"
									>
										<figure
											class={`country-flag image is-128x128 is-flex is-justify-content-center is-align-items-center`}
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
										<p>{country.country_name}</p>
									</a>
								{/each}
							</div>
						</div>
					</section>
				{/if}
			{/if}
		</div>
	</section>
{/if}

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

	.is-fullheight {
		height: 100%;
	}
</style>
