<script lang="ts">
	import { getLayerStyle } from '$lib/helper';
	import type { VectorLayerSpecification } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Slider } from '@undp-data/svelte-undp-components';
	import { debounce } from 'lodash-es';
	import type { LayerSpecification, RasterLayerSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;

	const getLayerOpacity = () => {
		const id = layerId;
		const style = getLayerStyle($map, id);
		let opacity: number;
		switch (style.type) {
			case 'raster':
				opacity = $map.getPaintProperty(id, 'raster-opacity') as number;
				break;
			case 'symbol':
				opacity = $map.getPaintProperty(id, 'icon-opacity') as number;
				break;
			case 'line':
				opacity = $map.getPaintProperty(id, 'line-opacity') as number;
				break;
			case 'fill':
				opacity = $map.getPaintProperty(id, 'fill-opacity') as number;
				break;
			case 'heatmap':
				opacity = $map.getPaintProperty(id, 'heatmap-opacity') as number;
				break;
			case 'circle':
				opacity = $map.getPaintProperty(id, 'circle-opacity') as number;
				break;
			case 'fill-extrusion':
				opacity = $map.getPaintProperty(id, 'fill-extrusion-opacity') as number;
				break;
			default:
				break;
		}
		if (!opacity) {
			opacity = 1;
		}
		return opacity;
	};

	let layerOpacity = getLayerOpacity();
	let values = [layerOpacity * 100];

	$: layerOpacity = values[0] / 100;
	$: layerOpacity, setOpacity();

	const setOpacity = debounce(() => {
		const style = getLayerStyle($map, layerId);
		const sourceId = style.source;
		let layers: LayerSpecification[] = [];
		if (style.type === 'raster') {
			layers = $map.getStyle().layers.filter((l: RasterLayerSpecification) => l.id === layerId);
		} else {
			layers = $map
				.getStyle()
				.layers.filter(
					(l: VectorLayerSpecification) =>
						l.source === sourceId &&
						l['source-layer'] === style['source-layer'] &&
						l.id.indexOf(layerId) !== -1
				);
		}

		layers?.forEach((layer) => {
			setLayerOpacity(layer.id);
		});
	}, 300);

	const setLayerOpacity = (id: string) => {
		const style = getLayerStyle($map, id);
		if (!style) return;
		switch (style.type) {
			case 'raster':
				map.setPaintProperty(id, 'raster-opacity', layerOpacity);
				break;
			case 'symbol':
				map.setPaintProperty(id, 'icon-opacity', layerOpacity);
				map.setPaintProperty(id, 'text-opacity', layerOpacity);
				break;
			case 'line':
				map.setPaintProperty(id, 'line-opacity', layerOpacity);
				break;
			case 'fill':
				map.setPaintProperty(id, 'fill-opacity', layerOpacity);
				break;
			case 'heatmap':
				map.setPaintProperty(id, 'heatmap-opacity', layerOpacity);
				break;
			case 'circle':
				map.setPaintProperty(id, 'circle-opacity', layerOpacity);
				map.setPaintProperty(id, 'circle-stroke-opacity', layerOpacity);
				break;
			case 'fill-extrusion':
				map.setPaintProperty(id, 'fill-extrusion-opacity', layerOpacity);
				break;
			default:
				break;
		}
	};
</script>

<Slider bind:values min={0} max={100} step={1} first="label" last="label" rest={false} suffix="%" />
