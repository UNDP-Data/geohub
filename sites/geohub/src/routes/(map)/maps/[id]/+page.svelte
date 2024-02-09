<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import UserPermission, {
		StylePermissionAPI
	} from '$components/pages/data/datasets/UserPermission.svelte';
	import MapQueryInfoControl from '$components/pages/map/plugins/MapQueryInfoControl.svelte';
	import MaplibreLegendControl from '$components/pages/map/plugins/MaplibreLegendControl.svelte';
	import Breadcrumbs, { type BreadcrumbPage } from '$components/util/Breadcrumbs.svelte';
	import ModalTemplate from '$components/util/ModalTemplate.svelte';
	import Notification from '$components/util/Notification.svelte';
	import Star from '$components/util/Star.svelte';
	import Tabs, { type Tab } from '$components/util/Tabs.svelte';
	import {
		AccessLevel,
		AdminControlOptions,
		MapStyles,
		Permission,
		TabNames,
		attribution
	} from '$lib/config/AppConfig';
	import { getAccessLevelIcon, getSpriteImageList } from '$lib/helper';
	import type { DashboardMapStyle } from '$lib/types';
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
	import MaplibreCgazAdminControl from '@undp-data/cgaz-admin-tool';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import { CopyToClipboard } from '@undp-data/svelte-copy-to-clipboard';
	import {
		AttributionControl,
		FullscreenControl,
		GeolocateControl,
		Map,
		NavigationControl,
		ScaleControl,
		TerrainControl,
		addProtocol
	} from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount, setContext } from 'svelte';
	import Time from 'svelte-time/src/Time.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let tabs: Tab[] = [
		{
			id: `#${TabNames.INFO}`,
			label: TabNames.INFO
		},
		{
			id: `#${TabNames.PREVIEW}`,
			label: TabNames.PREVIEW
		},
		{
			id: `#${TabNames.LINKS}`,
			label: TabNames.LINKS
		}
	];

	let activeTab: string = `#${TabNames.PREVIEW}`;

	let mapContainer: HTMLDivElement;
	let mapStyle: DashboardMapStyle = data.style;

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: mapStyle.name, url: $page.url.href }
	];

	let mapLink = mapStyle.links.find((l) => l.rel === 'map')?.href;
	let mapEditLink = mapStyle.links.find((l) => l.rel === 'mapedit')?.href;
	let apiLink = mapStyle.links.find((l) => l.rel === 'self')?.href;
	let stylejsonLink = mapStyle.links.find((l) => l.rel === 'stylejson')?.href;
	let staticAutoLink = mapStyle.links.find((l) => l.rel === 'static-auto')?.href;
	let staticBBOXLink = mapStyle.links.find((l) => l.rel === 'static-bbox')?.href;
	let staticCenterLink = mapStyle.links.find((l) => l.rel === 'static-center')?.href;

	let confirmDeleteDialogVisible = false;
	let deletedStyleName = '';
	let isDeleting = false;

	const mapStore = createMapStore();
	setContext(MAPSTORE_CONTEXT_KEY, mapStore);

	let layerListStore: LayerListStore = createLayerListStore();
	setContext(LAYERLISTSTORE_CONTEXT_KEY, layerListStore);

	const spriteImageList: SpriteImageStore = createSpriteImageStore();
	setContext(SPRITEIMAGE_CONTEXT_KEY, spriteImageList);

	onMount(() => {
		if (mapStyle.permission && mapStyle.permission >= Permission.READ) {
			tabs = [
				...tabs.filter((t) => t.id !== `#${TabNames.LINKS}`),
				{
					id: `#${TabNames.PERMISSIONS}`,
					label: TabNames.PERMISSIONS
				},
				tabs.find((t) => t.id === `#${TabNames.LINKS}`)
			];
		}

		const hash = $page.url.hash;
		activeTab = hash.length > 0 && tabs.find((t) => t.id === hash) ? hash : `#${TabNames.PREVIEW}`;

		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);
		initialiseMap();
	});

	const initialiseMap = () => {
		$mapStore = new Map({
			container: mapContainer,
			style: mapStyle.style,
			attributionControl: false
		});

		$mapStore.addControl(new FullscreenControl(), 'top-right');

		$mapStore.addControl(
			new AttributionControl({ compact: true, customAttribution: attribution }),
			'bottom-right'
		);
		$mapStore.addControl(
			new NavigationControl({
				visualizePitch: true,
				showZoom: true,
				showCompass: true
			}),
			'bottom-right'
		);
		$mapStore.addControl(
			new GeolocateControl({
				positionOptions: { enableHighAccuracy: true },
				trackUserLocation: true
			}),
			'bottom-right'
		);
		$mapStore.setMaxPitch(85);
		$mapStore.addControl(
			new TerrainControl({
				source: 'terrarium',
				exaggeration: 1
			}),
			'bottom-right'
		);

		$mapStore.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');

		$mapStore.addControl(new MaplibreCgazAdminControl(AdminControlOptions), 'top-left');

		const styleSwitcher = new MaplibreStyleSwitcherControl(MapStyles);
		$mapStore.addControl(styleSwitcher, 'bottom-left');

		$mapStore.once('load', async () => {
			$mapStore.resize();

			const spriteUrl = $mapStore.getStyle().sprite as string;
			const iconList = await getSpriteImageList(spriteUrl);
			spriteImageList.update(() => iconList);

			$layerListStore = mapStyle.layers;
		});
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

<div class="has-background-light px-6 pt-4">
	<div class="py-4">
		<Breadcrumbs pages={breadcrumbs} />
	</div>

	<p class="title is-3 mt-6 mb-4">
		{#if mapStyle.access_level < AccessLevel.PUBLIC}
			<i class="{getAccessLevelIcon(mapStyle.access_level)} p-1 pr-2" />
		{/if}
		{mapStyle.name}
	</p>

	<div class="is-fullwidth">
		<Tabs
			size="is-normal"
			isBoxed={false}
			isFullwidth={false}
			isCentered={false}
			bind:tabs
			bind:activeTab
			isUppercase={true}
			fontWeight="bold"
		/>
	</div>
</div>

<div class="mx-6 my-4">
	<div hidden={activeTab !== `#${TabNames.INFO}`}>
		<div class="p-2">
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
	</div>

	<div hidden={activeTab !== `#${TabNames.PREVIEW}`}>
		<div class="buttons mb-2">
			<Star
				bind:id={mapStyle.id}
				bind:isStar={mapStyle.is_star}
				bind:no_stars={mapStyle.no_stars}
				table="style"
				size="normal"
			/>

			{#if $page.data.session && ((mapStyle.permission && mapStyle.permission === Permission.OWNER) || $page.data.session.user.is_superuser)}
				<button class="button" on:click={() => (confirmDeleteDialogVisible = true)}>
					<span class="icon">
						<i class="fa-solid fa-trash"></i>
					</span>
					<span>Delete</span>
				</button>
			{/if}

			{#if mapStyle.layers?.length > 0}
				<a class="button is-primary ml-auto" href={mapEditLink}>
					<span class="icon">
						<i class="fa-solid fa-map"></i>
					</span>
					<span> Open </span>
				</a>
			{/if}
		</div>

		{#if mapStyle.layers?.length === 0}
			<div class="pb-4">
				<Notification type="warning" showCloseButton={false}>
					The datasets used in this map seem having beed deleted from the database. Please delete
					this map.
				</Notification>
			</div>
		{/if}

		<div class="map" bind:this={mapContainer}>
			{#if $mapStore}
				<MapQueryInfoControl bind:map={$mapStore} bind:layerList={layerListStore} />
				<MaplibreLegendControl bind:map={$mapStore} bind:layerList={layerListStore} />
			{/if}
		</div>
	</div>

	{#if $page.data.session}
		<div hidden={activeTab !== `#${TabNames.PERMISSIONS}`}>
			<UserPermission api={new StylePermissionAPI(mapStyle)} />
		</div>
	{/if}

	<div hidden={activeTab !== `#${TabNames.LINKS}`}>
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Copy this link to share the map</label>
			<div class="control">
				<CopyToClipboard value={mapLink} />
			</div>
		</div>

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

		<p class="mt-4 title is-size-5">Static image api</p>
		{#each [staticAutoLink, staticBBOXLink, staticCenterLink] as link, index}
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">
					{#if index === 0}
						Static image api (Auto centered)
					{:else if index === 1}
						Static image api (BBOX centered)
					{:else}
						Static image api (Manually centered)
					{/if}
				</label>
				<div class="control">
					<CopyToClipboard value={link} />
				</div>
				<p class="help">
					Variables using brackets need to be changed prior to passing to static API
				</p>
			</div>
		{/each}
	</div>
</div>

{#if confirmDeleteDialogVisible}
	<ModalTemplate title="Are you sure deleting this map?" bind:show={confirmDeleteDialogVisible}>
		<div slot="content">
			<Notification type="warning" showCloseButton={false}>
				Unexpected bad things will happen if you don't read this!
			</Notification>
			<div class="mt-2">
				This action <b>cannot</b> be undone. This will delete
				<b>{mapStyle.name}</b>
				from GeoHub database. It will not be shared again with community.
				<br />
				Please type <b>{mapStyle.name}</b> to confirm.
			</div>
			<br />
			<input class="input" type="text" bind:value={deletedStyleName} />
		</div>
		<div slot="buttons">
			<button
				class="button is-primary {isDeleting ? 'is-loading' : ''} is-uppercase"
				on:click={handleDeleteStyle}
				disabled={deletedStyleName !== mapStyle.name}
			>
				delete this map
			</button>
		</div>
	</ModalTemplate>
{/if}

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';
	@import '@undp-data/cgaz-admin-tool/dist/maplibre-cgaz-admin-control.css';
	@import '@undp-data/style-switcher/dist/maplibre-style-switcher.css';

	.map {
		position: relative;
		width: 100%;
		height: calc(70vh);
	}
</style>
