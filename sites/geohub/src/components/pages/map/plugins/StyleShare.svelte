<script lang="ts">
	import { invalidateAll, replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import ModalTemplate from '$components/util/ModalTemplate.svelte';
	import { AccessLevel, Permission } from '$lib/config/AppConfig';
	import { storageKeys, toLocalStorage } from '$lib/helper';
	import type { DashboardMapStyle } from '$lib/types';
	import type { LayerListStore } from '$stores';
	import { CopyToClipboard } from '@undp-data/svelte-copy-to-clipboard';
	import { Notification, ShowDetails } from '@undp-data/svelte-undp-components';
	import type { Map, StyleSpecification } from 'maplibre-gl';

	let savedStyle: DashboardMapStyle = $page.data.style;
	let accessLevel: AccessLevel = savedStyle?.access_level ?? AccessLevel.PRIVATE;
	let showDetails = true;
	let styleId = savedStyle?.id;

	export let map: Map;
	export let layerList: LayerListStore;
	export let isModalVisible = false;

	let styleName: string;
	let exportedStyleJSON: StyleSpecification;
	let shareLoading = false;

	const layerListStorageKey = storageKeys.layerList($page.url.host);
	const mapStyleStorageKey = storageKeys.mapStyle($page.url.host);
	const mapStyleIdStorageKey = storageKeys.mapStyleId($page.url.host);

	$: if (isModalVisible) {
		open();
	}

	let countPrivateLayers = 0;
	let countOrganisationLayers = 0;

	const isReadOnly = () => {
		return !(
			$page.data.session?.user?.email === savedStyle?.created_user ||
			$page.data.session?.user?.is_superuser ||
			(savedStyle.permission && savedStyle.permission > Permission.READ)
		);
	};

	const open = () => {
		countPrivateLayers = 0;
		countOrganisationLayers = 0;
		const names: string[] = [];
		if ($layerList.length > 0) {
			$layerList.forEach((layer) => {
				names.push(layer.name);

				const dataAccessLevel = layer.dataset.properties.access_level ?? AccessLevel.PUBLIC;
				if (dataAccessLevel === AccessLevel.PRIVATE) {
					countPrivateLayers += 1;
				} else if (dataAccessLevel === AccessLevel.ORGANIZATION) {
					countOrganisationLayers += 1;
				}
			});

			if (savedStyle?.name) {
				styleName = savedStyle?.name;
			} else {
				if (names.length > 0) {
					styleName = `${names[0]}${names.length > 1 ? ', etc.' : ''}`;
				} else {
					styleName = 'UNDP GeoHub style';
				}
			}
		}
		createStyleJSON2Generate();
	};

	export const share = async () => {
		shareLoading = true;
		const savedLayerList = JSON.parse(JSON.stringify($layerList));

		const data = {
			name: exportedStyleJSON.name,
			style: exportedStyleJSON,
			layers: savedLayerList,
			access_level: accessLevel
		};

		styleId = savedStyle?.id;

		let method = 'POST';
		if (styleId && !isReadOnly()) {
			data['id'] = styleId;
			method = 'PUT';
		}

		const res = await fetch('/api/style', {
			method: method,
			body: JSON.stringify(data)
		});
		savedStyle = await res.json();
		await invalidateAll();
		const styleURL = savedStyle.links.find((l) => l.rel === 'mapedit').href;
		showDetails = false;
		styleName = savedStyle.name;

		toLocalStorage(layerListStorageKey, savedStyle.layers);
		toLocalStorage(mapStyleStorageKey, savedStyle.style);
		styleId = savedStyle.id;
		toLocalStorage(mapStyleIdStorageKey, styleId);

		const apiUrl = `${styleURL}${$page.url.search}${$page.url.hash}`;
		replaceState(apiUrl, '');
		shareLoading = false;
	};

	$: styleName, updateStyleName();

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
		await share();
	};
</script>

<ModalTemplate
	title="{savedStyle && !isReadOnly() ? 'Update' : 'Share'} map"
	bind:show={isModalVisible}
>
	<div slot="content">
		{#if savedStyle}
			{@const styleURL = savedStyle?.links.find((l) => l.rel === 'map').href}
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">URL:</label>
			<div class="control">
				<CopyToClipboard value={styleURL} isMultiline={false} width="100%" />
			</div>
			<p class="help is-link">
				This map is shared through the above URL. You can share it with your colleagues.
			</p>

			{#if isReadOnly()}
				<div class="mt-2">
					<Notification type="warning" showCloseButton={false}>
						This map was created by other user. It will be saved as new map.
					</Notification>
				</div>
			{:else if $page.data.session?.user?.is_superuser}
				<div class="mt-2">
					<Notification type="warning" showCloseButton={false}>
						You are signed in as a super user, and you are going to update the map created by <b
							>{savedStyle.created_user}</b
						>
					</Notification>
				</div>
			{/if}
			<div class="my-2">
				<ShowDetails bind:show={showDetails} />
			</div>
		{/if}

		{#if showDetails}
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Map name:</label>
				<div class="control">
					<input
						class="input text-stylename"
						type="text"
						placeholder="Style name"
						bind:value={styleName}
						disabled={shareLoading}
					/>
				</div>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Saved map will be published to: </label>
				<div class="control">
					<AccessLevelSwitcher
						bind:accessLevel
						disableOrganisation={countPrivateLayers > 0}
						disablePublic={countPrivateLayers + countOrganisationLayers > 0}
					/>
				</div>
				{#if countPrivateLayers + countOrganisationLayers > 0}
					<p class="help is-danger">
						{#if countPrivateLayers + countOrganisationLayers > 0}
							{@const counts = countPrivateLayers + countOrganisationLayers}
							It contains <b>{counts} private layer{counts > 1 ? 's' : ''}</b>,
						{:else}
							{@const counts = countPrivateLayers}
							It contains <b>{counts} private layer{counts > 1 ? 's' : ''}</b>,
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
		{/if}
	</div>
	<div class="buttons" slot="buttons">
		<button
			class="button is-primary is-uppercase has-text-weight-bold {shareLoading ? 'is-loading' : ''}"
			on:click={handleShare}
			disabled={!(exportedStyleJSON && exportedStyleJSON.layers.length > 0)}
		>
			{savedStyle && !isReadOnly() ? 'Update' : 'Share'}
		</button>
	</div>
</ModalTemplate>
