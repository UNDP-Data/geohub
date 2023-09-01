<script lang="ts">
	import { page } from '$app/stores';
	import Notification from '$components/controls/Notification.svelte';
	import { handleEnterKey, initTippy } from '$lib/helper';
	import type { Continent, Country, Region, Tag } from '$lib/types';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { createEventDispatcher } from 'svelte';
	import CountryCard from './CountryCard.svelte';

	const dispatch = createEventDispatcher();

	const tippy = initTippy();
	let tooltipContent: HTMLElement;

	export let tags: Tag[];
	export let selectedContinents: Continent[];
	export let selectedRegions: Region[];
	let selectedCountries: Country[];
	let query = '';

	let countriesMaster: Country[] = [];

	$: selectedContinents, handleRegionChanged();
	$: selectedRegions, handleRegionChanged();

	const handleRegionChanged = () => {
		countries = getCountries(selectedContinents, selectedRegions);
	};

	const getCountries = async (continents: Continent[], regions: Region[]) => {
		if (countriesMaster.length === 0) {
			const promise = $page.data.promises.countries;
			countriesMaster = (await promise) as Country[];

			tags?.forEach((t) => {
				if (t.key === 'country') {
					const country = countriesMaster.find((c) => c.iso_3 === t.value);
					if (country) {
						if (!selectedCountries) {
							selectedCountries = [];
						}
						if (!selectedCountries?.find((c) => c.iso_3 === t.value)) {
							selectedCountries = [...selectedCountries, country];
						}
					}
				}
			});
		}

		let filtered = countriesMaster;
		if (regions.length > 0) {
			filtered = filtered.filter(
				(c) => regions.filter((r) => r.region_code === c.region_code).length > 0
			);
		} else if (continents.length > 0) {
			filtered = filtered.filter(
				(c) => continents.filter((a) => a.continent_code === c.continent_code).length > 0
			);
		}
		return filtered;
	};

	let countries: Promise<Country[]> = getCountries(selectedContinents, selectedRegions);

	$: query, handleSearch();
	const handleSearch = debounce(async () => {
		if (countriesMaster.length === 0) return;
		let filtered = await getCountries(selectedContinents, selectedRegions);
		if (query.length > 0) {
			filtered = filtered.filter(
				(t) => t.country_name.toLowerCase().indexOf(query.toLowerCase()) !== -1
			);
		}
		countries = new Promise<Country[]>((resolve) => {
			resolve(filtered);
		});
	}, 300);

	const handleCountrySelected = (e) => {
		const country = e.detail.country;
		const isSelected = e.detail.isSelected;
		if (!selectedCountries) {
			selectedCountries = [];
		}
		if (isSelected) {
			selectedCountries.push(country);
		} else {
			const index = selectedCountries.indexOf(country);
			if (index > -1) {
				selectedCountries.splice(index, 1);
			}
		}
		selectedCountries = [...selectedCountries];
		dispatch('change', {
			countries: selectedCountries
		});
	};
</script>

<div class="country-selected is-flex is-align-content-center">
	<div class="country-select-button pr-2" use:tippy={{ content: tooltipContent }}>
		<div class="box p-2">
			<span class="icon is-large">
				<i class="fa-solid fa-magnifying-glass fa-2xl" />
			</span>
		</div>
	</div>

	<div class="tooltip p-2" data-testid="tooltip" bind:this={tooltipContent}>
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Countries</label>
			<p class="control has-icons-left pb-2">
				<input class="input" type="text" placeholder="Type a country name" bind:value={query} />
				<span class="icon is-left">
					<i class="fas fa-search" aria-hidden="true" />
				</span>
				{#if query.length > 0}
					<span
						class="clear-button"
						role="button"
						tabindex="0"
						on:click={() => (query = '')}
						on:keydown={handleEnterKey}
					>
						<i class="fas fa-xmark sm" />
					</span>
				{/if}
			</p>
			<div class="country-list control">
				{#await countries}
					<Loader size="small" />
				{:then rows}
					{#if rows && rows.length > 0}
						<div class="country-list-grid p-1">
							{#each rows as country}
								<CountryCard
									bind:country
									isSelected={selectedCountries?.find((c) => c.iso_3 === country.iso_3)
										? true
										: false}
									on:countrySelected={handleCountrySelected}
								/>
							{/each}
						</div>
					{:else}
						<Notification type="info" showCloseButton={false}>
							No country found. Try another name.
						</Notification>
					{/if}
				{/await}
			</div>
		</div>
	</div>

	{#if selectedCountries}
		<div class="is-flex is-flex-wrap-wrap">
			{#each selectedCountries as country}
				<div class="p-1">
					<CountryCard
						bind:country
						isSelectable={false}
						on:countrySelected={handleCountrySelected}
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

	.country-select-button {
		width: fit-content;
		cursor: pointer;
	}

	.tooltip {
		max-width: 350px;

		.clear-button {
			position: absolute;
			top: 0.6rem;
			right: 0.8rem;
			cursor: pointer;
			color: gray;
		}

		.country-list {
			max-height: 200px;
			overflow-y: auto;
		}

		.country-list-grid {
			display: grid;
			grid-gap: 5px;
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
