<script lang="ts">
	import Map from '$components/Map.svelte';
	import Content from './Content.svelte';
	import { map as mapStore } from '$stores';
	import { page } from '$app/stores';
	import { MenuControl } from '@watergis/svelte-maplibre-menu';
	import type { SidebarPosition } from '$lib/types';

	let isMenuShown = true;
	let innerWidth: number;
	let innerHeight: number;
	let initialSidebarWidth = 360;
	let minSidebarWidth = `${initialSidebarWidth}px`;
	let minMapWidth = '50%';

	let sideBarPosition: SidebarPosition = $page.data.config.SidebarPosition;
	let sidebarOnLeft = sideBarPosition === 'left' ? true : false;

	$: headerHeight = innerWidth >= 1024 ? 93.44 : 60.94;

	$: splitHeight = innerHeight - headerHeight;
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<MenuControl
	bind:map={$mapStore}
	position={'top-right'}
	bind:isMenuShown
	bind:sidebarOnLeft
	isHorizontal={false}
	bind:initialSidebarWidth
	bind:minSidebarWidth
	bind:minMapWidth
	bind:height={splitHeight}
>
	<div slot="sidebar">
		<Content bind:splitterHeight={splitHeight} />
	</div>
	<div slot="map">
		<Map bind:map={$mapStore} />
	</div>
</MenuControl>
