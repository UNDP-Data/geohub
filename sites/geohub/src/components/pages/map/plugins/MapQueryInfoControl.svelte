<script lang="ts">
	import { downloadFile, getLayerStyle } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import type { LayerListStore } from '$stores';
	import {
		Accordion,
		clean,
		getActiveBandIndex,
		getValueFromRasterTileUrl,
		handleEnterKey,
		initTooltipTippy,
		isValidUrl,
		type BandMetadata,
		type RasterTileMetadata
	} from '@undp-data/svelte-undp-components';
	import { Checkbox, DefaultLink, Loader } from '@undp-data/svelte-undp-design';
	import { Map, MapMouseEvent, Popup, type ControlPosition, type PointLike } from 'maplibre-gl';
	import PapaParse from 'papaparse';
	import { onDestroy, onMount, untrack } from 'svelte';

	interface PointFeature {
		type: 'Feature';
		geometry: {
			type: 'Point';
			coordinates: [number, number];
		};
		id: string;
		properties: { [key: string]: string | number };
	}

	interface Props {
		map: Map;
		layerList: LayerListStore;
		position?: ControlPosition;
		isActive?: boolean;
	}

	let {
		map = $bindable(),
		layerList = $bindable(),
		position = $bindable('top-right'),
		isActive = $bindable(true)
	}: Props = $props();
	let popup: Popup | undefined;
	let queryButton: HTMLButtonElement | undefined = $state();
	let popupContainer: HTMLDivElement | undefined = $state();
	let isValuesRounded = $state(true);
	let showDownloadDropdown = $state(false);

	let features: PointFeature[] = $state([]);
	let coordinates: number[] | undefined = $state();
	let showProgress = $state(false);
	let showPopup = $state(false);

	const tippyTooltip = initTooltipTippy();

	$effect(() => {
		if (isActive !== undefined) {
			untrack(() => {
				handleActiveChanged();
			});
		}
	});

	const handleActiveChanged = () => {
		if (isActive) {
			map.on('click', onMapClick);
			map.getCanvas().style.cursor = 'crosshair';
		} else {
			map.off('click', onMapClick);
			map.getCanvas().style.cursor = '';
		}
	};

	function MapQueryInfoControl() {}

	MapQueryInfoControl.prototype.onAdd = function () {
		this.container = document.createElement('div');
		this.container.title = 'Query Layer Information';
		this.container.classList.add('maplibregl-ctrl', 'maplibregl-ctrl-group');

		queryButton?.addEventListener('click', () => {
			this.changeButtonCondition();
		});
		this.container.appendChild(queryButton);
		queryButton?.dispatchEvent(new Event('click'));
		return this.container;
	};

	MapQueryInfoControl.prototype.changeButtonCondition = function () {
		isActive = !isActive;
		handleActiveChanged();
	};

	const onMapClick = async (e: MapMouseEvent) => {
		if (!isActive) return;
		const visibleLayers = map.getStyle().layers.filter((l) => {
			let visibility = 'visible';
			if (l.layout && l.layout.visibility) {
				visibility = l.layout.visibility;
			}
			return visibility === 'visible';
		});
		const visibleLayerIds = visibleLayers.map((l) => l.id);
		const layersVisible = $layerList.filter((layer) => visibleLayerIds.includes(layer.id));
		if (layersVisible.length === 0) {
			if (popup) {
				popup.remove();
				popup = undefined;
			}
			return;
		}

		const lat = e.lngLat.lat;
		const lng = e.lngLat.lng;

		features = [];
		expanded = {};
		coordinates = [];

		const promises = [];

		for (const layer of $layerList) {
			const layerStyle = getLayerStyle(map, layer.id);
			if (!layerStyle) continue;
			const visibility = layerStyle.layout?.visibility ?? 'visible';
			if (visibility === 'none') continue;
			if (layerStyle.type === 'raster') {
				const cogUrl = layer.dataset.properties.links.find((l) => l.rel === 'cog')?.href;
				const mosaicUrl = layer.dataset.properties.links.find((l) => l.rel === 'mosaicjson')?.href;
				const stacUrl = layer.dataset.properties.links.find((l) => l.rel === 'stac')?.href;
				if (mosaicUrl) {
					promises.push(queryMosaicJson(lng, lat, layer));
				} else if (cogUrl) {
					promises.push(queryCOG(lng, lat, layer));
				} else if (stacUrl) {
					promises.push(queryStac(lng, lat, layer));
				} else {
					return;
				}
			} else {
				promises.push(queryVectorData(lng, lat, e.point, layer));
			}
		}

		if (popup) {
			popup.remove();
			popup = undefined;
			showPopup = false;
		}
		if (!popupContainer) return;
		popup = new Popup()
			.setLngLat(e.lngLat)
			.setDOMContent(popupContainer)
			.setMaxWidth('400px')
			.addTo(map);
		showPopup = true;

		coordinates = [e.lngLat.lng, e.lngLat.lat];

		showProgress = true;
		map.getCanvas().style.cursor = 'wait';
		Promise.all(promises)
			.then((queriedFeautres: PointFeature[]) => {
				features = queriedFeautres.filter(
					(f) => f && Object.keys(f.properties).filter((key) => key !== 'name').length > 0
				);
				features = features.filter((f) =>
					Object.keys(f.properties)
						.filter((key) => key !== 'name')
						.some((key) => f.properties[key] !== undefined && f.properties[key] !== null)
				);
				if (features.length === 0) {
					if (popup) {
						popup.remove();
						popup = undefined;
						showPopup = false;
					}
				} else {
					features.forEach((feature, index) => {
						expanded[feature.id] = index === 0;
						if (index === 0) {
							expandedLayerId = feature.id as string;
						}
					});
				}
			})
			.finally(() => {
				showProgress = false;
				map.getCanvas().style.cursor = 'crosshair';
			});
	};

	MapQueryInfoControl.prototype.onRemove = function () {
		if (!this.container || !this.container.parentNode) {
			return;
		}
		this.container.parentNode.removeChild(this.container);
		this.map = undefined;
	};

	/*global MapQueryInfoControl */
	/*eslint no-undef: "error"*/
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	let mapQueryInfoControl: MapQueryInfoControl;

	onMount(() => {
		if (map) {
			if (!(mapQueryInfoControl && map.hasControl(mapQueryInfoControl))) {
				mapQueryInfoControl = new MapQueryInfoControl();
				map.addControl(mapQueryInfoControl, position);
			}
		}
	});

	onDestroy(() => {
		if (map) {
			if (mapQueryInfoControl && map.hasControl(mapQueryInfoControl)) {
				map.removeControl(mapQueryInfoControl);
			}
		}
	});

	let expanded: { [key: string]: boolean } = $state({});
	let expandedLayerId: string = $state('');
	$effect(() => {
		let expandedLayers = Object.keys(expanded).filter(
			(key) => expanded[key] === true && key !== expandedLayerId
		);
		if (expandedLayers.length > 0) {
			expandedLayerId = expandedLayers[0];
			Object.keys(expanded)
				.filter((key) => key !== expandedLayerId)
				.forEach((key) => {
					expanded[key] = false;
				});
			expanded[expandedLayers[0]] = true;
		}
	});

	const createFeature = (
		lng: number,
		lat: number,
		id: string,
		properties: { [key: string]: string | number }
	) => {
		const feature: PointFeature = {
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [lng, lat]
			},
			id: id,
			properties: properties
		};
		return feature;
	};

	const queryVectorData = async (lng: number, lat: number, point: PointLike, layer: Layer) => {
		const props: { [key: string]: string | number } = {
			name: layer.name
		};

		const queriedFeatures = map.queryRenderedFeatures(point, {
			layers: [layer.id]
		});
		if (queriedFeatures && queriedFeatures.length > 0) {
			Object.keys(queriedFeatures[0].properties).forEach((key) => {
				props[key] = queriedFeatures[0].properties[key];
			});
		} else {
			return;
		}

		return createFeature(lng, lat, layer.id, props);
	};

	const queryStac = async (lng: number, lat: number, layer: Layer) => {
		const stacUrl = layer.dataset.properties.links.find((l) => l.rel === 'stac').href;
		const datasetUrl = layer.dataset.properties.url;
		const assets: string[] = layer.dataset.properties.tags.find(
			(tag) => tag.key === 'product_assets'
		)?.value;
		const baseUrl = new URL(`${stacUrl}/point/${lng},${lat}`);
		const expression = getValueFromRasterTileUrl(map, layer.id, 'expression') as string;
		if (expression) {
			baseUrl.searchParams.set('expression', expression);
		}
		const nodata = getValueFromRasterTileUrl(map, layer.id, 'nodata') as string;
		if (nodata) {
			baseUrl.searchParams.set('nodata', nodata);
		}
		baseUrl.searchParams.set('url', datasetUrl);
		for (const index in assets) {
			baseUrl.searchParams.append('assets', assets[index]);
		}
		baseUrl.searchParams.set('asset_as_band', 'True');
		const queryURL = baseUrl.href;

		const res = await fetch(queryURL);
		const data = await res.json();
		const props: { [key: string]: string | number } = {
			name: layer.name
		};
		if (data.values && data.values.length > 0) {
			data.values.forEach((value) => {
				const band = layer.name;
				props[band] = value;
			});
		}
		return createFeature(lng, lat, layer.id, props);
	};

	const queryCOG = async (lng: number, lat: number, layer: Layer) => {
		const rasterInfo = layer.info as RasterTileMetadata;
		const bandIndex = getActiveBandIndex(layer.info);
		const cogUrl = layer.dataset.properties.links.find((l) => l.rel === 'cog').href;
		const blobUrl = layer.dataset.properties.url;
		// const baseUrl = `${cogUrl}/point/${lng},${lat}?url=${encodeURIComponent(blobUrl)}&bidx=${
		// 	bandIndex + 1
		// }`;

		const baseUrl = new URL(`${cogUrl}/point/${lng},${lat}?unscale=true`);
		baseUrl.searchParams.set('url', blobUrl);

		const bidx = getValueFromRasterTileUrl(map, layer.id, 'bidx') as string;
		if (bidx) {
			baseUrl.searchParams.set('bidx', bidx);
		}
		const expression = getValueFromRasterTileUrl(map, layer.id, 'expression') as string;
		if (expression) {
			baseUrl.searchParams.set('expression', expression);
		}
		const nodata = getValueFromRasterTileUrl(map, layer.id, 'nodata') as string;
		if (nodata) {
			baseUrl.searchParams.set('nodata', nodata);
		}

		const algorithm = getValueFromRasterTileUrl(map, layer.id, 'algorithm') as string;
		if (!algorithm) {
			baseUrl.searchParams.set('bidx', `${bandIndex + 1}`);
		}

		const queryURL = baseUrl.href;
		const res = await fetch(queryURL);
		if (!res.ok) {
			return;
		}
		const data = await res.json();
		let layerHasNoDataValue = false;
		if (data.values && data.values.length > 0) {
			for (const value of data.values) {
				if (value === rasterInfo.nodata_value) layerHasNoDataValue = true;
			}
		}

		if (layerHasNoDataValue) {
			return;
		}

		if (!algorithm) {
			const band_metadata = rasterInfo.band_metadata[bandIndex] as BandMetadata[];
			const layerUniqueValues = band_metadata[1].STATISTICS_UNIQUE_VALUES;

			const props: { [key: string]: string | number } = {
				name: layer.name
			};

			if (data.values && data.values.length > 0) {
				data.values.forEach((value) => {
					if (layerUniqueValues) {
						const key = layerUniqueValues[value];
						props[key ? key : `Band=${rasterInfo.active_band_no}`] = value;
					} else {
						props[`Band=${rasterInfo.active_band_no}`] = value;
					}
				});
			}

			return createFeature(lng, lat, layer.id, props);
		} else {
			const props: { [key: string]: string | number } = {
				name: layer.name
			};
			if (data.values && data.values.length > 0) {
				data.values.forEach((value, index) => {
					const band = data.band_names[index];
					props[band] = value;
				});
			}

			return createFeature(lng, lat, layer.id, props);
		}
	};

	const queryMosaicJson = async (lng: number, lat: number, layer: Layer) => {
		const rasterInfo = layer.info as RasterTileMetadata;

		const mosaicjsonUrl = layer.dataset.properties.links.find((l) => l.rel === 'mosaicjson').href;

		const baseUrl = `${mosaicjsonUrl}/point/${lng},${lat}?url=${getValueFromRasterTileUrl(
			map,
			layer.id,
			'url'
		)}&unscale=true`;
		const res = await fetch(baseUrl);
		const data = await res.json();
		if (
			!(
				data.values &&
				data.values.length > 0 &&
				data.values[0].length > 0 &&
				data.values[0][1].length > 0
			)
		) {
			return;
		}

		const bandIndex = getActiveBandIndex(rasterInfo);
		const value = `${data.values[0][1]}`;
		const values: number[] = value.split(',').map((v) => Number(v));
		const band_metadata = rasterInfo.band_metadata[bandIndex] as BandMetadata[];
		const layerUniqueValues = band_metadata[1].STATISTICS_UNIQUE_VALUES;

		const props: { [key: string]: string | number } = {
			name: layer.name
		};

		for (const v of values) {
			if (layerUniqueValues) {
				const key = layerUniqueValues[v];
				props[key ? key : `Band=${values.indexOf(v) + 1}`] = v;
			} else {
				props[`Band=${values.indexOf(v) + 1}`] = v;
			}
		}

		return createFeature(lng, lat, layer.id, props);
	};

	const formatValue = (value: number | string) => {
		if (Number.isFinite(value) && isValuesRounded) {
			const val = value as number;
			return (Math.round((val + Number.EPSILON) * 100) / 100).toFixed(2);
		} else {
			return value;
		}
	};

	const downloadCsv = () => {
		const data = [
			['UNDP : GeoHub : Query Information'],
			[new Date().toISOString()],
			[],
			['ID', 'Layer name', 'Longitude', 'Latitude', 'Property', 'Value']
		];

		features.forEach((feature) => {
			Object.keys(feature.properties).forEach((key) => {
				if (key === 'name') return;
				data.push([
					feature.id,
					`${feature.properties.name}`,
					`${feature.geometry.coordinates[0]}`,
					`${feature.geometry.coordinates[1]}`,
					key,
					`${feature.properties[key]}`
				]);
			});
		});

		const filename = `undp-geohub-layers-data-${new Date().toISOString().split('T')[0]}.csv`;
		let csvContent = null;

		if (typeof data === 'object') {
			csvContent = PapaParse.unparse(data, { header: false });
		} else {
			csvContent = data;
		}

		downloadFile(filename, csvContent);
	};

	const downloadGeoJson = () => {
		const fc = {
			type: 'FeatureCollection',
			features: features
		};
		const data = JSON.stringify(fc);
		const filename = `undp-geohub-layers-data-${new Date().toISOString().split('T')[0]}.geojson`;
		downloadFile(filename, data);
	};
