<script lang="ts">
	import StacApiExplorer from '$components/util/stac/StacApiExplorer.svelte';
	import StacCatalogExplorer from '$components/util/stac/StacCatalogExplorer.svelte';
	import type { DatasetFeature } from '$lib/types';
	import {
		HEADER_HEIGHT_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type HeaderHeightStore,
		type MapStore
	} from '$stores';
	import { handleEnterKey, initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher, getContext } from 'svelte';

	const tippyTooltip = initTooltipTippy();

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	const dispatch = createEventDispatcher();

	let headerHeightStore: HeaderHeightStore = getContext(HEADER_HEIGHT_CONTEXT_KEY);
	let innerHeight: number;

	$: mapHeight = innerHeight - $headerHeightStore;

	export let feature: DatasetFeature;

	const stacId = feature.properties.tags.find((t) => t.key === 'stac')?.value;
	const collectionId = feature.properties.tags.find((t) => t.key === 'collection')?.value;
	const isCatalog =
		feature.properties.tags.find((t) => t.key === 'stacApiType')?.value === 'catalog';

	export let isIconButton = false;
	export let title = 'Explore satellite data';
	export let showDialog = false;

	let center = [0, 0];
	let zoom = 0;

	const handleClicked = () => {
		const { lng, lat } = $map.getCenter();
		center = [lng, lat];
		zoom = $map.getZoom();

		showDialog = true;
	};

	const handleCloseDialog = () => {
		showDialog = false;
	};

	const handleDataAdded = (e) => {
		dispatch('clicked', {
			layers: e.detail.layers
		});
	};
</script>

<svelte:window bind:innerHeight />

{#if isIconButton}
	<span
		class="button-icon has-text-grey-dark fa-stack"
		role="button"
		tabindex="0"
		on:keydown={handleEnterKey}
		on:click={handleClicked}
		use:tippyTooltip={{ content: 'Explore satellite data' }}
	>
		<i class="fa-solid fa-globe fa-stack-xl" />
		<i class="fab fa-plus fa-sm fa-stack-1x" />
	</span>
{:else}
	<button
		class="button is-primary has-text-weight-bold is-uppercase is-fullwidth"
		on:click={handleClicked}
	>
		{title}
	</button>
{/if}

<div class="modal {showDialog ? 'is-active' : ''}">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<div class="modal-background" role="dialog" on:click={handleCloseDialog}></div>
	<div class="modal-content p-2">
		<button class="delete is-large" aria-label="close" on:click={handleCloseDialog}></button>

		{#if showDialog}
			<div class="explorer">
				{#if isCatalog}
					<StacCatalogExplorer {stacId} bind:dataset={feature} on:dataAdded={handleDataAdded} />
				{:else}
					<StacApiExplorer
						{stacId}
						bind:dataset={feature}
						collection={collectionId}
						on:dataAdded={handleDataAdded}
						bind:center
						bind:zoom
						bind:height={mapHeight}
					/>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.button-icon {
		width: 24px;
		height: 16px;
		cursor: pointer;

		.fa-stack-xl {
			position: absolute;
			top: 0px;
			bottom: 0px;
		}

		.fa-stack-1x {
			width: auto;
			top: -16px;
			right: -16px;
		}
	}

	.modal {
		z-index: 99;

		.modal-background {
			cursor: pointer;
		}

		.modal-content {
			width: 95%;
			background-color: white;
			cursor: default;

			.delete {
				position: absolute;
				top: 1rem;
				right: 1rem;
				z-index: 100;
			}
		}
	}
</style>
