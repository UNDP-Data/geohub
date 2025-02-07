<script lang="ts">
	import type { VectorLayerMetadata } from '$lib/interfaces/VectorLayerMetadata';
	import type { VectorLayerTileStatLayer } from '$lib/interfaces/VectorLayerTileStatLayer';
	import type { VectorTileMetadata } from '$lib/interfaces/VectorTileMetadata';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores';
	import { clean } from '$lib/util/clean';
	import type { LayerSpecification, Map } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
		parentId?: string | undefined;
		metadata: VectorTileMetadata;
		propertySelectValue: string;
		showEmptyFields?: boolean;
		onlyNumberFields: boolean;
		emptyFieldLabel?: string;
		readonly?: boolean;
		onselect?: (property: string) => void;
	}

	let {
		layerId = $bindable(),
		parentId = $bindable(undefined),
		metadata = $bindable(),
		propertySelectValue = $bindable(),
		showEmptyFields = $bindable(false),
		onlyNumberFields = $bindable(),
		emptyFieldLabel = $bindable('No Label'),
		readonly = $bindable(false),
		onselect = () => {}
	}: Props = $props();

	let propertySelectOptions: string[] = $state();

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
		if (onselect) onselect(propertySelectValue);
	};

	const getLayerProperties = (
		map: Map,
		layerId: string,
		metadata: VectorTileMetadata,
		onlyNumberFields = true
	) => {
		if (!map || !metadata) return;
		const vectorInfo: VectorLayerMetadata[] = metadata.json?.vector_layers as VectorLayerMetadata[];
		if (!vectorInfo) return;
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
			onchange={propertyChanged}
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
		<i style="color:black" class="fas fa-table-list"></i>
	</span>
</div>
