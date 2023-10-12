<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { AccessLevel } from '$lib/config/AppConfig';
	import { storageKeys, toLocalStorage } from '$lib/helper';
	import type { DashboardMapStyle, Layer } from '$lib/types';
	import { layerList } from '$stores';
	import type { Map, StyleSpecification } from 'maplibre-gl';
	import { clickOutside } from 'svelte-use-click-outside';
	import { fade } from 'svelte/transition';
	import AccessLevelSwitcher from './AccessLevelSwitcher.svelte';
	import CopyToClipboard from './CopyToClipboard.svelte';
	import Notification from './controls/Notification.svelte';
	import ShowDetails from './util/ShowDetails.svelte';

	let savedStyle: DashboardMapStyle = $page.data.style;
	let accessLevel: AccessLevel = savedStyle?.access_level ?? AccessLevel.PRIVATE;
	let showDetails = true;
	let styleId = savedStyle?.id;

	export let map: Map;
	export let isModalVisible = false;

	let styleName: string;
	let untargetedLayers: Layer[] = [];
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
		return $page.data.session?.user?.email !== savedStyle?.created_user;
	};

	const open = () => {
		untargetedLayers = [];
		countPrivateLayers = 0;
		countOrganisationLayers = 0;
		const names: string[] = [];
		if ($layerList.length > 0) {
			$layerList.forEach((layer) => {
				const tags: [{ key: string; value: string }] = layer.dataset.properties.tags as unknown as [
					{ key: string; value: string }
				];
				const stacType = tags?.find((tag) => tag.key === 'stac');

				if (stacType?.value === 'microsoft-pc') {
					untargetedLayers.push(layer);
				} else {
					names.push(layer.name);
				}

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
		let savedLayerList = JSON.parse(JSON.stringify($layerList));
		const untargetdIds = untargetedLayers.map((l) => l.id);
		savedLayerList = savedLayerList.filter((l) => !untargetdIds.includes(l.id));

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
		const styleURL = savedStyle.links.find((l) => l.rel === 'map').href;
		showDetails = false;
		styleName = savedStyle.name;

		toLocalStorage(layerListStorageKey, savedStyle.layers);
		toLocalStorage(mapStyleStorageKey, savedStyle.style);
		styleId = savedStyle.id;
		toLocalStorage(mapStyleIdStorageKey, styleId);

		history.replaceState({}, null, `${styleURL}${$page.url.search}${$page.url.hash}`);
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

		untargetedLayers.forEach((layer) => {
			const deletedLayer = style.layers.find((l) => l.id === layer.id);
			if (deletedLayer) {
				const delIndex = style.layers.indexOf(deletedLayer);
				if (delIndex === 0) {
					style.layers.shift();
				} else {
					style.layers.splice(delIndex, 1);
				}
			}
		});

		style.name = styleName;
		const center = map.getCenter();
		style.center = [center.lng, center.lat];
		style.bearing = map.getBearing();
		style.pitch = map.getPitch();
		style.zoom = map.getZoom();
		exportedStyleJSON = style;
	};

	const handleClose = () => {
		isModalVisible = false;
	};

	const handleShare = async () => {
		await share();
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			handleClose();
		}
	};
</script>

<div
	class="modal {isModalVisible ? 'is-active' : ''}"
	transition:fade|global
	use:clickOutside={handleClose}
>
	<div role="none" class="modal-background" on:keydown={handleKeyDown} on:click={handleClose} />
	<div class="modal-card">
		<header class="modal-card-head">
			<p class="modal-card-title has-text-weight-bold">
				{savedStyle && !isReadOnly() ? 'Update' : 'Share'} map
			</p>
			<button class="delete" aria-label="close" title="Close" on:click={handleClose} />
		</header>
		<section class="modal-card-body">
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
				{#if untargetedLayers.length > 0}
					<article class="message is-warning">
						<div class="message-header">
							<p>Warning</p>
						</div>
						<div class="message-body">
							<p>
								The following layers from Microsoft Planet Computer API will be removed from saved
								style.
							</p>
							<div class="level">
								{#each untargetedLayers as layer, index}
									<div class="level-left">
										<div class="level-item">
											<p>{index + 1}: {layer.name}</p>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</article>
				{/if}
			{/if}
		</section>
		<footer class="modal-card-foot is-flex is-flex-direction-row is-justify-content-flex-end">
			{#if exportedStyleJSON && exportedStyleJSON.layers.length > 0}
				<button
					class="button is-primary is-fullwidth {shareLoading ? 'is-loading' : ''}"
					on:click={handleShare}
				>
					<span class="icon">
						<i
							class="fa-solid {savedStyle && !isReadOnly() ? 'fa-floppy-disk' : 'fa-share'} fa-lg"
						/>
					</span>
					<span>{savedStyle && !isReadOnly() ? 'Update' : 'Share'}</span>
				</button>
			{/if}
			<button class="button is-link is-fullwidth" on:click={handleClose}>
				<span class="icon">
					<i class="fa-solid fa-xmark fa-lg" />
				</span>
				<span>{savedStyle ? 'Close' : 'Cancel'}</span>
			</button>
		</footer>
	</div>
</div>

<style lang="scss">
	.icon {
		cursor: pointer;
	}

	.modal {
		.modal-card {
			width: 300px;
		}
	}
</style>
