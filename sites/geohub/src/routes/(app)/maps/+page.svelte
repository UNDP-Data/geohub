<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import MapStyleCardList from '$components/pages/home/MapStyleCardList.svelte';
	import type { MapsData } from '$lib/types';
	import {
		LAYERLISTSTORE_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		SPRITEIMAGE_CONTEXT_KEY,
		createLayerListStore,
		createMapStore,
		createSpriteImageStore,
		type LayerListStore,
		type SpriteImageStore
	} from '$stores';
	import { HeroHeader, type BreadcrumbPage } from '@undp-data/svelte-undp-components';
	import { addProtocol } from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount, setContext } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let mapsData: MapsData = data.styles;

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'maps', url: $page.url.href }
	];

	const mapStore = createMapStore();
	setContext(MAPSTORE_CONTEXT_KEY, mapStore);

	let layerListStore: LayerListStore = createLayerListStore();
	setContext(LAYERLISTSTORE_CONTEXT_KEY, layerListStore);

	const spriteImageList: SpriteImageStore = createSpriteImageStore();
	setContext(SPRITEIMAGE_CONTEXT_KEY, spriteImageList);

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);
	});

	const handleMapChanged = async () => {
		mapsData = undefined;
		await invalidate('data:styles');
		mapsData = data.styles;
	};
</script>

<HeroHeader
	title="Explore maps"
	bind:breadcrumbs
	button={{ title: 'new map', href: '/href/edit', tooltip: 'Create a new map' }}
/>

<div class="mx-6 my-4">
	<MapStyleCardList bind:mapData={mapsData} on:change={handleMapChanged} />
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';
</style>
