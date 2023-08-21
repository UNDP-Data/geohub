<script lang="ts">
	import type { StyleSpecification } from 'maplibre-gl';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import RasterLayer from '$components/RasterLayer.svelte';
	import VectorLayer from '$components/VectorLayer.svelte';
	import { map, layerList } from '$stores';
	import { TabNames } from '$lib/config/AppConfig';
	import {
		fromLocalStorage,
		getLayerStyle,
		isStyleChanged,
		storageKeys,
		toLocalStorage
	} from '$lib/helper';
	import Notification from './controls/Notification.svelte';
	import LayerOrder from './LayerOrder.svelte';
	import type { Layer, SavedMapStyle } from '$lib/types';

	export let contentHeight: number;

	let layerHeaderHeight = 39;

	$: totalHeight = contentHeight - layerHeaderHeight;

	const layerListStorageKey = storageKeys.layerList($page.url.host);
	const mapStyleStorageKey = storageKeys.mapStyle($page.url.host);
	const mapStyleIdStorageKey = storageKeys.mapStyleId($page.url.host);
	const initialLayerList: Layer[] | null = fromLocalStorage(layerListStorageKey, null);
	const initiaMapStyle: StyleSpecification | null = fromLocalStorage(mapStyleStorageKey, null);
	const initiaMapStyleId: string = fromLocalStorage(mapStyleIdStorageKey, null)?.toString();

	beforeNavigate(() => {
		const storageLayerList = $layerList;
		toLocalStorage(layerListStorageKey, storageLayerList);

		let storageMapStyle = $map?.getStyle();
		storageMapStyle = setLocationOnStyle(storageMapStyle);
		toLocalStorage(mapStyleStorageKey, storageMapStyle);
	});

	$: if ($map) {
		layerList.subscribe((value) => {
			const storageValue = value
				? value
				: initialLayerList && initialLayerList.length > 0
				? initialLayerList
				: null;
			toLocalStorage(layerListStorageKey, storageValue);
		});

		map.subscribe((value) => {
			let storageValue = value ? value.getStyle() : null;
			if (storageValue) {
				storageValue = setLocationOnStyle(storageValue);
			}
			toLocalStorage(mapStyleStorageKey, storageValue);
		});
		$map?.on('styledata', () => {
			let storageValue = $map.getStyle();
			if (storageValue) {
				storageValue = setLocationOnStyle(storageValue);
			}
			toLocalStorage(mapStyleStorageKey, storageValue);
		});
	}

	const setLocationOnStyle = (style: StyleSpecification) => {
		const center = $map.getCenter();
		style.center = [center.lng, center.lat];
		style.bearing = $map.getBearing();
		style.pitch = $map.getPitch();
		style.zoom = $map.getZoom();
		return style;
	};

	const restoreStyle = (newStyle: StyleSpecification, newLayerList: Layer[]) => {
		const style: StyleSpecification = newStyle;
		// console.log(style);
		$map.setStyle(style);

		$map.flyTo({
			center: [style.center[0], style.center[1]],
			zoom: style.zoom,
			bearing: style.bearing,
			pitch: style.pitch
		});

		if (!$map.isStyleLoaded()) {
			$map.once('styledata', () => {
				$layerList = newLayerList;
			});
		} else {
			$layerList = newLayerList;
		}
	};

	let savedStylePromise: Promise<SavedMapStyle> = $page.data.promises?.style;
	savedStylePromise?.then((styleInfo) => {
		const savedStyleId = $page.url.searchParams.get('style');
		if (savedStyleId && styleInfo) {
			// if style query param in URL
			if (initiaMapStyleId === savedStyleId) {
				// If style id in local storage is the same with style query param
				// console.log(initiaMapStyle, initialLayerList, initiaMapStyleId, styleInfo.style)
				if (initiaMapStyle && initialLayerList && initialLayerList.length > 0) {
					if (isStyleChanged(initiaMapStyle, styleInfo.style)) {
						// restore from local storage
						restoreStyle(initiaMapStyle, initialLayerList);
						return;
					}
				}

				// restore from database
				restoreStyle(styleInfo.style, styleInfo.layers);
				return;
			} else {
				// style ID is different from query param
				restoreStyle(styleInfo.style, styleInfo.layers);
				toLocalStorage(mapStyleIdStorageKey, savedStyleId);
				return;
			}
		} else {
			// no style query param
			$page.url.searchParams.delete('style');
			toLocalStorage(mapStyleIdStorageKey, null);
			if (!initiaMapStyleId && initiaMapStyle && initialLayerList && initialLayerList.length > 0) {
				// restore from local storage
				restoreStyle(initiaMapStyle, initialLayerList);
			} else {
				toLocalStorage(layerListStorageKey, []);
			}
			goto(`?${$page.url.searchParams.toString()}`);
			return;
		}
	});
</script>

{#if $layerList?.length > 0}
	<div class="layer-header px-2 pt-2" bind:clientHeight={layerHeaderHeight}>
		<div class="layer-order">
			<LayerOrder />
		</div>
	</div>
{/if}
<div class="layer-list mx-2 mt-1" style="height: {totalHeight}px;">
	{#if $layerList?.length === 0}
		<Notification type="info">
			No layers have been selected. Please select a layer from the <strong>{TabNames.DATA}</strong> tab.
		</Notification>
	{/if}

	{#each $layerList as layer (layer.id)}
		<div class="box p-0 mx-1 my-3">
			{#if getLayerStyle($map, layer.id).type === 'raster'}
				<RasterLayer {layer} />
			{:else}
				<VectorLayer {layer} />
			{/if}
		</div>
	{/each}
</div>

<style lang="scss">
	.layer-header {
		display: flex;
		width: 100%;

		.layer-order {
			margin-left: auto;
		}
	}

	.layer-list {
		overflow-y: auto;
	}
</style>
