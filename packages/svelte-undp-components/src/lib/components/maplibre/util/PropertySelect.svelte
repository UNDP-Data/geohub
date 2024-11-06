<script lang="ts">
	import type { VectorLayerMetadata } from '$lib/interfaces/VectorLayerMetadata.js';
	import type { VectorLayerTileStatLayer } from '$lib/interfaces/VectorLayerTileStatLayer.js';
	import type { VectorTileMetadata } from '$lib/interfaces/VectorTileMetadata.js';
	import { clean, MAPSTORE_CONTEXT_KEY, type MapStore } from '@undp-data/svelte-undp-components';
	import type { LayerSpecification, Map } from 'maplibre-gl';
	import { createEventDispatcher, getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let parentId: string | undefined = undefined;
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

	const getLayerProperties = (
		map: Map,
		layerId: string,
		metadata: VectorTileMetadata,
		onlyNumberFields = true
	) => {
		const vectorInfo: VectorLayerMetadata[] = metadata.json.vector_layers;

		const style = map.getStyle();
		const layer = style?.layers?.find((l) => l.id === layerId) as LayerSpecification;

		const vectorLayerMeta: VectorLayerMetadata = JSON.parse(
			JSON.stringify(vectorInfo.find((l) => l.id === layer['source-layer']))
		);

		const tilestats:
			| {
					layerCount: number;
					layers: VectorLayerTileStatLayer[];
			  }
			| undefined = metadata.json?.tilestats;

		if (tilestats) {
			const vectorLayerStats = tilestats.layers.find((l) => l.layer === layer['source-layer']);

			const fields = Object.keys(vectorLayerMeta.fields).filter((key) => {
				// const field = vectorLayerMeta.fields[key];
				const stat = vectorLayerStats?.attributes.find((attr) => attr.attribute === key);
				const type = stat?.type.toLowerCase();
				if (onlyNumberFields === true) {
					return type === 'number';
				} else {
					// not return boolean type
					return type && ['string', 'number'].includes(type);
				}
			});
			vectorLayerStats?.attributes.forEach((attr) => {
				if (!fields.includes(attr.attribute)) {
					delete vectorLayerMeta.fields[attr.attribute];
				}
			});
		}

		return vectorLayerMeta;
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
