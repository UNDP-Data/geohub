<script lang="ts">
	import type { StyleSpecification } from 'maplibre-gl';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import RasterLayer from '$components/RasterLayer.svelte';
	import VectorLayer from '$components/VectorLayer.svelte';
	import { map, layerList, spriteImageList } from '$stores';
	import { TabNames } from '$lib/config/AppConfig';
	import {
		fromLocalStorage,
		getLayerStyle,
		getSpriteImageList,
		isStyleChanged,
		storageKeys,
		toLocalStorage
	} from '$lib/helper';
	import Notification from './controls/Notification.svelte';
	import LayerOrder from './LayerOrder.svelte';
	import type { DashboardMapStyle, Layer } from '$lib/types';

	export let contentHeight: number;

	let layerHeaderHeight = 39;

	$: totalHeight = contentHeight - layerHeaderHeight;

	const layerListStorageKey = storageKeys.layerList($page.url.host);
	const mapStyleStorageKey = storageKeys.mapStyle($page.url.host);
	const mapStyleIdStorageKey = storageKeys.mapStyleId($page.url.host);
	const initialLayerList: Layer[] | null = fromLocalStorage(layerListStorageKey, null);
	const initiaMapStyle: StyleSpecification | null = fromLocalStorage(mapStyleStorageKey, null);
	const initiaMapStyleId: string = fromLocalStorage(mapStyleIdStorageKey, null)?.toString();

	let savedStyle: DashboardMapStyle = $page.data.style;

	beforeNavigate(() => {
		const storageLayerList = $layerList;
		toLocalStorage(layerListStorageKey, storageLayerList);

		let storageMapStyle = $map?.getStyle();
		storageMapStyle.center = [$map.getCenter().lng, $map.getCenter().lat];
		storageMapStyle.zoom = $map.getZoom();
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
			toLocalStorage(mapStyleStorageKey, storageValue);
		});
		$map?.on('styledata', async () => {
			let storageValue = $map.getStyle();

			if (!($spriteImageList?.length > 0)) {
				const spriteUrl = $map.getStyle().sprite as string;
				const iconList = await getSpriteImageList(spriteUrl);
				spriteImageList.update(() => iconList);
			}

			toLocalStorage(mapStyleStorageKey, storageValue);
		});

		if (!savedStyle) {
			resetStyleToDefault();
		} else {
			const savedStyleId = $page.url.searchParams.get('style');
			if (savedStyleId && savedStyle) {
				// if style query param in URL
				if (initiaMapStyleId === savedStyleId) {
					// If style id in local storage is the same with style query param
					// console.log(initiaMapStyle, initialLayerList, initiaMapStyleId, styleInfo.style)
					if (initiaMapStyle && initialLayerList && initialLayerList.length > 0) {
						if (isStyleChanged(initiaMapStyle, savedStyle.style)) {
							// restore from local storage
							restoreStyle(initiaMapStyle, initialLayerList);
						} else {
							// restore from database
							restoreStyle(savedStyle.style, savedStyle.layers);
						}
					} else {
						// restore from database
						restoreStyle(savedStyle.style, savedStyle.layers);
					}
				} else {
					// style ID is different from query param
					restoreStyle(savedStyle.style, savedStyle.layers);
					toLocalStorage(mapStyleIdStorageKey, savedStyleId);
				}
			} else {
				// no style query param
				resetStyleToDefault();
				goto(`?${$page.url.searchParams.toString()}`);
			}
		}
	}

	const restoreStyle = (newStyle: StyleSpecification, newLayerList: Layer[]) => {
		const style: StyleSpecification = newStyle;
		$map.setStyle(style);

		if (style.center && style.zoom) {
			console.log({ center: [style.center[0], style.center[1]], zoom: style.zoom });
			$map.flyTo({ center: [style.center[0], style.center[1]], zoom: style.zoom });
		}
		if (style.bearing) {
			$map.setBearing(style.bearing);
		}
		if (style.pitch) {
			$map.setPitch(style.pitch);
		}

		if (!$map.isStyleLoaded()) {
			$map.once('styledata', () => {
				$layerList = newLayerList;
			});
		} else {
			$layerList = newLayerList;
		}
	};

	const resetStyleToDefault = () => {
		// no style query param
		$page.url.searchParams.delete('style');
		toLocalStorage(mapStyleIdStorageKey, null);
		if (!initiaMapStyleId && initiaMapStyle && initialLayerList && initialLayerList.length > 0) {
			let existAllLayers = true;
			initialLayerList.forEach((l) => {
				if (!initiaMapStyle.layers.find((ml) => ml.id === l.id)) {
					existAllLayers = false;
				}
			});
			if (existAllLayers) {
				// restore from local storage
				restoreStyle(initiaMapStyle, initialLayerList);
			} else {
				toLocalStorage(layerListStorageKey, []);
				toLocalStorage(mapStyleStorageKey, $map.getStyle());
			}
		} else {
			toLocalStorage(layerListStorageKey, []);
		}
	};
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
