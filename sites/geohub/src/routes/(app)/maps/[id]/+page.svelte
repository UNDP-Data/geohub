<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import UserPermission, {
		StylePermissionAPI
	} from '$components/pages/data/datasets/UserPermission.svelte';
	import MapQueryInfoControl from '$components/pages/map/plugins/MapQueryInfoControl.svelte';
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
	import { getAccessLevelIcon, getDomainFromEmail } from '$lib/helper';
	import type { DashboardMapStyle, Layer } from '$lib/types';
	import { LAYERLISTSTORE_CONTEXT_KEY, createLayerListStore, type LayerListStore } from '$stores';
	import MaplibreCgazAdminControl from '@undp-data/cgaz-admin-tool';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import { MaplibreLegendControl } from '@undp-data/svelte-maplibre-storymap';
	import {
		CopyToClipboard,
		FieldControl,
		HeroHeader,
		MAPSTORE_CONTEXT_KEY,
		ModalTemplate,
		Notification,
		createMapStore,
		initTooltipTippy,
		type BreadcrumbPage,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import { MaplibreMeasureControl } from '@watergis/maplibre-gl-terradraw';
	import '@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css';
	import { toast } from '@zerodevx/svelte-toast';
	import {
		AttributionControl,
		FullscreenControl,
		GeolocateControl,
		GlobeControl,
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

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let style = $state(data.style);

	const tippyTooltip = initTooltipTippy();

	let tabs: Tab[] = $state([
		{
			id: `#${TabNames.INFO}`,
			label: TabNames.INFO
		},
		{
			id: `#${TabNames.LINKS}`,
			label: `Share ${TabNames.LINKS}`
		}
	]);

	let activeTab: string = $state(`#${TabNames.INFO}`);

	let mapContainer: HTMLDivElement | undefined = $state();

	let breadcrumbs: BreadcrumbPage[] = $state([
		{ title: 'home', url: '/' },
		{ title: 'maps', url: '/maps' },
		{ title: data.style.name, url: page.url.href }
	]);

	let mapLink = $state('');
	let mapEditLink = $state('');
	let apiLink = '';
	let stylejsonLink = $state('');
	let staticAutoLink = $state('');
	let staticBBOXLink = $state('');
	let staticCenterLink = $state('');

	let isEditDialogVisible = $state(false);
	let editMapTitle = $state('');
	let editAccessLevel: AccessLevel | undefined = $state();
	let countPrivateLayers = $state(0);
	let countOrganisationLayers = $state(0);

	let confirmDeleteDialogVisible = $state(false);
	let deletedStyleName = $state('');
	let isUpdating = $state(false);

	let isQueryToolActive: boolean = $state(true);

	const mapStore = createMapStore();
	setContext(MAPSTORE_CONTEXT_KEY, mapStore);

	const layerListStore: LayerListStore = createLayerListStore();
	setContext(LAYERLISTSTORE_CONTEXT_KEY, layerListStore);

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);
		initializeLinks();
		initializeTabs();
		initialiseMap();
	});

	const initializeLinks = () => {
		mapLink = style.links.find((l) => l.rel === 'map')?.href as string;
		mapEditLink = style.links.find((l) => l.rel === 'mapedit')?.href as string;
		apiLink = style.links.find((l) => l.rel === 'self')?.href as string;
		stylejsonLink = style.links.find((l) => l.rel === 'stylejson')?.href as string;
		staticAutoLink = style.links.find((l) => l.rel === 'static-auto')?.href as string;
		staticBBOXLink = style.links.find((l) => l.rel === 'static-bbox')?.href as string;
		staticCenterLink = style.links.find((l) => l.rel === 'static-center')?.href as string;
	};

	const initializeTabs = () => {
		if (style.permission && style.permission >= Permission.READ) {
			if (!tabs.find((t) => t.label === TabNames.PERMISSIONS)) {
				tabs = [
					...(tabs.filter((t) => t.id !== `#${TabNames.LINKS}`) as Tab[]),
					{
						id: `#${TabNames.PERMISSIONS}`,
						label: TabNames.PERMISSIONS
					},
					tabs.find((t) => t.id === `#${TabNames.LINKS}`) as Tab
				];
			}
		}

		const hash = page.url.hash;
		activeTab = hash.length > 0 && tabs.find((t) => t.id === hash) ? hash : `#${TabNames.INFO}`;
	};

	const initialiseMap = () => {
		if (!mapContainer) return;
		const map = new Map({
			container: mapContainer,
			style: style.style,
			attributionControl: false,
			maxPitch: 85
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

		map.addControl(new GlobeControl(), 'bottom-right');

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

		const measureControl = new MaplibreMeasureControl({
			modes: ['render', 'point', 'linestring', 'polygon', 'select', 'delete-selection', 'delete'],
			open: false,
			computeElevation: true
		});
		measureControl.fontGlyphs = ['Proxima Nova Italic'];
		map.addControl(measureControl, 'bottom-right');

		measureControl.on('mode-changed', (e) => {
			if (['linestring', 'point', 'polygon'].includes(e.mode)) {
				isQueryToolActive = false;
			}
		});

		map.once('load', async () => {
			map.resize();
			await styleSwitcher.initialise();
			layerListStore.set(style.layers as Layer[]);
		});
		mapStore.set(map);
	};

	const openEditDialog = () => {
		editMapTitle = style.name;
		editAccessLevel = style.access_level;

		if (style.layers && style.layers.length > 0) {
			style.layers.forEach((layer) => {
				const dataAccessLevel = layer.dataset?.properties.access_level ?? AccessLevel.PUBLIC;
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
		const styleData: DashboardMapStyle = JSON.parse(JSON.stringify(style));
		styleData.name = editMapTitle;
		styleData.access_level = editAccessLevel as AccessLevel;

		isUpdating = true;
		try {
			const res = await fetch('/api/style', {
				method: 'PUT',
				body: JSON.stringify(styleData)
			});
			if (!res.ok) {
				toast.push(`Failed to update. ${res.status}: ${res.statusText}`);
			}
			style = await res.json();
			data.style = style;
			await invalidateAll();
			isEditDialogVisible = false;
		} finally {
			isUpdating = false;
		}
	};

	const handleResetStyle = () => {
		editMapTitle = style.name;
		editAccessLevel = style.access_level;
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

	const handleDuplicate = async () => {
		isUpdating = true;
		try {
			const copied: DashboardMapStyle = JSON.parse(JSON.stringify(style));

			const body = {
				name: copied.name,
				style: copied.style,
				layers: copied.layers,
				access_level: copied.access_level
			};

			const res = await fetch('/api/style', {
				method: 'POST',
				body: JSON.stringify(body)
			});
			if (!res.ok) {
				toast.push(`Failed to duplicate this map: ${res.statusText} (${res.status}0`);
			}
			style = await res.json();
			data.style = style;
			goto(`/maps/${style?.id as string}`, {
				invalidateAll: true,
				replaceState: false,
				keepFocus: false,
				noScroll: false
			});
			initializeLinks();
			initializeTabs();
			initialiseMap();
		} finally {
			isUpdating = false;
		}
	};
</script>

<HeroHeader
	title={style.name}
	icon={style.access_level < AccessLevel.PUBLIC ? getAccessLevelIcon(style.access_level) : ''}
	bind:breadcrumbs
	bind:tabs
	bind:activeTab
/>

<div class="m-6">
	<div hidden={activeTab !== `#${TabNames.INFO}`}>
		<div class="p-2">
			<div class="buttons mb-2">
				{#if style.layers && style.layers.length > 0}
					<a
						class="button is-link has-text-weight-bold is-uppercase {isUpdating
							? 'is-loading'
							: ''}"
						href={mapEditLink}
						use:tippyTooltip={{ content: 'View this map in GeoHub map editor' }}
					>
						Edit
					</a>
				{/if}

				{#if page.data.session && ((style.permission && style.permission > Permission.READ) || page.data.session.user.is_superuser)}
					<button
						class="button is-link is-outlined is-uppercase has-text-weight-bold {isUpdating
							? 'is-loading'
							: ''}"
						onclick={openEditDialog}
						use:tippyTooltip={{ content: 'Edit metadata of this map' }}
						disabled={isUpdating}
					>
						edit metadata
					</button>
				{/if}

				{#if page.data.session}
					<a
						class="button is-link is-outlined is-uppercase has-text-weight-bold {isUpdating
							? 'is-loading'
							: ''}"
						href="/storymaps/edit?style={style.id}"
						use:tippyTooltip={{ content: 'Create a storymap from this map' }}
					>
						create storymap
					</a>
				{/if}

				{#if page.data.session && style.layers && style.layers.length > 0}
					<button
						class="button is-link is-outlined is-uppercase has-text-weight-bold {isUpdating
							? 'is-loading'
							: ''}"
						onclick={handleDuplicate}
						use:tippyTooltip={{ content: 'Duplicate this map' }}
						disabled={isUpdating}
					>
						duplicate
					</button>
				{/if}

				{#if page.data.session && ((style.permission && style.permission === Permission.OWNER) || page.data.session.user.is_superuser)}
					<button
						class="button is-link is-outlined is-uppercase has-text-weight-bold {isUpdating
							? 'is-loading'
							: ''}"
						onclick={() => (confirmDeleteDialogVisible = true)}
						use:tippyTooltip={{ content: 'Delete this map' }}
						disabled={isUpdating}
					>
						delete
					</button>
				{/if}

				{#key style}
					<Star
						bind:id={style.id}
						bind:isStar={style.is_star}
						bind:no_stars={style.no_stars}
						table="style"
						size="normal"
					/>
				{/key}
			</div>

			<div class="columns">
				<div class="column is-10 is-flex is-flex-direction-column">
					<FieldControl title="Title" fontWeight="bold" showHelp={false}>
						{#snippet control()}
							<div>
								{style.name}
							</div>
						{/snippet}
					</FieldControl>

					<FieldControl title="Preview" fontWeight="bold" showHelp={false}>
						{#snippet control()}
							<div>
								{#if style.layers?.length === 0}
									<div class="pb-4">
										<Notification type="warning" showCloseButton={false}>
											The datasets used in this map seem having beed deleted from the database.
											Please delete this map.
										</Notification>
									</div>
								{/if}
								<div class="map" bind:this={mapContainer}>
									{#if $mapStore}
										<MapQueryInfoControl
											bind:map={$mapStore}
											layerList={layerListStore}
											bind:isActive={isQueryToolActive}
										/>
										<MaplibreLegendControl
											bind:map={$mapStore}
											bind:styleId={style.id}
											position="bottom-left"
										/>
									{/if}
								</div>
							</div>
						{/snippet}
					</FieldControl>
				</div>

				<div class="column is-flex is-flex-direction-column">
					<FieldControl title="Access level" fontWeight="bold" showHelp={false}>
						{#snippet control()}
							<div>
								{#if style.access_level === AccessLevel.PUBLIC}
									Public
								{:else if style.access_level === AccessLevel.PRIVATE}
									Private
								{:else}
									{@const domain = getDomainFromEmail(style.created_user)}
									{@const org = AcceptedOrganisationDomains.find((d) => d.domain === domain)?.name}
									{org?.toUpperCase()}
								{/if}
							</div>
						{/snippet}
					</FieldControl>

					<FieldControl title="Created by" fontWeight="bold" showHelp={false}>
						{#snippet control()}
							<div class="wordwrap">
								{style.created_user}
							</div>
						{/snippet}
					</FieldControl>

					<FieldControl title="Created at" fontWeight="bold" showHelp={false}>
						{#snippet control()}
							<div>
								<Time timestamp={style.createdat} format="HH:mm, MM/DD/YYYY" />
							</div>
						{/snippet}
					</FieldControl>

					{#if style.updated_user}
						<FieldControl title="Updated by" fontWeight="bold" showHelp={false}>
							{#snippet control()}
								<div class="wordwrap">
									{style.updated_user}
								</div>
							{/snippet}
						</FieldControl>
					{/if}

					{#if style.updatedat}
						<FieldControl title="Updated at" fontWeight="bold" showHelp={false}>
							{#snippet control()}
								<div>
									<Time timestamp={style.updatedat} format="HH:mm, MM/DD/YYYY" />
								</div>
							{/snippet}
						</FieldControl>
					{/if}
				</div>
			</div>
		</div>
	</div>

	{#if page.data.session}
		<div hidden={activeTab !== `#${TabNames.PERMISSIONS}`}>
			{#key style}
				<UserPermission api={new StylePermissionAPI(style)} />
			{/key}
		</div>
	{/if}

	<div hidden={activeTab !== `#${TabNames.LINKS}`}>
		<FieldControl title="Copy this link to share the map" fontWeight="bold" showHelp={false}>
			{#snippet control()}
				<div>
					<CopyToClipboard value={mapLink} />
				</div>
			{/snippet}
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
				{#snippet control()}
					<div>
						<CopyToClipboard value={stylejsonLink} />
					</div>
				{/snippet}
			</FieldControl>
		{/if}

		<p class="mt-4 title is-size-5">Static image api</p>
		{#each [staticAutoLink, staticBBOXLink, staticCenterLink] as link, index (index)}
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
				{#snippet control()}
					<div>
						<CopyToClipboard value={link} />
					</div>
				{/snippet}
				{#snippet help()}
					<div>Variables using brackets need to be changed prior to passing to static API</div>
				{/snippet}
			</FieldControl>
		{/each}
	</div>
</div>

{#if isEditDialogVisible}
	<ModalTemplate title="Edit map properties" bind:show={isEditDialogVisible}>
		{#snippet content()}
			<div>
				<FieldControl title="Map title" showHelp={false}>
					{#snippet control()}
						<div>
							<input class="input" type="text" bind:value={editMapTitle} disabled={isUpdating} />
						</div>
					{/snippet}
				</FieldControl>

				<FieldControl
					title="Access level"
					showHelp={countPrivateLayers + countOrganisationLayers > 0}
					showHelpPopup={false}
				>
					{#snippet control()}
						<div>
							<AccessLevelSwitcher
								bind:accessLevel={editAccessLevel as AccessLevel}
								disableOrganisation={countPrivateLayers > 0}
								disablePublic={countPrivateLayers + countOrganisationLayers > 0}
							/>
						</div>
					{/snippet}
					{#snippet help()}
						<div class="help is-danger">
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
								It contains <b
									>{countPrivateLayers} private layer{countPrivateLayers > 1 ? 's' : ''}</b
								>,
							{/if}
							you only can save a <b>private</b> map. This map will not be accessed by other users. To
							make a publicly or organisationally shared map, please change dataset accessibility before
							publishing a community map.
						</div>
					{/snippet}
				</FieldControl>
			</div>
		{/snippet}

		{#snippet buttons()}
			<div>
				<button
					class="button is-link {isUpdating ? 'is-loading' : ''} is-uppercase"
					onclick={handleUpdateStyle}
					disabled={isUpdating ||
						(editMapTitle === style.name && editAccessLevel === style.access_level)}
				>
					update
				</button>
				<button
					class="button {isUpdating ? 'is-loading' : ''} is-uppercase"
					onclick={handleResetStyle}
					disabled={isUpdating ||
						(editMapTitle === style.name && editAccessLevel === style.access_level)}
				>
					reset
				</button>
			</div>
		{/snippet}
	</ModalTemplate>
{/if}

{#if confirmDeleteDialogVisible}
	<ModalTemplate title="Are you sure deleting this map?" bind:show={confirmDeleteDialogVisible}>
		{#snippet content()}
			<div>
				<Notification type="warning" showCloseButton={false}>
					Unexpected bad things will happen if you don't read this!
				</Notification>
				<div class="mt-2">
					This action <b>cannot</b> be undone. This will delete
					<b>{style.name}</b>
					from GeoHub database. It will not be shared again with community.
					<br />
					Please type <b>{style.name}</b> to confirm.
				</div>
				<br />
				<input class="input" type="text" bind:value={deletedStyleName} />
			</div>
		{/snippet}
		{#snippet buttons()}
			<div>
				<button
					class="button is-primary {isUpdating
						? 'is-loading'
						: ''} has-text-weight-bold is-uppercase"
					onclick={handleDeleteStyle}
					disabled={deletedStyleName !== style.name}
				>
					delete this map
				</button>
			</div>
		{/snippet}
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

	.wordwrap {
		overflow-wrap: break-word;
		word-break: break-all;
	}
</style>
