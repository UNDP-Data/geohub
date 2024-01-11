<script lang="ts">
	import Notification from '$components/util/Notification.svelte';
	import { handleEnterKey, initTippy, initTooltipTippy } from '$lib/helper';
	import type { Continent, Country, Region, Tag } from '$lib/types';
	import { debounce } from 'lodash-es';
	import { createEventDispatcher, onMount } from 'svelte';
	import CountryCard from './CountryCard.svelte';

	const dispatch = createEventDispatcher();

	const tippy = initTippy();
	let tooltipContent: HTMLElement;

	const tippyTooltip = initTooltipTippy();

	export let tags: Tag[];
	export let selectedContinents: Continent[] = [];
	export let selectedRegions: Region[] = [];
	export let showSelectedCountries = false;
	export let showOnlyExists = false;
	export let buttonIcon = 'fa-solid fa-magnifying-glass fa-xl';
	export let disabled = false;
	let selectedCountries: Country[];
	let query = '';

	let countriesMaster: Country[] = [];
	let countries: Country[] = [];

	$: selectedContinents, handleRegionChanged();
	$: selectedRegions, handleRegionChanged();

	onMount(() => {
		getCountryMaster();
	});

	const getCountryMaster = async () => {
		const res = await fetch(`/api/countries${showOnlyExists ? '?filterbytag=true' : ''}`);
		const json = await res.json();
		countriesMaster = json;

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

		countries = getCountries(selectedContinents, selectedRegions);

		return countriesMaster;
	};

	const handleRegionChanged = () => {
		countries = getCountries(selectedContinents, selectedRegions);
	};

	const getCountries = (continents: Continent[], regions: Region[]) => {
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

	$: query, handleSearch();
	const handleSearch = debounce(() => {
		if (!countriesMaster) return;
		if (countriesMaster.length === 0) return;
		let filtered = getCountries(selectedContinents, selectedRegions);
		if (query.length > 0) {
			filtered = filtered.filter(
				(t) => t.country_name.toLowerCase().indexOf(query.toLowerCase()) !== -1
			);
		}
		countries = filtered;
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

<button
	type="button"
	class="button"
	use:tippy={{ content: tooltipContent }}
	{disabled}
	use:tippyTooltip={{ content: 'Filter by countries' }}
>
	<span class="icon">
		<i class={buttonIcon} />
	</span>
</button>

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
			{#if countries && countries.length > 0}
				<div class="country-list-grid p-1">
					{#each countries as country}
						<CountryCard
							bind:country
							isSelected={selectedCountries?.find((c) => c.iso_3 === country.iso_3) ? true : false}
							on:countrySelected={handleCountrySelected}
						/>
					{/each}
				</div>
			{:else}
				<Notification type="info" showCloseButton={false}>
					No country found. Try another name.
				</Notification>
			{/if}
		</div>
	</div>
</div>

{#if showSelectedCountries && selectedCountries}
	<div class="is-flex is-flex-wrap-wrap">
		{#each selectedCountries as country}
			<div class="p-1">
				<CountryCard bind:country isSelectable={false} on:countrySelected={handleCountrySelected} />
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

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
