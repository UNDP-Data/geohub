<script lang="ts">
	import DataCardInfoMenu from '$components/pages/map/layers/header/DataCardInfoMenu.svelte';
	import DeleteMenu from '$components/pages/map/layers/header/DeleteMenu.svelte';
	import VisibilityButton from '$components/pages/map/layers/header/VisibilityButton.svelte';
	import { AccessLevel } from '$lib/config/AppConfig';
	import { clean, getAccessLevelIcon, getLayerStyle, handleEnterKey, initTippy } from '$lib/helper';
	import type { Layer, RasterTileMetadata, VectorTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import type { LngLatBoundsLike } from 'maplibre-gl';
	import { getContext } from 'svelte';
	import HistogramMenu from './HistogramMenu.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;
	export let isVisible = true;

	let isDeleteDialogVisible = false;

	let is_raster = layer.dataset.properties.is_raster;

	const accessIcon = getAccessLevelIcon(
		layer.dataset.properties.access_level ?? AccessLevel.PUBLIC,
		true
	);

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

<div class="layer-header">
	<div class="group px-1 is-flex">
		<button
			class="button toggle-button"
			on:click={() => {
				isVisible = !isVisible;
			}}
		>
			<span class="icon has-text-primary">
				<i class="fa-solid fa-chevron-{isVisible ? 'up' : 'down'} fa-xl"></i>
			</span>
		</button>

		{#if accessIcon}
			<i class="{accessIcon} p-1" />
		{/if}
	</div>

	<span class="layer-name pl-1">
		{clean(layer.name)}
	</span>

	<div class="dropdown-trigger left group">
		<VisibilityButton {layer} />
		<button
			class="button menu-button menu-button-{layer.id}"
			use:tippy={{ content: tooltipContent }}
		>
			<span class="icon is-small">
				<i class="fas fa-ellipsis-vertical" aria-hidden="true"></i>
			</span>
		</button>
	</div>

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
</div>
<slot />

<DeleteMenu bind:layer bind:isVisible={isDeleteDialogVisible} />

<style lang="scss">
	.layer-header {
		display: flex;
		align-items: center;

		.layer-name {
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 1;
			display: -webkit-box;
			font-size: 14px;
			overflow: hidden;
			text-overflow: ellipsis;
			height: 20px;
			justify-content: left;
		}

		.group {
			display: flex;
			grid-gap: 5px;
			align-items: center;
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

		.left {
			margin-left: auto;
		}
	}
</style>
