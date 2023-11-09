<script lang="ts">
	import LayerHeader from '$components/pages/map/layers/header/LayerHeader.svelte';
	import { getLayerStyle, handleEnterKey, initTippy } from '$lib/helper';
	import type { Layer, RasterTileMetadata, VectorTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import type { LngLatBoundsLike } from 'maplibre-gl';
	import { getContext } from 'svelte';
	import DataCardInfoMenu from './header/DataCardInfoMenu.svelte';
	import DeleteMenu from './header/DeleteMenu.svelte';
	import HistogramMenu from './header/HistogramMenu.svelte';
	import VisibilityButton from './header/VisibilityButton.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;

	let isContentVisible = true;
	let isDeleteDialogVisible = false;

	let is_raster = layer.dataset.properties.is_raster;

	const tippy = initTippy({
		placement: 'bottom-end',
		arrow: false,
		theme: 'transparent',
		offset: [10, 0],
		onShow(instance) {
			instance.popper.querySelector('.close')?.addEventListener('click', () => {
				instance.hide();
			});
		},
		onHide(instance) {
			instance.popper.querySelector('.close')?.removeEventListener('click', () => {
				instance.hide();
			});
		}
	});
	let tooltipContent: HTMLElement;

	const handleZoomToLayer = () => {
		clickMenuButton();
		let bounds: LngLatBoundsLike;
		const layerStyle = getLayerStyle($map, layer.id);
		if (layerStyle.type === 'raster') {
			const metadata: RasterTileMetadata = layer.info as RasterTileMetadata;
			bounds = [
				[Number(metadata.bounds[0]), Number(metadata.bounds[1])],
				[Number(metadata.bounds[2]), Number(metadata.bounds[3])]
			];
		} else {
			const metadata: VectorTileMetadata = layer.info as VectorTileMetadata;
			const boundsArray = metadata.bounds.split(',');
			bounds = [
				[Number(boundsArray[0]), Number(boundsArray[1])],
				[Number(boundsArray[2]), Number(boundsArray[3])]
			];
		}
		$map.fitBounds(bounds);
	};

	const clickMenuButton = () => {
		const buttons = document.getElementsByClassName(`menu-button-${layer.id}`);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const button: HTMLButtonElement = buttons[0];
		button.click();
	};
</script>

<article class="border is-small mb-2">
	<div
		class="message-header has-background-white has-text-dark {isContentVisible ? 'underline' : ''}"
	>
		<LayerHeader {layer} bind:isVisible={isContentVisible} />

		<div class="is-flex is-align-items-center">
			<VisibilityButton {layer} />

			<div class="dropdown-trigger">
				<button
					class="button menu-button menu-button-{layer.id}"
					use:tippy={{ content: tooltipContent }}
				>
					<span class="icon is-small">
						<i class="fas fa-ellipsis-vertical fa-xl" aria-hidden="true"></i>
					</span>
				</button>
			</div>
		</div>
	</div>
	<div
		class="message-body has-background-white has-text-dark pt-2 px-0 pb-4"
		hidden={!isContentVisible}
	>
		<slot />
	</div>
</article>

<div role="menu" bind:this={tooltipContent}>
	<div class="dropdown-content">
		<!-- svelte-ignore a11y-missing-attribute -->
		<a
			class="dropdown-item"
			role="button"
			tabindex="0"
			on:click={handleZoomToLayer}
			on:keydown={handleEnterKey}
		>
			<span class="icon-text">
				<span class="icon">
					<i class="fa-solid fa-magnifying-glass-plus"></i>
				</span>
				<span>Zoom to layer</span>
			</span>
		</a>

		<!-- svelte-ignore a11y-missing-attribute -->
		<a
			class="dropdown-item"
			role="button"
			tabindex="0"
			on:click={() => {
				clickMenuButton();
				isDeleteDialogVisible = true;
			}}
			on:keydown={handleEnterKey}
		>
			<span class="icon-text">
				<span class="icon">
					<i class="fa-solid fa-trash"></i>
				</span>
				<span>Delete layer</span>
			</span>
		</a>

		{#if is_raster}
			<HistogramMenu bind:metadata={layer.info} />
		{/if}

		<DataCardInfoMenu bind:layer />
	</div>
</div>

<DeleteMenu bind:layer bind:isVisible={isDeleteDialogVisible} />

<style lang="scss">
	.border {
		border: 1px #7a7a7a solid;
	}

	.underline {
		border-bottom: 1px #7a7a7a solid;
	}

	.toggle-button,
	.menu-button {
		border: none;
		background: transparent;
	}

	:global(.tippy-box[data-theme='transparent']) {
		background-color: transparent;
		color: transparent;
	}
</style>
