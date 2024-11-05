<script lang="ts">
	import { getLayerStyle } from '$lib/helper';
	import type { Layer, VectorTileMetadata } from '$lib/types';
	import { clean, MAPSTORE_CONTEXT_KEY, type MapStore } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher, getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;
	export let propertySelectValue: string;
	export let showOnlyNumberFields = false;

	let propertySelectOptions: string[];

	const dispatch = createEventDispatcher();

	const layerStyle = getLayerStyle($map, layer.id);
	const metadata = layer.info as VectorTileMetadata;
	const tilestatLayer = metadata.json.tilestats.layers.find(
		(l) => l.layer === layerStyle['source-layer']
	);

	onMount(() => {
		setPropertyList();
	});

	function setPropertyList() {
		propertySelectOptions = tilestatLayer.attributes.map((e) => e.attribute);
		if (showOnlyNumberFields) {
			propertySelectOptions = tilestatLayer.attributes.map((el) => {
				if (el['type'] === 'number') {
					return el.attribute;
				}
			});
		}

		propertyChanged();
	}

	const propertyChanged = () => {
		if (!propertySelectValue) return;
		dispatch('select', {
			prop: propertySelectValue
		});
	};

	const handleClick = () => {
		if (!propertySelectValue) return;
		dispatch('click');
	};
</script>

{#if propertySelectOptions}
	<div class="select is-medium" on:change={handleClick}>
		<select bind:value={propertySelectValue}>
			<option value="">Select a property...</option>
			{#each propertySelectOptions as propertySelectOption}
				{@const propertyProps = tilestatLayer?.attributes.find((e) => {
					return e.attribute === propertySelectOption;
				})}
				{#if propertyProps}
					<option value={propertySelectOption}>{clean(propertySelectOption)}</option>
				{/if}
			{/each}
		</select>
	</div>
{/if}
