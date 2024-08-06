<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import UserPermission, {
		StylePermissionAPI
	} from '$components/pages/data/datasets/UserPermission.svelte';
	import MapQueryInfoControl from '$components/pages/map/plugins/MapQueryInfoControl.svelte';
	import MaplibreLegendControl from '$components/pages/map/plugins/MaplibreLegendControl.svelte';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import Star from '$components/util/Star.svelte';
	import {
		AcceptedOrganisationDomains,
		AccessLevel,
		AdminControlOptions,
		MapStyles,
		Permission,
		TabNames,
		attribution
	} from '$lib/config/AppConfig';
	import { getAccessLevelIcon, getDomainFromEmail, getSpriteImageList } from '$lib/helper';
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
		FieldControl,
		HeroHeader,
		ModalTemplate,
		Notification,
		type BreadcrumbPage,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import { toast } from '@zerodevx/svelte-toast';
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
	import Time from 'svelte-time';
	import type { PageData } from './$types';

	export let data: PageData;

	let tabs: Tab[] = [
		{
			id: `#${TabNames.INFO}`,
			label: TabNames.INFO
		},
		{
			id: `#${TabNames.LINKS}`,
			label: `Share ${TabNames.LINKS}`
		}
	];

	let activeTab: string = `#${TabNames.INFO}`;

	let mapContainer: HTMLDivElement;
	let mapStyle: DashboardMapStyle = data.style;

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'maps', url: '/maps' },
		{ title: mapStyle.name, url: $page.url.href }
	];

	let mapLink = mapStyle.links.find((l) => l.rel === 'map')?.href;
	let mapEditLink = mapStyle.links.find((l) => l.rel === 'mapedit')?.href;
	let apiLink = mapStyle.links.find((l) => l.rel === 'self')?.href;
	let stylejsonLink = mapStyle.links.find((l) => l.rel === 'stylejson')?.href;
	let staticAutoLink = mapStyle.links.find((l) => l.rel === 'static-auto')?.href;
	let staticBBOXLink = mapStyle.links.find((l) => l.rel === 'static-bbox')?.href;
	let staticCenterLink = mapStyle.links.find((l) => l.rel === 'static-center')?.href;

	let isEditDialogVisible = false;
	let editMapTitle = '';
	let editAccessLevel: AccessLevel;
	let countPrivateLayers = 0;
	let countOrganisationLayers = 0;

	let confirmDeleteDialogVisible = false;
	let deletedStyleName = '';
	let isUpdating = false;

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
		activeTab = hash.length > 0 && tabs.find((t) => t.id === hash) ? hash : `#${TabNames.INFO}`;

		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);
		initialiseMap();
	});

	const initialiseMap = () => {
		const map = new Map({
			container: mapContainer,
			style: mapStyle.style,
			attributionControl: false
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

		const styleSwitcher = new MaplibreStyleSwitcherControl(MapStyles, {
			defaultStyle: MapStyles[0].title
		});
		map.addControl(styleSwitcher, 'bottom-left');

		map.once('load', async () => {
			map.resize();

			await styleSwitcher.initialise();

			const spriteUrl = map.getStyle().sprite as string;
			const iconList = await getSpriteImageList(spriteUrl);
			spriteImageList.update(() => iconList);

			layerListStore.set(mapStyle.layers);
		});
		mapStore.set(map);
	};

	const openEditDialog = () => {
		editMapTitle = mapStyle.name;
		editAccessLevel = mapStyle.access_level;

		if (mapStyle.layers.length > 0) {
			mapStyle.layers.forEach((layer) => {
				const dataAccessLevel = layer.dataset.properties.access_level ?? AccessLevel.PUBLIC;
				if (dataAccessLevel === AccessLevel.PRIVATE) {
					countPrivateLayers += 1;
				} else if (dataAccessLevel === AccessLevel.ORGANIZATION) {
					countOrganisationLayers += 1;
				}
			});
		}

		isEditDialogVisible = true;
	};

	const handleUpdateStyle = async () => {
		const styleData: DashboardMapStyle = JSON.parse(JSON.stringify(mapStyle));
		styleData.name = editMapTitle;
		styleData.access_level = editAccessLevel;

		isUpdating = true;
		try {
			const res = await fetch('/api/style', {
				method: 'PUT',
				body: JSON.stringify(styleData)
			});
			if (!res.ok) {
				toast.push(`Failed to update. ${res.status}: ${res.statusText}`);
			}
			mapStyle = await res.json();
			await invalidateAll();
			mapStyle = data.style;
			isEditDialogVisible = false;
		} finally {
			isUpdating = false;
		}
	};

	const handleResetStyle = () => {
		editMapTitle = mapStyle.name;
		editAccessLevel = mapStyle.access_level;
	};

	const handleDeleteStyle = async () => {
		if (!apiLink) return;
		isUpdating = true;
		try {
			const res = await fetch(apiLink, {
				method: 'DELETE'
			});
			if (res.ok) {
				confirmDeleteDialogVisible = false;

				goto('/maps', {
					invalidateAll: true,
					replaceState: true
				});
			}
		} finally {
			isUpdating = false;
		}
	};
</script>

<HeroHeader
	title={mapStyle.name}
	icon={mapStyle.access_level < AccessLevel.PUBLIC ? getAccessLevelIcon(mapStyle.access_level) : ''}
	bind:breadcrumbs
	bind:tabs
	bind:activeTab
/>

<div class="mx-6 my-4">
	<div hidden={activeTab !== `#${TabNames.INFO}`}>
		<div class="p-2">
			<div class="buttons mb-2">
				{#if mapStyle.layers?.length > 0}
					<a class="button is-link has-text-weight-bold is-uppercase" href={mapEditLink}> View </a>
				{/if}

				{#if $page.data.session && ((mapStyle.permission && mapStyle.permission > Permission.READ) || $page.data.session.user.is_superuser)}
					<button
						class="button is-link is-uppercase has-text-weight-bold"
						on:click={openEditDialog}
					>
						edit
					</button>
				{/if}

				{#if $page.data.session && ((mapStyle.permission && mapStyle.permission === Permission.OWNER) || $page.data.session.user.is_superuser)}
					<button
						class="button is-link is-uppercase has-text-weight-bold"
						on:click={() => (confirmDeleteDialogVisible = true)}
					>
						delete
					</button>
				{/if}

				{#key mapStyle}
					<Star
						bind:id={mapStyle.id}
						bind:isStar={mapStyle.is_star}
						bind:no_stars={mapStyle.no_stars}
						table="style"
						size="normal"
					/>
				{/key}
			</div>

			<div class="columns">
				<div class="column is-10 is-flex is-flex-direction-column">
					<FieldControl title="Title" fontWeight="bold" showHelp={false}>
						<div slot="control">
							{mapStyle.name}
						</div>
					</FieldControl>

					<FieldControl title="Preview" fontWeight="bold" showHelp={false}>
						<div slot="control">
							{#if mapStyle.layers?.length === 0}
								<div class="pb-4">
									<Notification type="warning" showCloseButton={false}>
										The datasets used in this map seem having beed deleted from the database. Please
										delete this map.
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
					</FieldControl>
				</div>

				<div class="column is-flex is-flex-direction-column">
					<FieldControl title="Access level" fontWeight="bold" showHelp={false}>
						<div slot="control">
							{#if mapStyle.access_level === AccessLevel.PUBLIC}
								Public
							{:else if mapStyle.access_level === AccessLevel.PRIVATE}
								Private
							{:else}
								{@const domain = getDomainFromEmail(mapStyle.created_user)}
								{@const org = AcceptedOrganisationDomains.find((d) => d.domain === domain).name}
								{org.toUpperCase()}
							{/if}
						</div>
					</FieldControl>

					<FieldControl title="Created by" fontWeight="bold" showHelp={false}>
						<div slot="control">
							{mapStyle.created_user}
						</div>
					</FieldControl>

					<FieldControl title="Created at" fontWeight="bold" showHelp={false}>
						<div slot="control">
							<Time timestamp={mapStyle.createdat} format="HH:mm, MM/DD/YYYY" />
						</div>
					</FieldControl>

					{#if mapStyle.updated_user}
						<FieldControl title="Updated by" fontWeight="bold" showHelp={false}>
							<div slot="control">
								{mapStyle.updated_user}
							</div>
						</FieldControl>
					{/if}

					{#if mapStyle.updatedat}
						<FieldControl title="Updated at" fontWeight="bold" showHelp={false}>
							<div slot="control">
								<Time timestamp={mapStyle.updatedat} format="HH:mm, MM/DD/YYYY" />
							</div>
						</FieldControl>
					{/if}
				</div>
			</div>
		</div>
	</div>

	{#if $page.data.session}
		<div hidden={activeTab !== `#${TabNames.PERMISSIONS}`}>
			<UserPermission api={new StylePermissionAPI(mapStyle)} />
		</div>
	{/if}

	<div hidden={activeTab !== `#${TabNames.LINKS}`}>
		<FieldControl title="Copy this link to share the map" fontWeight="bold" showHelp={false}>
			<div slot="control">
				<CopyToClipboard value={mapLink} />
			</div>
		</FieldControl>

		<hr />
		<p class="mt-4 title is-5">For developers</p>
		{#if stylejsonLink}
			<FieldControl
				title="Map style URL"
				isFirstCharCapitalized={false}
				fontWeight="bold"
				showHelp={false}
			>
				<div slot="control">
					<CopyToClipboard value={stylejsonLink} />
				</div>
			</FieldControl>
		{/if}

		<p class="mt-4 title is-size-5">Static image api</p>
		{#each [staticAutoLink, staticBBOXLink, staticCenterLink] as link, index}
			<FieldControl
				title="Static image api ({index === 0
					? 'Auto centered'
					: index === 1
						? 'BBOX centered'
						: 'Manually centered'})"
				isFirstCharCapitalized={false}
				fontWeight="bold"
				showHelp={true}
				showHelpPopup={false}
			>
				<div slot="control">
					<CopyToClipboard value={link} />
				</div>
				<div slot="help">
					Variables using brackets need to be changed prior to passing to static API
				</div>
			</FieldControl>
		{/each}
	</div>
</div>

{#if isEditDialogVisible}
	<ModalTemplate title="Edit map properties" bind:show={isEditDialogVisible}>
		<div slot="content">
			<FieldControl title="Map title" showHelp={false}>
				<div slot="control">
					<input class="input" type="text" bind:value={editMapTitle} disabled={isUpdating} />
				</div>
			</FieldControl>

			<FieldControl
				title="Access level"
				showHelp={countPrivateLayers + countOrganisationLayers > 0}
				showHelpPopup={false}
			>
				<div slot="control">
					<AccessLevelSwitcher
						bind:accessLevel={editAccessLevel}
						disableOrganisation={countPrivateLayers > 0}
						disablePublic={countPrivateLayers + countOrganisationLayers > 0}
					/>
				</div>
				<div class="help is-danger" slot="help">
					{#if countPrivateLayers > 0 && countOrganisationLayers > 0}
						{@const counts = countPrivateLayers + countOrganisationLayers}
						It contains <b>{countPrivateLayers} private layer{counts > 1 ? 's' : ''}</b> and
						<b>{countOrganisationLayers} organization layer{counts > 1 ? 's' : ''}</b>,
					{:else if countPrivateLayers === 0 && countOrganisationLayers > 0}
						It contains <b
							>{countOrganisationLayers} organization layer{countOrganisationLayers > 1
								? 's'
								: ''}</b
						>,
					{:else if countPrivateLayers > 0 && countOrganisationLayers === 0}
						It contains <b>{countPrivateLayers} private layer{countPrivateLayers > 1 ? 's' : ''}</b
						>,
					{/if}
					you only can save a <b>private</b> map. This map will not be accessed by other users. To make
					a publicly or organisationally shared map, please change dataset accessibility before publishing
					a community map.
				</div>
			</FieldControl>
		</div>

		<div slot="buttons">
			<button
				class="button is-primary {isUpdating ? 'is-loading' : ''} is-uppercase"
				on:click={handleUpdateStyle}
				disabled={isUpdating ||
					(editMapTitle === mapStyle.name && editAccessLevel === mapStyle.access_level)}
			>
				update
			</button>
			<button
				class="button is-link {isUpdating ? 'is-loading' : ''} is-uppercase"
				on:click={handleResetStyle}
				disabled={isUpdating ||
					(editMapTitle === mapStyle.name && editAccessLevel === mapStyle.access_level)}
			>
				reset
			</button>
		</div>
	</ModalTemplate>
{/if}

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
				class="button is-primary {isUpdating ? 'is-loading' : ''} has-text-weight-bold is-uppercase"
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