</script>

<button
	class="maplibregl-ctrl-query maplibre-ctrl-icon is-flex is-align-items-center"
	bind:this={queryButton}
	use:tippyTooltip={{
		content: `${!isActive ? 'Start to query information' : 'Stop to query information'}`
	}}
	aria-label="query"
>
	<span class="fa-stack fa-xl">
		<i class="fa-solid fa-comment fa-stack-1x {isActive ? 'has-text-success' : ''}"></i>
		<i class="fa-solid fa-info fa-stack fa-inverse mb-2" style="font-size: 0.5rem;"></i>
	</span>
</button>

<div bind:this={popupContainer} class="popup-container">
	{#if showPopup}
		<div class="has-background-light has-text-weight-semibold is-size-6 p-2 m-0 mb-2">
			Query information
		</div>
		<div class="contents">
			{#if showProgress}
				<div class="loader-container">
					<Loader size="small" />
				</div>
			{:else}
				{#each features as feature (features.indexOf(feature))}
					<Accordion title={`${feature.properties.name}`} bind:isExpanded={expanded[feature.id]}>
						{#snippet content()}
							<div>
								<table class="attr-table table is-striped is-narrow is-hoverable is-fullwidth">
									<thead>
										<tr>
											<th>Property</th>
											<th>Value</th>
										</tr>
									</thead>
									<tbody>
										{#each Object.keys(feature.properties) as property (property)}
											{@const value = feature.properties[property]}
											{#if !(value === undefined || value === null)}
												<tr>
													{#if typeof value === 'string' && isValidUrl( value, ['jpeg', 'jpg', 'png', 'webp'] )}
														<td colspan="2">
															<a href={value} target="_blank">
																<figure class="image is-fullwidth">
																	<img src={value} alt={property} />
																</figure>
															</a>
														</td>
													{:else if typeof value === 'string' && isValidUrl(value)}
														<td>{clean(property)}</td>
														<td>
															<DefaultLink href={value} title="Open link" target="_blank" />
														</td>
													{:else if property !== 'name'}
														<td>{clean(property)}</td>
														{#key isValuesRounded}
															<td>{formatValue(value)}</td>
														{/key}
													{/if}
												</tr>
											{/if}
										{/each}
									</tbody>
								</table>
							</div>
						{/snippet}
					</Accordion>
				{/each}
				{#if coordinates && coordinates.length === 2}
					<Accordion title="Coordinates" bind:isExpanded={expanded['coordinates']}>
						{#snippet content()}
							<div>
								<table class="attr-table table is-striped is-narrow is-hoverable s-fullwidth">
									<thead>
										<tr>
											<th>Property</th>
											<th>Value</th>
										</tr>
									</thead>
									<tbody>
										{#key coordinates}
											<tr>
												<td>Longitude</td>
												<td>{coordinates[0].toFixed(6)}</td>
											</tr>

											<tr>
												<td>Latitude</td>
												<td>{coordinates[1].toFixed(6)}</td>
											</tr>
										{/key}
									</tbody>
								</table>
							</div>
						{/snippet}
					</Accordion>
				{/if}
			{/if}
		</div>

		<div class="is-flex p-2">
			<Checkbox label="Round values" bind:checked={isValuesRounded} />

			<div
				role="button"
				tabindex="0"
				class="download-dropdown dropdown is-right {showDownloadDropdown ? 'is-active' : ''}"
				onmouseenter={() => {
					showDownloadDropdown = true;
				}}
				onmouseleave={() => {
					showDownloadDropdown = false;
				}}
			>
				<div class="dropdown-trigger">
					<button
						class="button"
						aria-haspopup="true"
						aria-controls="dropdown-menu"
						onclick={() => {
							showDownloadDropdown = !showDownloadDropdown;
						}}
					>
						<span class="icon is-small">
							<i class="fa-solid fa-download"></i>
						</span>
						<span>Download</span>
						<span class="icon is-small">
							<i class="fas fa-angle-down" aria-hidden="true"></i>
						</span>
					</button>
				</div>
				<div class="dropdown-menu" id="dropdown-menu" role="menu">
					<div class="dropdown-content">
						<!-- svelte-ignore a11y_missing_attribute -->
						<a
							class="dropdown-item"
							onclick={() => downloadGeoJson()}
							onkeydown={handleEnterKey}
							role="menuitem"
							tabindex="0"
							data-sveltekit-preload-code="off"
							data-sveltekit-preload-data="off"
						>
							GeoJSON
						</a>
						<!-- svelte-ignore a11y_missing_attribute -->
						<a
							class="dropdown-item"
							onclick={() => downloadCsv()}
							onkeydown={handleEnterKey}
							role="menuitem"
							tabindex="0"
							data-sveltekit-preload-code="off"
							data-sveltekit-preload-data="off"
						>
							CSV
						</a>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.popup-container {
		height: fit-content;

		.contents {
			max-height: 300px;
			min-width: 300px;
			overflow-y: auto;
		}

		.attr-table {
			width: 100%;
			margin: 0;
		}

		.loader-container {
			width: max-content;
			margin: auto;
			background-color: white;
		}

		.download-dropdown {
			margin-left: auto;
			cursor: pointer;
		}
	}

	.maplibre-ctrl-icon {
		width: 29px;
		height: 29px;
		cursor: pointer;
	}

	:global(.maplibregl-popup-close-button) {
		top: 12px !important;
		right: 10px !important;
		height: 30px;
		width: 30px;
		font-size: 25px;
	}
</style>
