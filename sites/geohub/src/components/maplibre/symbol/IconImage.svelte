<script lang="ts">
	import chroma from 'chroma-js';
	import { hexToCSSFilter } from 'hex-to-css-filter';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	import IconImagePicker from '$components/maplibre/symbol/IconImagePicker.svelte';
	import { clean, getLayerStyle, initTippy } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import { spriteImageList, type MapStore, MAPSTORE_CONTEXT_KEY } from '$stores';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	const tippy = initTippy();
	let tooltipContent: HTMLElement;

	export let layer: Layer;
	export let defaultColor: string = undefined;

	const layerId = layer.id;
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

	let iconColor: string;
	let iconImageSrc: string;
	let iconImageStyle: string;

	onMount(async () => {
		if (!$map) return;
		updateLegend();
		$map.on('icon-color:changed', (e) => {
			iconColor = e.color;
			updateLegend();
		});
	});

	const updateLegend = () => {
		map.setLayoutProperty(layerId, propertyName, defaultIconImage);
		map.setPaintProperty(layerId, 'icon-halo-color', 'rgb(255,255,255)');
		map.setPaintProperty(layerId, 'icon-halo-width', 1);
		const layerStyle = getLayerStyle($map, layerId);
		if (layerStyle.layout && layerStyle.layout['icon-image']) {
			const icon = $spriteImageList.find((icon) => icon.alt === layerStyle.layout['icon-image']);
			iconImageSrc = icon.src;
			if (icon) {
				const rgba = iconColor ? chroma(iconColor).rgba() : chroma(defaultColor).rgba();
				const cssFilter = hexToCSSFilter(chroma([rgba[0], rgba[1], rgba[2]]).hex());
				iconImageStyle = `height: 24px; width: 24px; filter: ${cssFilter?.filter}`;
			}
		}
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

<div class="icon-button" use:tippy={{ content: tooltipContent }}>
	<div class="card">
		<div class="card-content">
			<div class="media is-flex is-justify-content-center">
				<figure class={`image is-24x24`} data-testid="icon-figure">
					<img
						src={iconImageSrc}
						alt={clean(defaultIconImage)}
						title={clean(defaultIconImage)}
						style={iconImageStyle}
					/>
				</figure>
			</div>
			<div class="content is-size-7 columns is-gapless" style="padding-top: 5px;">
				<div
					class="column is-flex is-justify-content-center sprite-image-title"
					title={defaultIconImage}
				>
					{clean(defaultIconImage)}
				</div>
			</div>
		</div>
	</div>
</div>

<div class="tooltip pb-2" data-testid="tooltip" bind:this={tooltipContent}>
	<IconImagePicker
		on:handleIconClick={handleIconClick}
		on:handleClosePopup={handleClosePopup}
		iconImageAlt={defaultIconImage}
	/>
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

	.icon-button {
		width: 65px;
	}

	.tooltip {
		font-size: 13px;
		z-index: 10;
		width: 300px;
		height: 250px;
	}

	.card {
		cursor: pointer;

		.card-content {
			padding: 5px;

			.media {
				margin: 0;
			}
		}
	}
</style>
