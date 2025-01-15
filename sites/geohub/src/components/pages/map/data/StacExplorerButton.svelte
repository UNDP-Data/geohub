<script lang="ts">
	import StacApiExplorer from '$components/util/stac/StacApiExplorer.svelte';
	import StacCatalogExplorer from '$components/util/stac/StacCatalogExplorer.svelte';
	import type { DatasetFeature, StacDataLayer } from '$lib/types';
	import { HEADER_HEIGHT_CONTEXT_KEY, type HeaderHeightStore } from '$stores';
	import {
		handleEnterKey,
		initTooltipTippy,
		MAPSTORE_CONTEXT_KEY,
		type MapStore
	} from '@undp-data/svelte-undp-components';
	import { getContext } from 'svelte';

	interface Props {
		feature: DatasetFeature;
		isIconButton?: boolean;
		title?: string;
		showDialog?: boolean;
		onclick?: (layers: StacDataLayer[]) => void;
	}

	let {
		feature = $bindable(),
		isIconButton = false,
		title = 'Explore satellite data',
		showDialog = $bindable(false),
		onclick = (layers) => {
			console.log(layers);
		}
	}: Props = $props();

	const tippyTooltip = initTooltipTippy();
	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	let headerHeightStore: HeaderHeightStore = getContext(HEADER_HEIGHT_CONTEXT_KEY);
	let innerHeight: number = $state(0);
	let mapHeight = $derived(innerHeight - $headerHeightStore);

	const stacId = feature.properties.tags?.find((t) => t.key === 'stac')?.value as string;
	const collectionId = feature.properties.tags?.find((t) => t.key === 'collection')
		?.value as string;
	const isCatalog =
		feature.properties.tags?.find((t) => t.key === 'stacApiType')?.value === 'catalog';

	let center = $state([0, 0]);
	let zoom = $state(0);

	const handleClicked = () => {
		const { lng, lat } = $map.getCenter();
		center = [lng, lat];
		zoom = $map.getZoom();

		showDialog = true;
	};

	const handleCloseDialog = () => {
		showDialog = false;
	};

	const handleDataAdded = (layers: StacDataLayer[]) => {
		if (onclick) onclick(layers);
	};
</script>

<svelte:window bind:innerHeight />

{#if isIconButton}
	<span
		class="button-icon has-text-grey-dark fa-stack"
		role="button"
		tabindex="0"
		onkeydown={handleEnterKey}
		onclick={handleClicked}
		use:tippyTooltip={{ content: 'Explore satellite data' }}
	>
		<i class="fa-solid fa-globe fa-stack-xl"></i>
		<i class="fab fa-plus fa-sm fa-stack-1x"></i>
	</span>
{:else}
	<button
		class="button is-primary has-text-weight-bold is-uppercase is-fullwidth"
		onclick={handleClicked}
	>
		{title}
	</button>
{/if}

<div class="modal {showDialog ? 'is-active' : ''}">
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="modal-background" role="dialog" onclick={handleCloseDialog}></div>
	<div class="modal-content p-2">
		<button class="delete is-large" aria-label="close" onclick={handleCloseDialog}></button>

		{#if showDialog}
			<div class="explorer">
				{#if isCatalog}
					<StacCatalogExplorer {stacId} bind:dataset={feature} onDataAdded={handleDataAdded} />
				{:else}
					<StacApiExplorer
						{stacId}
						bind:dataset={feature}
						collection={collectionId}
						onDataAdded={handleDataAdded}
						bind:center
						bind:zoom
						height={mapHeight}
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
