<script lang="ts">
	import { browser } from '$app/environment';
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import Header from '$components/header/Header.svelte';
	import Content from '$components/pages/map/Content.svelte';
	import { fromLocalStorage, isStyleChanged, storageKeys, toLocalStorage } from '$lib/helper';
	import type { DashboardMapStyle, Layer } from '$lib/types';
	import {
		createEditingLayerStore,
		createEditingMenuShownStore,
		createHeaderHeightStore,
		createLayerListStore,
		createPageDataLoadingStore,
		createSidebarWidthStore,
		EDITING_LAYER_STORE_CONTEXT_KEY,
		EDITING_MENU_SHOWN_CONTEXT_KEY,
		HEADER_HEIGHT_CONTEXT_KEY,
		LAYERLISTSTORE_CONTEXT_KEY,
		PAGE_DATA_LOADING_CONTEXT_KEY,
		SIDEBAR_MENU_SHOWN_CONTEXT_KEY,
		SIDEBAR_WIDTH_CONTEXT_KEY,
		TABLE_MENU_SHOWN_CONTEXT_KEY,
		type LayerListStore,
		type PageDataLoadingStore
	} from '$stores';
	import {
		createMapStore,
		MAPSTORE_CONTEXT_KEY,
		ModalTemplate,
		Sidebar,
		type SidebarPosition
	} from '@undp-data/svelte-undp-components';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import type { StyleSpecification } from 'maplibre-gl';
	import { addProtocol } from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount, setContext, type Snippet } from 'svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
		children?: Snippet;
	}

	let { data = $bindable(), children }: Props = $props();

	const headerHeightStore = createHeaderHeightStore();
	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

	const sidebarWidthStore = createSidebarWidthStore();
	setContext(SIDEBAR_WIDTH_CONTEXT_KEY, sidebarWidthStore);

	const sidebarMenuShownStore = createEditingMenuShownStore();
	$sidebarMenuShownStore = true;
	setContext(SIDEBAR_MENU_SHOWN_CONTEXT_KEY, sidebarMenuShownStore);

	const map = createMapStore();
	setContext(MAPSTORE_CONTEXT_KEY, map);

	const pageDataLoadingStore: PageDataLoadingStore = createPageDataLoadingStore();
	$pageDataLoadingStore = true;
	setContext(PAGE_DATA_LOADING_CONTEXT_KEY, pageDataLoadingStore);

	const layerListStore: LayerListStore = createLayerListStore();
	setContext(LAYERLISTSTORE_CONTEXT_KEY, layerListStore);

	const editingLayerStore = createEditingLayerStore();
	setContext(EDITING_LAYER_STORE_CONTEXT_KEY, editingLayerStore);

	const editingMenuShownStore = createEditingMenuShownStore();
	setContext(EDITING_MENU_SHOWN_CONTEXT_KEY, editingMenuShownStore);

	const tablegMenuShownStore = createEditingMenuShownStore();
	setContext(TABLE_MENU_SHOWN_CONTEXT_KEY, tablegMenuShownStore);

	let innerWidth = $state(0);
	let innerHeight = $state(0);

	$effect(() => {
		if ($editingMenuShownStore === false) {
			editingLayerStore.set(undefined);
		}
	});

	let sideBarPosition: SidebarPosition = $state(page.data.config.SidebarPosition);

	let splitHeight = $derived(innerHeight - $headerHeightStore);

	const layerListStorageKey = storageKeys.layerList(page.url.host);
	const mapStyleStorageKey = storageKeys.mapStyle(page.url.host);
	const mapStyleIdStorageKey = storageKeys.mapStyleId(page.url.host);
	// get initial local storage style when page is loaded
	const initiaLayerList: Layer[] = fromLocalStorage(layerListStorageKey, null);
	const initiaMapStyle: StyleSpecification | null = fromLocalStorage(mapStyleStorageKey, null);
	const initiaMapStyleId: string | null = fromLocalStorage(mapStyleIdStorageKey, null);

	let dialogOpen = $state(false);
	let toUrl: URL | undefined = $state(undefined);

	let isNewMapPage = page.url.pathname === '/maps/edit';

	if (isNewMapPage && initiaMapStyleId) {
		toLocalStorage(layerListStorageKey, []);
		toLocalStorage(mapStyleStorageKey, null);
		toLocalStorage(mapStyleIdStorageKey, null);
	}

	beforeNavigate(({ cancel, to }) => {
		if (!$map) return;
		if (!to) return;
		toUrl = to.url;

		if (page.url.pathname === toUrl.pathname) {
			return;
		}

		if (!data.session && toUrl.pathname === '/auth/signIn') {
			// if users do not sign in and move to signIn page, don't show unsaved change dialog
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
			let databaseStyle: DashboardMapStyle = page.data.style;
			if (databaseStyle?.style && isStyleChanged(databaseStyle.style, storageMapStyle)) {
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
		if (browser && toUrl) {
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
	bind:show={$sidebarMenuShownStore}
	bind:position={sideBarPosition}
	bind:marginTop={$headerHeightStore}
	bind:width={$sidebarWidthStore}
	border="none"
>
	{#snippet content()}
		<Content splitterHeight={splitHeight} />
	{/snippet}
	{#snippet main()}
		{@render children?.()}
	{/snippet}
</Sidebar>

<ModalTemplate title="Unsaved changes" bind:show={dialogOpen}>
	{#snippet content()}
		<span>
			You have unsaved changes on your map. Would you like to discard the changes or stay on the map
			to save them?
		</span>
	{/snippet}
	{#snippet buttons()}
		<div class="buttons">
			<div class="footer-button">
				<button
					data-testid="cancel-button"
					class="button is-primary is-uppercase has-text-weight-bold"
					onclick={handleDiscard}
				>
					Discard changes
				</button>
			</div>
			<div class="footer-button">
				<button
					class="cancel-button button is-light is-uppercase has-text-weight-bold"
					onclick={handleCancel}
				>
					stay on map
				</button>
			</div>
		</div>
	{/snippet}
</ModalTemplate>

<SvelteToast />

<style global lang="scss">
	@import 'bulma-divider/dist/css/bulma-divider.min.css';
	@import 'flag-icons/css/flag-icons.min.css';

	.cancel-button {
		box-shadow: none !important;
		&.is-light {
			background-color: #edeff0 !important;
		}
	}
</style>
