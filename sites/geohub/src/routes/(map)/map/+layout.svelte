<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import Content from '$components/Content.svelte';
	import Header from '$components/Header.svelte';
	import Notification from '$components/controls/Notification.svelte';
	import { fromLocalStorage, isStyleChanged, storageKeys, toLocalStorage } from '$lib/helper';
	import type { DashboardMapStyle, Layer, SidebarPosition } from '$lib/types';
	import { layerList, map } from '$stores';
	import { MenuControl } from '@watergis/svelte-maplibre-menu';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import type { StyleSpecification } from 'maplibre-gl';
	import { fade } from 'svelte/transition';

	let headerHeight: number;

	let isMenuShown = true;
	let innerWidth: number;
	let innerHeight: number;
	let initialSidebarWidth = 360;
	let minSidebarWidth = `${initialSidebarWidth}px`;
	let minMapWidth = '50%';

	let sideBarPosition: SidebarPosition = $page.data.config.SidebarPosition;
	let sidebarOnLeft = sideBarPosition === 'left' ? true : false;

	$: splitHeight = innerHeight - headerHeight;

	const layerListStorageKey = storageKeys.layerList($page.url.host);
	const mapStyleStorageKey = storageKeys.mapStyle($page.url.host);
	const mapStyleIdStorageKey = storageKeys.mapStyleId($page.url.host);
	const initiaLayerList: Layer[] = fromLocalStorage(layerListStorageKey, null);
	const initiaMapStyle: StyleSpecification | null = fromLocalStorage(mapStyleStorageKey, null);

	let dialogOpen = false;
	let toUrl: URL = undefined;

	beforeNavigate(({ cancel, to }) => {
		if (!$map) return;
		toUrl = to.url;

		if ($page.url.pathname === toUrl.pathname) {
			return;
		}

		let databaseStyle: DashboardMapStyle = $page.data.style;
		let storageMapStyle = $map?.getStyle();

		if (databaseStyle) {
			if (isStyleChanged(databaseStyle.style, storageMapStyle)) {
				cancel();
				dialogOpen = true;
			}
		} else if (initiaMapStyle && initiaLayerList?.length > 0) {
			if (isStyleChanged(initiaMapStyle, storageMapStyle)) {
				cancel();
				dialogOpen = true;
			}
		} else {
			if ($layerList.length > 0) {
				cancel();
				dialogOpen = true;
			}
		}
	});

	const handleContinue = () => {
		const storageLayerList = $layerList;
		toLocalStorage(layerListStorageKey, storageLayerList);

		let storageMapStyle = $map?.getStyle();
		storageMapStyle.center = [$map.getCenter().lng, $map.getCenter().lat];
		storageMapStyle.zoom = $map.getZoom();
		toLocalStorage(mapStyleStorageKey, storageMapStyle);

		dialogOpen = false;
		window.location.href = toUrl.toString();
	};

	const handleDiscard = () => {
		toLocalStorage(layerListStorageKey, []);
		toLocalStorage(mapStyleStorageKey, null);
		toLocalStorage(mapStyleIdStorageKey, null);
		dialogOpen = false;
		window.location.href = toUrl.toString();
	};

	const handleCancel = () => {
		toUrl = undefined;
		dialogOpen = false;
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Escape') {
			handleCancel();
		}
	};
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<Header bind:headerHeight isPositionFixed={true} />

<div style="margin-top: {headerHeight}px">
	<MenuControl
		bind:map={$map}
		position={sidebarOnLeft ? 'top-left' : 'top-right'}
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
			<slot />
		</div>
	</MenuControl>
</div>

<div class="modal {dialogOpen ? 'is-active' : ''}" data-testid="modal-dialog" transition:fade>
	<div
		class="modal-background"
		role="button"
		tabindex="-1"
		on:click={handleCancel}
		on:keydown={handleKeyDown}
	/>
	<div class="modal-card">
		<header class="modal-card-head">
			<span class="modal-card-title">Unsaved changes. Are you sure leaving map?</span>
			<button
				class="delete"
				aria-label="close"
				title="Close Delete Layer Button"
				on:click={handleCancel}
			/>
		</header>
		<section class="modal-card-body has-text-weight-normal">
			<Notification type="warning" showCloseButton={false}>
				<div class="has-text-weight-medium">
					You have unsaved changes.
					<br />
					Click <b>Keep state</b> button to keep your map state locally.
					<br />
					If you want to discard all changes, click <b>Discard</b>.
					<br />
					If want to save your work to the database, close the dialog to cancel. Then use
					<b>Share</b> feature to save your map before leaving.
				</div>
			</Notification>
		</section>
		<footer class="modal-card-foot is-flex is-flex-direction-row is-justify-content-flex-end">
			<div class="footer-button px-2">
				<button data-testid="cancel-button" class="button is-link" on:click={handleDiscard}>
					Discard
				</button>
			</div>
			<div class="footer-button px-2">
				<button class="button is-primary" on:click={handleContinue}> Keep state </button>
			</div>
		</footer>
	</div>
</div>

<SvelteToast />

<style global lang="scss">
	@import 'bulma-switch/dist/css/bulma-switch.min.css';
	@import 'bulma-divider/dist/css/bulma-divider.min.css';
	@import '/node_modules/flag-icons/css/flag-icons.min.css';
</style>
