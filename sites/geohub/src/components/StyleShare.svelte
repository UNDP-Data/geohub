<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { clickOutside } from 'svelte-use-click-outside';
	import type { StyleSpecification } from 'maplibre-gl';
	import { copy } from 'svelte-copy';

	import type { DashboardMapStyle, Layer } from '$lib/types';
	import { map, layerList } from '$stores';
	import { AccessLevel } from '$lib/config/AppConfig';
	import AccessLevelSwitcher from './AccessLevelSwitcher.svelte';
	import Notification from './controls/Notification.svelte';
	import { storageKeys, toLocalStorage } from '$lib/helper';

	let isReadonly = true;

	let savedStyle: DashboardMapStyle = $page.data.style;
	let accessLevel: AccessLevel = savedStyle?.access_level ?? AccessLevel.PRIVATE;
	if (savedStyle && $page.data.session?.user?.email === savedStyle?.created_user) {
		isReadonly = false;
	}
	let styleId = $page.url.searchParams.get('style');

	export let isModalVisible = false;
	let styleURL: string;

	let styleName: string;
	let textCopyButton = 'Copy';
	let untargetedLayers: Layer[] = [];
	let exportedStyleJSON: StyleSpecification;
	let shareLoading = false;

	const layerListStorageKey = storageKeys.layerList($page.url.host);
	const mapStyleStorageKey = storageKeys.mapStyle($page.url.host);
	const mapStyleIdStorageKey = storageKeys.mapStyleId($page.url.host);

	$: if (isModalVisible) {
		open();
	}

	const open = () => {
		styleURL = undefined;

		untargetedLayers = [];
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

		styleId = $page.url.searchParams.get('style');

		let method = 'POST';
		if (styleId && !isReadonly) {
			data['id'] = styleId;
			method = 'PUT';
		}

		const res = await fetch('/api/style', {
			method: method,
			body: JSON.stringify(data)
		});
		let style: DashboardMapStyle = await res.json();
		styleURL = style.links.find((l) => l.rel === 'map').href;
		$page.url.searchParams.set('style', style.id);
		await goto(`?${$page.url.searchParams.toString()}${$page.url.hash}`, { invalidateAll: true });
		savedStyle = $page.data.style;
		styleName = savedStyle.name;
		if ($page.data.session?.user?.email === savedStyle?.created_user) {
			isReadonly = false;
		}

		const storageLayerList = $layerList;
		toLocalStorage(layerListStorageKey, storageLayerList);

		let storageMapStyle = $map?.getStyle();
		toLocalStorage(mapStyleStorageKey, storageMapStyle);

		styleId = $page.url.searchParams.get('style');
		toLocalStorage(mapStyleIdStorageKey, styleId);
		shareLoading = false;
	};

	$: styleName, createStyleJSON2Generate();

	const createStyleJSON2Generate = () => {
		if (!$map) return;
		const style: StyleSpecification = $map.getStyle();
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
		const center = $map.getCenter();
		style.center = [center.lng, center.lat];
		style.bearing = $map.getBearing();
		style.pitch = $map.getPitch();
		style.zoom = $map.getZoom();
		exportedStyleJSON = style;
	};

	const handleClose = () => {
		isModalVisible = false;
	};

	const handleShare = async () => {
		await share();
	};

	const handleCopy = () => {
		textCopyButton = 'copied';
		setTimeout(() => {
			textCopyButton = 'Copy';
		}, 5000);
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			handleClose();
		}
	};
</script>

{#if isModalVisible}
	<div class="modal is-active" transition:fade|global use:clickOutside={handleClose}>
		<div role="none" class="modal-background" on:keydown={handleKeyDown} on:click={handleClose} />
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title has-text-weight-bold">Share map</p>
				<button class="delete" aria-label="close" title="Close" on:click={handleClose} />
			</header>
			<section class="modal-card-body">
				{#if !styleURL}
					{#if styleId && isReadonly}
						<Notification type="info" showCloseButton={false}>
							This map was created by other user. It will be saved as new map.
						</Notification>
					{/if}

					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Map name:</label>
						<div class="control">
							<input
								class="input text-stylename"
								type="text"
								placeholder="Style name"
								bind:value={styleName}
							/>
						</div>
					</div>

					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Saved map will be published to: </label>
						<div class="control">
							<AccessLevelSwitcher bind:accessLevel />
						</div>
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
				{:else}
					<div style="width: 100%;">
						<input
							class="input text-style"
							type="text"
							placeholder="style.json"
							value={styleURL}
							readonly
						/>
						<button
							class="button is-info is-success style-copy"
							use:copy={styleURL}
							on:click={handleCopy}>{textCopyButton}</button
						>
					</div>
				{/if}
			</section>
			<footer class="modal-card-foot is-flex is-flex-direction-row is-justify-content-flex-end">
				<button class="button is-link is-fullwidth" on:click={handleClose}>
					<span class="icon">
						<i class="fa-solid fa-xmark fa-lg" />
					</span>
					<span>{styleURL ? 'Close' : 'Cancel'}</span>
				</button>

				{#if !styleURL && exportedStyleJSON && exportedStyleJSON.layers.length > 0}
					<button
						class="button is-primary is-fullwidth {shareLoading ? 'is-loading' : ''}"
						on:click={handleShare}
					>
						<span class="icon">
							<i class="fa-solid fa-share fa-lg" />
						</span>
						<span>Share</span>
					</button>
				{/if}
			</footer>
		</div>
	</div>
{/if}

<style lang="scss">
	.icon {
		cursor: pointer;
	}

	.text-style {
		width: 100%;
	}
	.style-copy {
		position: absolute;
		right: 20px;
	}

	.modal {
		.modal-card {
			width: 300px;
		}
	}
</style>
