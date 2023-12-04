<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import BackToPreviousPage from '$components/util/BackToPreviousPage.svelte';
	import Notification from '$components/util/Notification.svelte';
	import Star from '$components/util/Star.svelte';
	import { AccessLevel, AdminControlOptions, MapStyles, attribution } from '$lib/config/AppConfig';
	import { getAccessLevelIcon } from '$lib/helper';
	import type { DashboardMapStyle } from '$lib/types';
	import MaplibreCgazAdminControl from '@undp-data/cgaz-admin-tool';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import { CopyToClipboard } from '@undp-data/svelte-copy-to-clipboard';
	import { Accordion } from '@undp-data/svelte-undp-design';
	import maplibregl, {
		AttributionControl,
		FullscreenControl,
		GeolocateControl,
		Map,
		NavigationControl,
		ScaleControl,
		TerrainControl
	} from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount } from 'svelte';
	import Time from 'svelte-time/src/Time.svelte';
	import { clickOutside } from 'svelte-use-click-outside';
	import { fade } from 'svelte/transition';
	import type { PageData } from './$types';

	let protocol = new pmtiles.Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);

	export let data: PageData;

	let mapContainer: HTMLDivElement;
	let mapStyle: DashboardMapStyle = data.style;

	let mapLink = mapStyle.links.find((l) => l.rel === 'map')?.href;
	let mapEditLink = mapStyle.links.find((l) => l.rel === 'mapedit')?.href;
	let apiLink = mapStyle.links.find((l) => l.rel === 'self')?.href;
	let stylejsonLink = mapStyle.links.find((l) => l.rel === 'stylejson')?.href;

	let confirmDeleteDialogVisible = false;
	let deletedStyleName = '';
	let isDeleting = false;

	let showShareLink = false;

	let map: Map;

	onMount(() => {
		initialiseMap();
	});

	const initialiseMap = () => {
		map = new Map({
			container: mapContainer,
			style: mapStyle.style
		});

		map.addControl(new FullscreenControl(), 'top-right');

		map.addControl(
			new AttributionControl({ compact: true, customAttribution: attribution }),
			'bottom-right'
		);
		map.addControl(
			new NavigationControl({
				visualizePitch: true,
				showZoom: true,
				showCompass: true
			}),
			'bottom-right'
		);
		map.addControl(
			new GeolocateControl({
				positionOptions: { enableHighAccuracy: true },
				trackUserLocation: true
			}),
			'bottom-right'
		);
		map.setMaxPitch(85);
		map.addControl(
			new TerrainControl({
				source: 'terrarium',
				exaggeration: 1
			}),
			'bottom-right'
		);

		map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');

		map.addControl(new MaplibreCgazAdminControl(AdminControlOptions), 'top-left');

		const styleSwitcher = new MaplibreStyleSwitcherControl(MapStyles);
		map.addControl(styleSwitcher, 'bottom-left');
	};

	const handleDeleteStyle = async () => {
		if (!apiLink) return;
		isDeleting = true;
		try {
			const res = await fetch(apiLink, {
				method: 'DELETE'
			});
			if (res.ok) {
				confirmDeleteDialogVisible = false;

				goto('/#maps', {
					invalidateAll: true,
					replaceState: true
				});
			}
		} finally {
			isDeleting = false;
		}
	};
</script>

