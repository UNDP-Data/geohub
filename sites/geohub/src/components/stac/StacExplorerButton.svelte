<script lang="ts">
	import { handleEnterKey } from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher, getContext } from 'svelte';
	import StacAssetExplorer from './StacAssetExplorer.svelte';
	import { map } from '$stores';
	import type { Writable } from 'svelte/store';

	const dispatch = createEventDispatcher();

	let headerHeight: Writable<number> = getContext('header-height');
	let innerHeight: number;

	$: mapHeight = innerHeight - $headerHeight;

	export let feature: DatasetFeature;

	const stacId = feature.properties.tags.find((t) => t.key === 'stac')?.value;
	const collectionId = feature.properties.tags.find((t) => t.key === 'collection')?.value;
	let showDialog = false;

	export let isIconButton = false;
	export let title = 'Explore satellite data';
	export let isLoading = false;

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
		setTimeout(() => {
			showDialog = false;
		}, 500);
	};
</script>

<svelte:window bind:innerHeight />

{#if isIconButton}
	{#if isLoading}
		<div class="loader-container">
			<Loader size="small" />
		</div>
	{:else}
		<span
			class="button-icon fa-stack fa-xl"
			role="button"
			tabindex="0"
			on:keydown={handleEnterKey}
			on:click={handleClicked}
		>
			<i class="fa-solid fa-globe fa-stack-xl" />
			<i class="fab fa-plus fa-sm fa-stack-1x" />
		</span>
	{/if}
{:else}
	<button
		class="button is-primary is-fullwidth {isLoading ? 'is-loading' : ''}"
		on:click={handleClicked}
	>
		<span class="icon">
			<i class="fa-solid fa-globe fa-lg" />
		</span>
		<span>{title}</span>
	</button>
{/if}

<div class="modal {showDialog ? 'is-active' : ''}">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<div class="modal-background" role="dialog" on:click={handleCloseDialog}></div>
	<div class="modal-content p-2">
		{#if showDialog}
			<div class="explorer">
				<StacAssetExplorer
					{stacId}
					collection={collectionId}
					on:dataAdded={handleDataAdded}
					bind:center
					bind:zoom
					bind:height={mapHeight}
				/>
			</div>
		{/if}
	</div>
	<button class="modal-close is-large" aria-label="close" on:click={handleCloseDialog}></button>
</div>

<style lang="scss">
	.button-icon {
		width: 30px;
		height: 30px;
		.fa-stack-1x {
			width: auto;
			height: auto;
			top: -13px;
			right: -10px;
			color: d12800;
		}
		color: #d12800;
	}
	.loader-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}

	.modal {
		z-index: 99;
		.modal-content {
			width: 95%;
			background-color: white;
			cursor: default;
		}
	}
</style>
