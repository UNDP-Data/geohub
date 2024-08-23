<script lang="ts">
	import { browser } from '$app/environment';
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import Header from '$components/header/Header.svelte';
	import Content from '$components/pages/map/Content.svelte';
	import { fromLocalStorage, isStyleChanged, storageKeys, toLocalStorage } from '$lib/helper';
	import type { DashboardMapStyle, Layer } from '$lib/types';
	import {
		EDITING_LAYER_STORE_CONTEXT_KEY,
		EDITING_MENU_SHOWN_CONTEXT_KEY,
		HEADER_HEIGHT_CONTEXT_KEY,
		LAYERLISTSTORE_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		PAGE_DATA_LOADING_CONTEXT_KEY,
		SPRITEIMAGE_CONTEXT_KEY,
		createEditingLayerStore,
		createEditingMenuShownStore,
		createHeaderHeightStore,
		createLayerListStore,
		createMapStore,
		createPageDataLoadingStore,
		createSpriteImageStore,
		type LayerListStore,
		type PageDataLoadingStore,
		type SpriteImageStore
	} from '$stores';
	import { Sidebar, type SidebarPosition } from '@undp-data/svelte-sidebar';
	import { ModalTemplate, Notification } from '@undp-data/svelte-undp-components';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import type { StyleSpecification } from 'maplibre-gl';
	import { addProtocol } from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount, setContext } from 'svelte';

	const headerHeightStore = createHeaderHeightStore();
	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

	const map = createMapStore();
	setContext(MAPSTORE_CONTEXT_KEY, map);

	const spriteImageList: SpriteImageStore = createSpriteImageStore();
	setContext(SPRITEIMAGE_CONTEXT_KEY, spriteImageList);

	const pageDataLoadingStore: PageDataLoadingStore = createPageDataLoadingStore();
	$pageDataLoadingStore = true;
	setContext(PAGE_DATA_LOADING_CONTEXT_KEY, pageDataLoadingStore);

	const layerListStore: LayerListStore = createLayerListStore();
	setContext(LAYERLISTSTORE_CONTEXT_KEY, layerListStore);

	const editingLayerStore = createEditingLayerStore();
	setContext(EDITING_LAYER_STORE_CONTEXT_KEY, editingLayerStore);

	const editingMenuShownStore = createEditingMenuShownStore();
	setContext(EDITING_MENU_SHOWN_CONTEXT_KEY, editingMenuShownStore);

	let innerWidth: number;
	let innerHeight: number;
	let isMenuShown = true;

	$: if ($editingMenuShownStore === false) {
		editingLayerStore.set(undefined);
	}

	let sideBarPosition: SidebarPosition = $page.data.config.SidebarPosition;

	$: splitHeight = innerHeight - $headerHeightStore;

	const layerListStorageKey = storageKeys.layerList($page.url.host);
	const mapStyleStorageKey = storageKeys.mapStyle($page.url.host);
	const mapStyleIdStorageKey = storageKeys.mapStyleId($page.url.host);
	// get initial local storage style when page is loaded
	const initiaLayerList: Layer[] = fromLocalStorage(layerListStorageKey, null);
	const initiaMapStyle: StyleSpecification | null = fromLocalStorage(mapStyleStorageKey, null);
	const initiaMapStyleId: string | null = fromLocalStorage(mapStyleIdStorageKey, null);

	let dialogOpen = false;
	let toUrl: URL = undefined;

	let isNewMapPage = $page.url.pathname === '/maps/edit';

	if (isNewMapPage && initiaMapStyleId) {
		toLocalStorage(layerListStorageKey, []);
		toLocalStorage(mapStyleStorageKey, null);
		toLocalStorage(mapStyleIdStorageKey, null);
	}

	beforeNavigate(({ cancel, to }) => {
		if (!$map) return;
		if (!to) return;
		toUrl = to.url;

		if ($page.url.pathname === toUrl.pathname) {
			return;
		}

		// get current map style in local storage
		const storageMapStyle = fromLocalStorage(mapStyleStorageKey, null);

		if (isNewMapPage) {
			// /map page
			if (
				initiaMapStyle &&
				initiaLayerList?.length > 0 &&
				isStyleChanged(initiaMapStyle, storageMapStyle)
			) {
				// if previously saved data in localstorage and current state has difference
				cancel();
				dialogOpen = true;
			} else if ($layerListStore.length > 0) {
				// if any layers are added to map
				cancel();
				dialogOpen = true;
			} else {
				// continue moving to other page after clearing local storage
				handleDiscard();
			}
		} else {
			// /map/{id} saved map page
			let databaseStyle: DashboardMapStyle = $page.data.style;
			if (databaseStyle && isStyleChanged(databaseStyle.style, storageMapStyle)) {
				// if there is any difference between database style and current state
				cancel();
				dialogOpen = true;
			} else {
				// continue moving to other page after clearing local storage
				handleDiscard();
			}
		}
	});

	const handleDiscard = () => {
		toLocalStorage(layerListStorageKey, []);
		toLocalStorage(mapStyleStorageKey, null);
		toLocalStorage(mapStyleIdStorageKey, null);
		dialogOpen = false;
		if (browser) {
			window.location.href = toUrl.toString();
		}
	};

	const handleCancel = () => {
		toUrl = undefined;
		dialogOpen = false;
	};

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);
	});
</script>

<svelte:head>
	<style type="text/css">
		html {
			overflow-y: hidden !important;
		}
	</style>
</svelte:head>

<svelte:window bind:innerWidth bind:innerHeight />

<Header isPositionFixed={true} />

<Sidebar
	bind:show={isMenuShown}
	bind:position={sideBarPosition}
	bind:marginTop={$headerHeightStore}
	border="none"
>
	<div slot="content">
		<Content bind:splitterHeight={splitHeight} />
	</div>
	<div slot="main">
		<slot />
	</div>
</Sidebar>

<ModalTemplate title="You have unsaved changes" bind:show={dialogOpen}>
	<div slot="content">
		<Notification type="warning" showCloseButton={false}>
			<div>
				Are you sure leaving map?
				<br />
				If you want to discard all changes, click <b>Discard changes</b>.
				<br />
				If want to save your work to the database, close the dialog to cancel. Then use
				<b>Share</b> feature to save your map before leaving.
			</div>
		</Notification>
	</div>
	<div class="buttons" slot="buttons">
		<div class="footer-button">
			<button
				data-testid="cancel-button"
				class="button is-primary is-uppercase has-text-weight-bold"
				on:click={handleDiscard}
			>
				Discard changes
			</button>
		</div>
		<div class="footer-button">
			<button class="button is-link is-uppercase has-text-weight-bold" on:click={handleCancel}>
				Close and continue
			</button>
		</div>
	</div>
</ModalTemplate>

<SvelteToast />

<style global lang="scss">
	@import 'bulma-divider/dist/css/bulma-divider.min.css';
	@import 'flag-icons/css/flag-icons.min.css';
</style>
