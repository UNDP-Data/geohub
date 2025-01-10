<script lang="ts">
	import RasterAlgorithmExplorer, {
		type AlgorithmLayerSpec
	} from '$components/pages/map/data/RasterAlgorithmExplorer.svelte';
	import type { DatasetFeature } from '$lib/types';
	import { handleEnterKey, initTooltipTippy } from '@undp-data/svelte-undp-components';

	const tippyTooltip = initTooltipTippy();

	let innerHeight: number = $state(0);

	interface Props {
		feature: DatasetFeature;
		isIconButton?: boolean;
		title?: string;
		showDialog?: boolean;
		onadd?: (layerSpec: AlgorithmLayerSpec) => void;
	}

	let {
		feature = $bindable(),
		isIconButton = $bindable(false),
		title = 'Explore tools',
		showDialog = $bindable(false),
		onadd = (layerSpec) => {
			console.log(layerSpec);
		}
	}: Props = $props();

	const handleClicked = () => {
		showDialog = true;
	};

	const handleCloseDialog = () => {
		showDialog = false;
	};

	const handleAlgorithmSelected = (e: { detail: AlgorithmLayerSpec }) => {
		let layerSpec: AlgorithmLayerSpec = e.detail;
		onadd(layerSpec);
	};
</script>

<svelte:window bind:innerHeight />

{#if isIconButton}
	<span
		class="button-icon icon is-small has-text-grey-dark mr-2"
		role="button"
		tabindex="0"
		onkeydown={handleEnterKey}
		onclick={handleClicked}
		use:tippyTooltip={{ content: 'Explore tools for advanced analytics' }}
	>
		<i class="fa-solid fa-screwdriver-wrench"></i>
	</span>
{:else}
	<button
		class="button is-link has-text-weight-bold is-uppercase is-fullwidth"
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
