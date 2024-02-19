<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import MapStyleCardList from '$components/pages/home/MapStyleCardList.svelte';
	import Breadcrumbs, { type BreadcrumbPage } from '$components/util/Breadcrumbs.svelte';
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
	import { DefaultLink } from '@undp-data/svelte-undp-design';
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

<div class="has-background-light px-6 py-4">
	<div class="py-4">
		<Breadcrumbs pages={breadcrumbs} />
	</div>

	<div class="is-flex mt-6 mb-5">
		<p class="title is-3">
			Explore maps or
			<DefaultLink title="create a new map" href="/maps/edit" target="" />
		</p>
	</div>
</div>

<div class="mx-6 my-4">
	<MapStyleCardList bind:mapData={mapsData} on:change={handleMapChanged} />
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';
</style>
