<script lang="ts">
	import { clean, getLayerProperties } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { createEventDispatcher, getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;
	export let propertySelectValue: string;
	export let showEmptyFields = false;
	export let inLegend: boolean;
	export let emptyFieldLabel = 'No Label';

	let propertySelectOptions: string[];

	const dispatch = createEventDispatcher();

	onMount(() => {
		setPropertyList();
	});

	function setPropertyList() {
		const vectorLayerMeta = getLayerProperties($map, layer, inLegend);
		propertySelectOptions = Object.keys(vectorLayerMeta.fields);
		if (showEmptyFields === true) {
			propertySelectOptions = ['', ...propertySelectOptions];
		}
	}

	const propertyChanged = () => {
		dispatch('select', {
			prop: propertySelectValue
		});
	};
</script>

<div class="control has-icons-left" data-testid="property-select">
	<div style="margin-right: 2%" class="select is-flex is-justify-content-left select is-normal">
		<select
			style="width: 100%"
			class="is-normal"
			bind:value={propertySelectValue}
			data-testid="property-select-input"
			on:change={propertyChanged}
			title="Property Options"
		>
			{#if propertySelectOptions}
				{#each propertySelectOptions as propertySelectOption}
					<option
						title="Property Option"
						data-testid="property-select-option"
						value={propertySelectOption}
						>{!propertySelectOption ? emptyFieldLabel : clean(propertySelectOption)}</option
					>
				{/each}
			{/if}
		</select>
	</div>
	<span class="icon is-small is-left">
		<i style="color:black" class="fas fa-table-list" />
	</span>
</div>
