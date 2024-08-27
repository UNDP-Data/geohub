<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { IconImage, type SpriteImage } from '@undp-data/svelte-undp-components';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

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

	let selected = getIconImage(style);

	let images: SpriteImage[] = [];

	onMount(() => {
		if (!$map) return;
		getIconImages();
	});

	const updateLegend = () => {
		if (!$map.getLayer(layerId)) return;
		map.setLayoutProperty(layerId, propertyName, selected);
		map.setPaintProperty(layerId, 'icon-halo-color', 'rgb(255,255,255)');
		map.setPaintProperty(layerId, 'icon-halo-width', 1);
	};

	const getIconImages = async () => {
		const res = await fetch(`/api/mapstyle/sprite/images`);
		images = await res.json();
	};

	const handleSelect = (e: { detail: SpriteImage }) => {
		const item: SpriteImage = e.detail;
		selected = item.alt;
		updateLegend();
	};
</script>

{#if images.length > 0}
	<IconImage bind:images bind:selected bind:readonly on:select={handleSelect} />
{/if}
