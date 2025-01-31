<script lang="ts" module>
	export interface Country {
		iso_3: string;
		iso_code: number;
		iso_2?: string;
		country_name: string;
		region_code: number;
		region_name: string;
		continent_code: number;
		continent_name: string;
	}
</script>

<script lang="ts">
	import { handleEnterKey } from '$lib/util/handleEnterKey.js';
	import { initTippy } from '$lib/util/initTippy.js';
	import { Chips } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { onMount } from 'svelte';
	import Notification from './Notification.svelte';

	interface Props {
		selected?: string[];
		showOnlyExists?: boolean;
		geohubOrigin?: string;
		placeholder?: string;
		continents?: number[];
		regions?: number[];
		showSelectedCountries?: boolean;
		onselect?: (countries: Country[]) => void;
	}

	let {
		selected = $bindable([]),
		showOnlyExists = $bindable(false),
		geohubOrigin = $bindable(''),
		placeholder = $bindable('Type country name or ISO code'),
		continents = $bindable([]),
		regions = $bindable([]),
		showSelectedCountries = $bindable(true),
		onselect = () => {}
	}: Props = $props();

	let query = $state('');

	let isLoading = $state(false);
	let tippy = initTippy({
		appendTo: document.body,
		maxWidth: 500,
		placement: 'bottom-start',
		trigger: 'mounseenter focus click',
		arrow: false,
		offset: [0, 0]
	});
	let tooltipContent: HTMLElement | undefined = $state();

	let countries: Country[] = [];
	let countriesFiltered: Country[] = $state([]);

	const handleInput = debounce(() => {
		const regionFiltered = applyContinentRegionFilter(countries);
		if (query.length > 0) {
			countriesFiltered = [
				...regionFiltered.filter(
					(t) =>
						t.country_name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
						t.iso_3.toLowerCase().indexOf(query.toLowerCase()) !== -1
				)
			];
		} else {
			countriesFiltered = [...regionFiltered];
		}
	}, 300);

	const getCountryMaster = async () => {
		isLoading = true;
		const res = await fetch(
			`${geohubOrigin}/api/countries${showOnlyExists ? '?filterbytag=true' : ''}`
		);
		const json = await res.json();
		countries = json;
		countriesFiltered = applyContinentRegionFilter(countries);
		isLoading = false;
		return countries;
	};

	const applyContinentRegionFilter = (data: Country[]) => {
		if (regions.length > 0) {
			return data.filter((c) => regions.includes(c.region_code));
		} else if (continents.length > 0) {
			return data.filter((c) => continents.includes(c.continent_code));
		} else {
			return data;
		}
	};

	const handleCountrySelected = (country: Country) => {
		if (selected.includes(country.iso_3)) {
			selected = selected.filter((n) => n !== country.iso_3);
		} else {
			selected = [...selected, country.iso_3];
		}
		dispatchEvent();
	};

	const handleDeleteCountry = (iso3: string) => {
		selected = selected.filter((n) => n !== iso3);
		dispatchEvent();
	};

	const dispatchEvent = () => {
		const filtered = countries.filter((c) => selected.includes(c.iso_3));
		if (onselect) onselect(filtered);
	};

	onMount(() => {
		getCountryMaster();
	});
</script>

<div class="control has-icons-left has-icons-right {isLoading ? 'is-loading' : ''}">
	<input
		class="input"
		type="text"
		bind:value={query}
		disabled={isLoading}
		placeholder={selected.length === 0
			? placeholder
			: `${selected.length} ${selected.length === 1 ? 'country is' : 'countries are'} selected`}
		oninput={handleInput}
		onkeydown={handleEnterKey}
		use:tippy={{ content: tooltipContent }}
	/>
	<span class="icon is-small is-left">
		<span class="material-symbols-outlined"> search </span>
	</span>
</div>

<div bind:this={tooltipContent} class="country-tooltip">
	{#if showSelectedCountries && selected.length > 0}
		<div class="selected-area fixed-grid has-3-cols p-2">
			<div class="grid">
				{#each selected as iso3}
					<div class="cell">
						<Chips
							label={iso3}
							showDelete={true}
							ondelete={() => {
								handleDeleteCountry(iso3);
							}}
						/>
					</div>
				{/each}
			</div>
		</div>
	{/if}
	<div class="country-content">
		{#if countriesFiltered.length === 0}
			<Notification type="info" showCloseButton={false}>No country found</Notification>
		{:else}
			{#each countriesFiltered as country}
				{@const isSelected = selected.includes(country.iso_3)}
				<div class="country-item p-1 px-2">
					<label class="checkbox is-flex is-align-items-center">
						<span class="wrap-text country-label p-3">
							{country.country_name}
						</span>

						<input
							class="ml-auto"
							type="checkbox"
							checked={isSelected}
							onchange={() => {
								handleCountrySelected(country);
							}}
						/>
					</label>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style lang="scss">
	.country-content {
		max-height: 300px;
		overflow-y: auto;

		.country-item {
			border-bottom: 1px solid #d4d6d8;
			&:last-child {
				border-bottom: none;
			}

			:hover {
				background-color: #f7f7f7;
			}

			.country-label {
				width: 80%;
			}

			input[type='checkbox'] {
				-webkit-appearance: none;
				-moz-appearance: none;
				appearance: none;
				width: 16px;
				height: 16px;
				border: 2px solid #d12800;
				border-radius: 0;

				&:checked {
					background-color: white;
					border-color: #d12800;

					&::before {
						content: '';
						display: block;
						width: 5px;
						height: 10px;
						border: solid #d12800;
						border-width: 0 2px 2px 0;
						transform: rotate(45deg);
						margin: 0px 4px;
					}
				}
			}
		}
	}

	.selected-area {
		max-height: 120px;
		overflow-y: auto;
	}

	.wrap-text {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		word-break: break-all;
	}

	.country-tooltip {
		z-index: 10;
		min-width: 300px;
		max-width: 350px;
	}
</style>
