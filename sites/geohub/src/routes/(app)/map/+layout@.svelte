<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import * as pmtiles from 'pmtiles';
	import maplibregl, { type StyleSpecification } from 'maplibre-gl';
	import Header from '$components/Header.svelte';
	import { fromLocalStorage, isStyleChanged, storageKeys, toLocalStorage } from '$lib/helper';
	import { layerList, map } from '$stores';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { DashboardMapStyle, Layer } from '$lib/types';
	import Notification from '$components/controls/Notification.svelte';
	import { fade } from 'svelte/transition';

	let headerHeight: number;

	let protocol = new pmtiles.Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);

	const layerListStorageKey = storageKeys.layerList($page.url.host);
	const mapStyleStorageKey = storageKeys.mapStyle($page.url.host);
	const mapStyleIdStorageKey = storageKeys.mapStyleId($page.url.host);
	const initialLayerList: Layer[] | null = fromLocalStorage(layerListStorageKey, null);
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
		} else if (initiaMapStyle) {
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
		goto(toUrl.toString());
	};

	const handleDiscard = () => {
		toLocalStorage(layerListStorageKey, []);
		toLocalStorage(mapStyleStorageKey, null);
		toLocalStorage(mapStyleIdStorageKey, null);
		dialogOpen = false;
		goto(toUrl.toString());
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

	$: if ($map) {
		$map.once('load', () => {
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
				toLocalStorage(mapStyleStorageKey, storageValue);
			});
		});
	}
</script>

<svelte:head>
	<style type="text/css">
		html,
		body {
			margin: 0;
			padding: 0;
			min-height: 100vh;
			/* mobile viewport bug fix */
			min-height: -webkit-fill-available;
			font-family: ProximaNova, sans-serif;
			font-size: 13px;
		}

		html {
			overflow-y: hidden !important;
			height: -webkit-fill-available;
		}
	</style>
</svelte:head>

<Header bind:headerHeight />

<div style="margin-top: {headerHeight}px">
	<slot />
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
					You have unsaved changes. Click 'Keep state' button to keep your map state locally. If you
					want to discard all changes, click 'Discard'. If want to save your work to the database,
					close the dialog to cancel.
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
	@import '@undp-data/undp-bulma/bulma.scss';
	@import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';
	@import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';
	@import 'bulma-switch/dist/css/bulma-switch.min.css';
	@import 'bulma-divider/dist/css/bulma-divider.min.css';
	@import '/node_modules/flag-icons/css/flag-icons.min.css';
</style>
