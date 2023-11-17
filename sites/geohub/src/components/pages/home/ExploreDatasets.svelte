<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { handleEnterKey } from '$lib/helper';
	import type { Continent, Country } from '$lib/types';
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

<div class="tile is-vertical is-ancestor">
	<div class="tile is-vertical">
		<div class="tile is-full">
			<div
				class="tile is-one-third mr-1"
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
					class=" clickable-tile tile is-child notification is-warning is-light is-flex is-flex-direction-column is-align-items-center"
				>
					<p class="title">Explore by SDG</p>
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
				class="tile is-one-third ml-1"
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
					class="clickable-tile tile is-child notification is-link is-light is-flex is-flex-direction-column is-align-items-center"
				>
					<p class="title">Explore by a region</p>
					<!-- <p class="subtitle">Aligned with the right tile</p>-->
					<div class="content">
						<i class="fa-solid fa-globe fa-8x"></i>
					</div>
				</article>
			</div>

			<a class="tile is-one-third ml-2" href="/data?type=stac">
				<article
					class="clickable-tile tile is-child notification is-success is-light is-flex is-flex-direction-column is-align-items-center"
				>
					<p class="title">Explore satellite data</p>
					<!-- <p class="subtitle">Aligned with the right tile</p>-->
					<div class="content">
						<i class="fa-solid fa-satellite fa-8x"></i>
					</div>
				</article>
			</a>
		</div>
	</div>
	<div class="tile is-flex is-justify-content-center mt-4">
		<a class="button is-large is-link" href="/data">
			<span class="icon">
				<i class="fas fa-search"></i>
			</span>
			<span>Explore manually</span>
		</a>
	</div>
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
	<section id="country-search" class="hero">
		<div class="hero-body">
			<p class="title is-3 is-flex is-justify-content-center">Please select a region</p>

			<div class="is-flex is-flex-direction-column is-justify-content-center">
				<div class="tile is-ancestor">
					<div class="tile is-2">
						<a class="tile is-parent" href="/data">
							<article
								class="clickable-tile tile is-child notification is-success is-flex is-flex-direction-column is-align-items-center"
							>
								<p class="title">Global</p>
								<div class="content">
									<i class="fa-solid fa-globe fa-5x"></i>
								</div>
							</article>
						</a>
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

			{#if selectedContinent}
				{@const regionCountries = countries.filter(
					(c) => c.continent_name === selectedContinent.continent_name
				)}
				{#if regionCountries.length > 0}
					<section id="country-select">
						<p class="title is-3 is-flex is-justify-content-center mt-4">Please select a country</p>

						<div class="is-flex is-flex-direction-column is-justify-content-center">
							<div class="country-grid">
								{#each regionCountries as country}
									<a
										class="clickable-tile tile is-vertical is-child is-flex is-flex-direction-column is-align-items-center"
										href="/data?country={country.iso_3}"
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
