<script lang="ts">
	import { handleEnterKey } from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher } from 'svelte';
	import StacAssetExplorer from './StacAssetExplorer.svelte';
	import { map } from '$stores';

	const dispatch = createEventDispatcher();

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
		showDialog = false;
	};
</script>

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
	<div class="modal-card">
		<header class="modal-card-head">
			<p class="modal-card-title has-text-weight-bold">Satellite Imagery Explorer</p>
			<button class="delete" aria-label="close" title="Close" on:click={handleCloseDialog} />
		</header>
		<section class="modal-card-body">
			{#if showDialog}
				<div class="explorer">
					<StacAssetExplorer
						{stacId}
						collection={collectionId}
						on:dataAdded={handleDataAdded}
						bind:center
						bind:zoom
					/>
				</div>
			{/if}
		</section>
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
		.modal-card {
			width: 95%;
			cursor: default;
		}
	}
</style>
