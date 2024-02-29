<script lang="ts">
	import RasterAlgorithmExplorer, {
		type AlgorithmLayerSpec
	} from '$components/maplibre/raster/RasterAlgorithmExplorer.svelte';
	import { handleEnterKey, initTooltipTippy } from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const tippyTooltip = initTooltipTippy();

	let innerHeight: number;

	export let feature: DatasetFeature;

	export let isIconButton = false;
	export let title = 'Explore tools';
	export let showDialog = false;

	const handleClicked = () => {
		showDialog = true;
	};

	const handleCloseDialog = () => {
		showDialog = false;
	};

	const handleAlgorithmSelected = (e) => {
		let layerSpec: AlgorithmLayerSpec = e.detail;
		dispatch('added', layerSpec);
	};
</script>

<svelte:window bind:innerHeight />

{#if isIconButton}
	<span
		class="button-icon icon is-small has-text-grey-dark mr-2"
		role="button"
		tabindex="0"
		on:keydown={handleEnterKey}
		on:click={handleClicked}
		use:tippyTooltip={{ content: 'Explore tools for advanced analytics' }}
	>
		<i class="fa-solid fa-screwdriver-wrench"></i>
	</span>
{:else}
	<button
		class="button is-link has-text-weight-bold is-uppercase is-fullwidth"
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
			<div class="p-4">
				<RasterAlgorithmExplorer bind:feature on:added={handleAlgorithmSelected} />
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.button-icon {
		cursor: pointer;
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
