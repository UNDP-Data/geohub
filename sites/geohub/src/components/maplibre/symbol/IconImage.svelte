<script lang="ts">
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	import IconImagePicker from '$components/maplibre/symbol/IconImagePicker.svelte';
	import { clean, getLayerStyle, initTippy } from '$lib/helper';
	import {
		MAPSTORE_CONTEXT_KEY,
		SPRITEIMAGE_CONTEXT_KEY,
		type MapStore,
		type SpriteImageStore
	} from '$stores';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const spriteImageList: SpriteImageStore = getContext(SPRITEIMAGE_CONTEXT_KEY);

	const tippy = initTippy({
		appendTo: document.body
	});
	let tooltipContent: HTMLElement;

	export let layerId: string;
	export let readonly = false;

	const propertyName = 'icon-image';
	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	const getIconImage = (style: LayerSpecification) => {
		if (style.layout && style.layout['icon-image']) {
			return style.layout['icon-image'];
		}
		return undefined;
	};

	let defaultIconImage = getIconImage(style);
	let isIconListPanelVisible = false;

	let iconImage: string;

	onMount(async () => {
		if (!$map) return;
		updateLegend();
	});

	const updateLegend = () => {
		if (!$map.getLayer(layerId)) return;
		map.setLayoutProperty(layerId, propertyName, defaultIconImage);
		map.setPaintProperty(layerId, 'icon-halo-color', 'rgb(255,255,255)');
		map.setPaintProperty(layerId, 'icon-halo-width', 1);
		const layerStyle = getLayerStyle($map, layerId);
		if (layerStyle?.layout && layerStyle.layout['icon-image']) {
			iconImage = getIconImageSrc(layerStyle.layout['icon-image']);
		}
	};

	const getIconImageSrc = (image: string) => {
		if (!(image && typeof image === 'string')) {
			image = undefined;
		}

		if (image) {
			const icon = $spriteImageList.find((icon) => icon.alt === image);
			if (icon) {
				const iconImageStyle = `width: 24px; height: 24px; background-image: url('${icon.src}'); background-size: cover; background-repeat: no-repeat;`;
				return iconImageStyle;
			}
		}

		return;
	};

	const handleClosePopup = () => {
		isIconListPanelVisible = !isIconListPanelVisible;
	};

	const handleIconClick = (event: CustomEvent) => {
		if (event?.detail?.spriteImageAlt) {
			defaultIconImage = event.detail.spriteImageAlt;
			updateLegend();
		}
	};
</script>

<button class="button" use:tippy={{ content: !readonly ? tooltipContent : undefined }}>
	{#if iconImage}
		<span class="icon is-small">
			<figure class={`image is-24x24`} data-testid="icon-figure">
				<div style={iconImage}></div>
			</figure>
		</span>
	{/if}
	<span>{clean(defaultIconImage)}</span>
</button>

{#if !readonly}
	<div class="tooltip pb-2" data-testid="tooltip" bind:this={tooltipContent}>
		<IconImagePicker
			on:handleIconClick={handleIconClick}
			on:handleClosePopup={handleClosePopup}
			iconImageAlt={defaultIconImage}
		/>
	</div>
{/if}

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

	.icon-button {
		cursor: pointer;
		width: 65px;
	}

	.icon-button-readonly {
		width: 65px;
	}

	.tooltip {
		z-index: 10;
		width: 300px;
		height: 250px;
	}
</style>
