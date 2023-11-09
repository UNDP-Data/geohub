<script lang="ts">
	import { page } from '$app/stores';
	import VectorValueClassification from '$components/maplibre/vector/VectorValueClassification.svelte';
	import type { SpriteImage, VectorTileMetadata } from '$lib/types';
	import {
		MAPSTORE_CONTEXT_KEY,
		SPRITEIMAGE_CONTEXT_KEY,
		type MapStore,
		type SpriteImageStore
	} from '$stores';
	import chroma from 'chroma-js';
	import { hexToCSSFilter } from 'hex-to-css-filter';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const spriteImageList: SpriteImageStore = getContext(SPRITEIMAGE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let defaultColor: string;

	let defaultLineWidth = $page.data.config.LineWidth;
	let maxValue = 5;
	let minValue = 0;
	let propertyName = 'icon-size';
	let stepValue = 0.25;

	let icon: SpriteImage;
	let cssIconFilter = '';

	const setCssIconFilter = () => {
		const rgba = chroma(defaultColor).rgba();
		cssIconFilter = hexToCSSFilter(chroma([rgba[0], rgba[1], rgba[2]]).hex()).filter;
	};

	const getIconImageName = () => {
		const propertyName = 'icon-image';
		const style = $map
			.getStyle()
			.layers.filter((mapLayer: LayerSpecification) => mapLayer.id === layerId)[0];
		return style.layout && style.layout[propertyName] ? style.layout[propertyName] : 'circle';
	};

	onMount(() => {
		handleDefaultColorChanged();
	});

	$: defaultColor, handleDefaultColorChanged();
	const handleDefaultColorChanged = () => {
		icon = $spriteImageList.find((icon) => icon.alt === getIconImageName());
		setCssIconFilter();
	};
</script>

{#if icon}
	<VectorValueClassification
		{layerId}
		{metadata}
		bind:defaultValue={defaultLineWidth}
		{minValue}
		{maxValue}
		{stepValue}
		{propertyName}
		styleType="layout"
		legendCssTemplate={`margin-left: auto; margin-right: auto; width: calc(1em * {value}); height: calc(1em * {value}); filter: ${cssIconFilter}; background-image: url("${icon.src}"); background-repeat: no-repeat; background-size: contain;`}
		dataLabel="Icon size"
	/>
{/if}
