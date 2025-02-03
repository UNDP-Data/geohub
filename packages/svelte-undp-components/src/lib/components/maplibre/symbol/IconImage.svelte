<script lang="ts" module>
	let images: IconImageType[] = $state([]);
</script>

<script lang="ts">
	import { IconImageSelector, type IconImageType } from '$lib/components/ui';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
		readonly?: boolean;
		apiOrigin?: string;
	}

	let {
		layerId = $bindable(),
		readonly = $bindable(false),
		apiOrigin = $bindable('')
	}: Props = $props();

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

	let selected = $state(getIconImage(style));

	const updateLegend = () => {
		if (!$map.getLayer(layerId)) return;
		map.setLayoutProperty(layerId, propertyName, selected);
		map.setPaintProperty(layerId, 'icon-halo-color', 'rgb(255,255,255)');
		map.setPaintProperty(layerId, 'icon-halo-width', 1);
	};

	const getIconImages = async () => {
		if (images.length > 0) return images;
		const res = await fetch(`${apiOrigin}/api/mapstyle/sprite/images`);
		images = await res.json();
		return images;
	};

	const handleSelect = (item: IconImageType) => {
		selected = item.alt;
		updateLegend();
	};
</script>

{#await getIconImages()}
	<div class="is-flex is-justify-content-center">
		<Loader size="small" />
	</div>
{:then}
	<IconImageSelector bind:images bind:selected bind:readonly onselect={handleSelect} />
{/await}