<div class="p-4">
	<div class="pb-4"><BackToPreviousPage defaultLink="/" /></div>

	<h1 class="title is-flex is-align-items-center">
		{#if mapStyle.access_level < AccessLevel.PUBLIC}
			<i class="{getAccessLevelIcon(mapStyle.access_level)} p-1 pr-2" />
		{/if}
		{mapStyle.name}
	</h1>

	<div class="is-flex">
		<div class="buttons">
			<Star
				bind:id={mapStyle.id}
				bind:isStar={mapStyle.is_star}
				bind:no_stars={mapStyle.no_stars}
				table="style"
				size="normal"
			/>

			<button
				class="button {showShareLink ? 'is-link' : ''}"
				on:click={() => (showShareLink = !showShareLink)}
			>
				<span class="icon">
					<i class="fa-solid fa-share"></i>
				</span>
				<span>Share</span>
			</button>

			{#if $page.data.session && (mapStyle.created_user === $page.data.session.user.email || $page.data.session.user.is_superuser)}
				<button class="button" on:click={() => (confirmDeleteDialogVisible = true)}>
					<span class="icon">
						<i class="fa-solid fa-trash"></i>
					</span>
					<span>Delete</span>
				</button>
			{/if}
		</div>

		<div class="align-right">
			<a class="button is-primary" href={mapEditLink}>
				<span class="icon">
					<i class="fa-solid fa-map"></i>
				</span>
				<span> Open </span>
			</a>
		</div>
	</div>

	<div hidden={!showShareLink}>
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Copy this link to share the map</label>
			<div class="control">
				<CopyToClipboard value={mapLink} />
			</div>
		</div>
	</div>

	<Accordion headerTitle="Metadata">
		<div class="p-2" slot="content">
			<table class="table is-striped is-narrow is-hoverable is-fullwidth">
				<thead>
					<tr>
						<th>Item</th>
						<td>Description</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Created at</td>
						<td><Time timestamp={mapStyle.createdat} format="h:mm A · MMMM D, YYYY" /></td>
					</tr>
					<tr>
						<td>Created by</td>
						<td>{mapStyle.created_user}</td>
					</tr>
					{#if mapStyle.updatedat}
						<tr>
							<td>Updated at</td>
							<td><Time timestamp={mapStyle.updatedat} format="h:mm A · MMMM D, YYYY" /></td>
						</tr>
					{/if}
					{#if mapStyle.updated_user}
						<tr>
							<td>Updated by</td>
							<td>{mapStyle.updated_user}</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</Accordion>

	<div class="map mt-2" bind:this={mapContainer} />

	<hr />
	<p class="mt-4 title is-5">For developers</p>
	{#if stylejsonLink}
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Map style URL</label>
			<div class="control">
				<CopyToClipboard value={stylejsonLink} />
			</div>
		</div>
	{/if}
</div>

{#if confirmDeleteDialogVisible}
	<div
		class="modal is-active"
		transition:fade|global
		use:clickOutside={() => (confirmDeleteDialogVisible = false)}
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="modal-background" on:click={() => (confirmDeleteDialogVisible = false)} />
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title">Are you sure deleting this map?</p>
				<button
					class="delete"
					aria-label="close"
					title="Close"
					on:click={() => (confirmDeleteDialogVisible = false)}
				/>
			</header>
			<section class="modal-card-body is-size-6">
				<Notification type="warning" showCloseButton={false}>
					Unexpected bad things will happen if you don't read this!
				</Notification>
				<div class="has-text-weight-medium mt-2 mx-1">
					This action <b>cannot</b> be undone. This will delete
					<b>{mapStyle.name}</b>
					from GeoHub database. It will not be shared again with community.
					<br />
					Please type <b>{mapStyle.name}</b> to confirm.
				</div>
				<br />
				<input class="input" type="text" bind:value={deletedStyleName} />
			</section>
			<footer class="modal-card-foot">
				<button
					class="button is-primary is-fullwidth {isDeleting ? 'is-loading' : ''}"
					on:click={handleDeleteStyle}
					disabled={deletedStyleName !== mapStyle.name}
				>
					I understand the consequences, delete this map
				</button>
			</footer>
		</div>
	</div>
{/if}

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';
	@import '@undp-data/cgaz-admin-tool/dist/maplibre-cgaz-admin-control.css';
	@import '@undp-data/style-switcher/dist/maplibre-style-switcher.css';

	.map {
		position: relative;
		width: 100%;
		height: calc(60vh);
	}

	.align-right {
		margin-left: auto;
	}
</style>
