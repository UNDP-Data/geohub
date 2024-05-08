<script lang="ts">
	import { getLayerStyle } from '$lib/helper';
	import type { Layer, VectorTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { clean } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher, getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;
	export let propertySelectValue: string;
	export let showOnlyNumberFields = false;
	export let inLegend = false;
	let propertySelectOptions: string[];

	const dispatch = createEventDispatcher();

	const layerStyle = getLayerStyle($map, layer.id);
	const metadata = layer.info as VectorTileMetadata;
	const tilestatLayer = metadata.json.tilestats.layers.find(
		(l) => l.layer === layerStyle['source-layer']
	);

	onMount(() => {
		inLegend && !propertySelectOptions ? setPropertyList() : null;
		!inLegend ? setPropertyList() : null;
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
		dispatch('select', {
			prop: propertySelectValue
		});
	};

	const handleClick = () => {
		if (propertySelectValue === '') return;
		dispatch('click');
	};

	$: propertySelectValue, propertyChanged();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="grid-wrapper"
	role="menu"
	data-testid="property-select-buttons"
	tabindex="0"
	on:click={handleClick}
>
	{#if propertySelectOptions}
		{#each propertySelectOptions as propertySelectOption}
			{@const propertyProps = tilestatLayer.attributes.find((e) => {
				return e.attribute === propertySelectOption;
			})}

			<div
				class="grid-item card m-10 is-clickable has-text-centered"
				role="button"
				tabindex="0"
				on:click={() => {
					propertySelectValue = propertySelectOption;
					handleClick;
				}}
				title={propertyProps['type'] === 'string'
					? `${clean(propertySelectOption)}, text property`
					: ` ${clean(propertySelectOption)}, numeric property`}
			>
				<div
					class="card-header is-size-6 pb-0 pt-0 m-0 {propertySelectValue === propertySelectOption
						? 'has-background-success'
						: 'has-background-info'} "
				>
					<span
						class="card-header-title grid-item is-centered is-v-centered {propertySelectValue ===
						propertySelectOption
							? 'has-text-white-ter'
							: 'has-text-white-ter'}  "
					>
						{#if propertySelectOption === propertySelectValue}
							<span class="icon">
								<i class="fa-solid fa-check" />
							</span>
						{/if}
						{clean(propertySelectOption)}
					</span>
				</div>
				<div class="content">
					{#if propertyProps.type === 'string'}
						<span class="box has-text-danger-dark is-size-7 has-text-weight-bold">
							<i class="fa-solid fa-a" />...<i class="fa-solid fa-z" />
						</span>
					{:else}
						<span class="box has-text-danger-dark is-size-7 has-text-weight-bold">
							<i class="fa-solid fa-1" />...<i class="fa-solid fa-9" />
						</span>
					{/if}
				</div>
			</div>
		{/each}
	{/if}
</div>

<style lang="scss">
	.grid-wrapper {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 5px;
	}
	.grid-item {
		display: inline-block;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		margin-bottom: 0;

		.box {
			border-radius: 0;
		}
	}
</style>
