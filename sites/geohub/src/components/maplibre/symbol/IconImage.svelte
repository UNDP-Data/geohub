<script lang="ts" context="module">
	let images: IconImageType[] = [];
</script>

<script lang="ts">
	import {
		IconImage,
		type IconImageType,
		MAPSTORE_CONTEXT_KEY,
		type MapStore
	} from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';

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

	const updateLegend = () => {
		if (!$map.getLayer(layerId)) return;
		map.setLayoutProperty(layerId, propertyName, selected);
		map.setPaintProperty(layerId, 'icon-halo-color', 'rgb(255,255,255)');
		map.setPaintProperty(layerId, 'icon-halo-width', 1);
	};

	const getIconImages = async () => {
		if (images.length > 0) return images;
		const res = await fetch(`/api/mapstyle/sprite/images`);
		images = await res.json();
		return images;
	};

	const handleSelect = (e: { detail: IconImageType }) => {
		const item = e.detail;
		selected = item.alt;
		updateLegend();
	};
</script>

{#await getIconImages()}
	<div class="is-flex is-justify-content-center">
		<Loader size="small" />
	</div>
{:then}
	<IconImage bind:images bind:selected bind:readonly on:select={handleSelect} />
{/await}
