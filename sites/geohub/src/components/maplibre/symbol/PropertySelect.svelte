<script lang="ts">
	import { getLayerProperties } from '$lib/helper';
	import type { VectorTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { clean } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher, getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let parentId: string = undefined;
	export let metadata: VectorTileMetadata;
	export let propertySelectValue: string;
	export let showEmptyFields = false;
	export let onlyNumberFields: boolean;
	export let emptyFieldLabel = 'No Label';
	export let readonly = false;

	let propertySelectOptions: string[];

	const dispatch = createEventDispatcher();

	onMount(() => {
		setPropertyList();
	});

	function setPropertyList() {
		const id = parentId ?? layerId;
		const vectorLayerMeta = getLayerProperties($map, id, metadata, onlyNumberFields);
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
	<div class="select is-flex is-justify-content-left select is-normal">
		<select
			style="width: 100%"
			class="is-normal"
			bind:value={propertySelectValue}
			data-testid="property-select-input"
			on:change={propertyChanged}
			title="Property Options"
			disabled={readonly}
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
