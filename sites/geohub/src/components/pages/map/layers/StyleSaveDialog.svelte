<script lang="ts">
	import { invalidateAll, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import { AccessLevel, Permission } from '$lib/config/AppConfig';
	import { storageKeys, toLocalStorage } from '$lib/helper';
	import type { DashboardMapStyle } from '$lib/types';
	import type { LayerListStore } from '$stores';
	import { ModalTemplate, Notification } from '@undp-data/svelte-undp-components';
	import type { Map, StyleSpecification } from 'maplibre-gl';
	import { untrack } from 'svelte';

	let savedStyle: DashboardMapStyle = $state(page.data.style);
	const getDefaultAccessLevel = () => {
		return savedStyle?.access_level ?? AccessLevel.PRIVATE;
	};
	let accessLevel: AccessLevel = $state(getDefaultAccessLevel());

	interface Props {
		map: Map;
		layerList: LayerListStore;
		isModalVisible?: boolean;
		onchange?: (style: DashboardMapStyle) => void;
	}

	let {
		map = $bindable(),
		layerList = $bindable(),
		isModalVisible = $bindable(false),
		onchange = (style) => {
			console.log(style);
		}
	}: Props = $props();

	const getStyleName = () => {
		const names: string[] = [];
		if ($layerList.length > 0) {
			$layerList.forEach((layer) => {
				names.push(layer.name);
			});
		}

		let styleName = '';
		if (savedStyle?.name) {
			styleName = savedStyle?.name;
		} else {
			if (names.length > 0) {
				styleName = `${names[0]}${names.length > 1 ? ', etc.' : ''}`;
			} else {
				styleName = 'UNDP GeoHub style';
			}
		}
		return styleName;
	};

	let styleName: string = $state(getStyleName());
	let exportedStyleJSON: StyleSpecification | undefined = $state();
	let isLoading = $state(false);

	const layerListStorageKey = storageKeys.layerList(page.url.host);
	const mapStyleStorageKey = storageKeys.mapStyle(page.url.host);
	const mapStyleIdStorageKey = storageKeys.mapStyleId(page.url.host);

	let countPrivateLayers = $state(0);
	let countOrganisationLayers = $state(0);

	const isReadOnly = () => {
		return !(
			page.data.session?.user?.email === savedStyle?.created_user ||
			page.data.session?.user?.is_superuser ||
			(savedStyle.permission && savedStyle.permission > Permission.READ)
		);
	};

	const open = () => {
		untrack(() => {
			countPrivateLayers = 0;
			countOrganisationLayers = 0;
			if ($layerList.length > 0) {
				$layerList.forEach((layer) => {
					const dataAccessLevel = layer.dataset?.properties.access_level ?? AccessLevel.PUBLIC;
					if (dataAccessLevel === AccessLevel.PRIVATE) {
						countPrivateLayers += 1;
					} else if (dataAccessLevel === AccessLevel.ORGANIZATION) {
						countOrganisationLayers += 1;
					}
				});
			}
			styleName = getStyleName();
			createStyleJSON2Generate();
		});
	};

	export const save = async () => {
		isLoading = true;
		const savedLayerList = JSON.parse(JSON.stringify($layerList));

		const data = {
			name: exportedStyleJSON?.name,
			style: exportedStyleJSON,
			layers: savedLayerList,
			access_level: accessLevel
		};

		let method = 'POST';
		if (savedStyle?.id && !isReadOnly()) {
			data['id'] = savedStyle.id;
			method = 'PUT';
		}

		const res = await fetch('/api/style', {
			method: method,
			body: JSON.stringify(data)
		});
		savedStyle = await res.json();
		await invalidateAll();
		const styleURL = savedStyle.links.find((l) => l.rel === 'mapedit')?.href;
		styleName = savedStyle.name;

		toLocalStorage(layerListStorageKey, savedStyle.layers);
		toLocalStorage(mapStyleStorageKey, savedStyle.style);
		toLocalStorage(mapStyleIdStorageKey, savedStyle.id);

		const apiUrl = `${styleURL}${page.url.search}${page.url.hash}`;
		replaceState(apiUrl, '');
		invalidateAll().then(() => {
			isLoading = false;

			if (onchange) {
				onchange(savedStyle);
			}
		});
	};

	const updateStyleName = () => {
		if (!exportedStyleJSON) return;
		exportedStyleJSON.name = styleName;
	};

	const createStyleJSON2Generate = () => {
		if (!map) return;
		const style: StyleSpecification = map.getStyle();
		if ($layerList.length === 0) {
			return;
		}

		style.name = styleName;
		const center = map.getCenter();
		style.center = [center.lng, center.lat];
		style.bearing = map.getBearing();
		style.pitch = map.getPitch();
		style.zoom = map.getZoom();
		exportedStyleJSON = style;
	};

	const handleShare = async () => {
		await save();
	};

	$effect(() => {
		if (isModalVisible) {
			open();
		}
	});
</script>

<ModalTemplate
	title="{savedStyle && !isReadOnly() ? 'Update' : 'Save'} map"
	bind:show={isModalVisible}
>
	{#snippet content()}
		<div>
			{#if savedStyle}
				{#if isReadOnly()}
					<div class="mt-2">
						<Notification type="warning" showCloseButton={false}>
							This map was created by other user. It will be saved as new map.
						</Notification>
					</div>
				{:else if page.data.session?.user?.is_superuser}
					<div class="mt-2">
						<Notification type="warning" showCloseButton={false}>
							You are signed in as a super user, and you are going to update the map created by <b
								>{savedStyle.created_user}</b
							>
						</Notification>
					</div>
				{/if}
			{/if}

			<div class="field">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="label">Map title:</label>
				<div class="control">
					<input
						class="input text-stylename"
						type="text"
						placeholder="Style name"
						bind:value={styleName}
						disabled={isLoading}
						onchange={updateStyleName}
					/>
				</div>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="label">Access level </label>
				<div class="control">
					<AccessLevelSwitcher
						bind:accessLevel
						disableOrganisation={countPrivateLayers > 0}
						disablePublic={countPrivateLayers + countOrganisationLayers > 0}
					/>
				</div>
				{#if countPrivateLayers + countOrganisationLayers > 0}
					<p class="help is-danger">
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
					</p>
				{/if}
			</div>

			{#if exportedStyleJSON && exportedStyleJSON.layers.length === 0}
				<article class="message is-warning">
					<div class="message-header">
						<p>Warning</p>
					</div>
					<div class="message-body">
						<p>No layer to be saved</p>
					</div>
				</article>
			{/if}
		</div>
	{/snippet}
	{#snippet buttons()}
		<div class="buttons">
			<button
				class="button is-primary is-uppercase has-text-weight-bold {isLoading ? 'is-loading' : ''}"
				onclick={handleShare}
				disabled={!(exportedStyleJSON && exportedStyleJSON.layers.length > 0)}
			>
				{savedStyle && !isReadOnly() ? 'Update' : 'Save'}
			</button>
		</div>
	{/snippet}
</ModalTemplate>
