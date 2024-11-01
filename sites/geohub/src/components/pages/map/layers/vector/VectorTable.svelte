<script lang="ts">
	import { page } from '$app/stores';
	import { SearchDebounceTime, SupportedTableFormats } from '$lib/config/AppConfig';
	import { expression2cql, expression2fields, getLayerStyle, type Expression } from '$lib/helper';
	import type { Link, Pages, VectorLayerTileStatAttribute, VectorTileMetadata } from '$lib/types';
	import {
		EDITING_LAYER_STORE_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		TABLE_MENU_SHOWN_CONTEXT_KEY,
		type EditingLayerStore,
		type EditingMenuShownStore,
		type MapStore
	} from '$stores';
	import bbox from '@turf/bbox';
	import { FloatingPanel, initTooltipTippy, Notification } from '@undp-data/svelte-undp-components';
	import { Loader, Pagination, SearchExpand } from '@undp-data/svelte-undp-design';
	import type { Feature } from 'geojson';
	import { isEqual } from 'lodash-es';
	import { LngLatBounds, Marker } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';
	import { clickOutside } from 'svelte-use-click-outside';
	import VectorTableColumn from './VectorTableColumn.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const editingLayerStore: EditingLayerStore = getContext(EDITING_LAYER_STORE_CONTEXT_KEY);
	const tableMenuShownStore: EditingMenuShownStore = getContext(TABLE_MENU_SHOWN_CONTEXT_KEY);

	export let height = 0;

	const tippyTooltip = initTooltipTippy();

	const limits = [10, 50, 100, 250, 500, 1000];
	let selectedLimit = 1000;
	let minSearchLength = 2;

	let sortby = '';
	let sortingorder: 'asc' | 'desc' = 'asc';

	let panelHeaderHeight = 0;
	let headerHeight = 0;

	let tableData:
		| { type: 'FeatureCollection'; features: Feature[]; links: Link[]; pages: Pages }
		| undefined;
	let columns: { name: string; width: number; attribute: VectorLayerTileStatAttribute }[] = [];
	let query = '';
	let cqlFilter = '';
	let filteredFields: string[] = [];

	let showDownloadMenu = false;
	let showHistogram = false;

	const registerMapEvents = (isRegister = true) => {
		if (!$map) return;
		if (isRegister) {
			$map?.on('dragend', updateTable);
			$map?.on('zoomend', updateTable);
			$map?.on('touchend', updateTable);
			$map?.on('styledata', updataTableWithFilter);
		} else {
			$map?.off('dragend', updateTable);
			$map?.off('zoomend', updateTable);
			$map?.off('touchend', updateTable);
			$map?.off('styledata', updataTableWithFilter);
		}
	};

	$: if ($tableMenuShownStore === true) {
		updateTable();
		registerMapEvents(true);
	} else {
		registerMapEvents(false);
		hideContextMenu();
	}

	onMount(() => {
		tableMenuShownStore.subscribe((show) => {
			if (show !== true) {
				query = '';
				sortby = '';
				if (selectedFatureMarker) {
					selectedFatureMarker.remove();
					selectedFatureMarker = undefined;
				}
				selectedRow = undefined;
			} else {
				initColumns();
			}
		});
		initColumns;
	});

	const initColumns = () => {
		const metadata = $editingLayerStore?.info as VectorTileMetadata;
		if ($editingLayerStore && metadata && metadata.json && metadata.json.tilestats) {
			const mapLayer = $map.getLayer($editingLayerStore.id);
			const vectorSourceLayer = mapLayer?.sourceLayer;
			if (vectorSourceLayer) {
				const stats = metadata.json.tilestats.layers.find((l) => l.layer === vectorSourceLayer);
				if (stats) {
					columns = stats.attributes.map((a) => {
						return { name: a.attribute, width: 150, attribute: a };
					});
					const idCol = columns.findIndex((col) =>
						['fid', 'id'].includes(col.name.toLowerCase().trim())
					);
					if (idCol !== -1) {
						const id = JSON.parse(JSON.stringify(columns[idCol]));
						columns.splice(idCol, 1);
						columns = [id, ...columns];
					}
				}
			}
		}
	};

	const updataTableWithFilter = async () => {
		if (!$map) return;
		if (!$editingLayerStore) return;

		const filter = $map?.getFilter($editingLayerStore.id);
		if (filter) {
			const newFilter = expression2cql(filter as unknown as Expression);
			if (cqlFilter !== newFilter) {
				updateTable();
			}
			return;
		}

		if (cqlFilter.length > 0) {
			updateTable();
		}
	};

	const updateTable = async () => {
		if (!$map) return;
		if (!$editingLayerStore) return;
		const dataset = $editingLayerStore.dataset;
		if (!dataset) return;

		const layerStyle = getLayerStyle($map, $editingLayerStore.id);
		const filter = layerStyle.filter;
		if (filter) {
			cqlFilter = expression2cql(filter as unknown as Expression);
			filteredFields = expression2fields(filter as unknown as Expression);
		} else {
			cqlFilter = '';
			filteredFields = [];
		}

		const fgbUrls = $editingLayerStore.dataset?.properties.links?.filter((l) =>
			l.rel.startsWith('flatgeobuf')
		);
		if (!(fgbUrls && fgbUrls.length > 0)) return;
		const mapLayer = $map.getLayer($editingLayerStore.id);
		const vectorSourceLayer = mapLayer?.sourceLayer;

		const bounds = $map.getBounds();
		const bbox = [...bounds.toArray()[0], bounds.toArray()[1]].join(',');

		const apiUrl = `${$page.url.origin}/api/datasets/${dataset.properties.id}/table/layers/${vectorSourceLayer}.geojson`;

		const params: { [key: string]: string } = {};
		params.bbox = bbox;
		if (query.length >= minSearchLength) {
			params.query = query;
		}
		if (sortby.length > 0) {
			params.sortby = `${sortby},${sortingorder}`;
		}

		params.limit = `${selectedLimit}`;

		if (cqlFilter.length > 0) {
			params.cql_filter = cqlFilter;
		}

		const finalUrl = `${apiUrl}?${Object.keys(params)
			.map((key) => `${key}=${params[key]}`)
			.join('&')}`;
		await reload(finalUrl);
	};

	const reload = async (url: string) => {
		tableData = undefined;
		const res = await fetch(`${url}&compress=true`);
		if (res.ok) {
			const blob = await res.blob();
			const stream = blob.stream();
			const compressedReadableStream = stream.pipeThrough(new DecompressionStream('gzip'));
			const response = await new Response(compressedReadableStream);
			const blobFromStream = await response.blob();
			const data = await blobFromStream.text();
			tableData = JSON.parse(data);
		} else {
			console.error(`${res.status}: ${res.statusText}`);
		}
	};

	const handleClose = () => {
		$tableMenuShownStore = false;
	};

	const handleFilterInput = () => {
		updateTable();
	};

	const handleLimitChanged = () => {
		updateTable();
	};

	const handlePaginationClicked = async (e: { detail: { type: 'previous' | 'next' } }) => {
		const type = e.detail.type;

		const link = tableData?.links.find((l) => l.rel === type);
		if (link) {
			reload(link.href);
		}
	};

	const handleColumnClick = (e: { detail: { name: string; isActive: boolean } }) => {
		const isActive = e.detail.isActive;
		if (isActive) {
			sortby = e.detail.name;
		} else {
			sortby = '';
		}
		updateTable();
	};

	// resizable column
	let isResizing = false;
	let startX: number | undefined;
	let startWidth: number | undefined;
	let resizingColumnIndex: number | undefined;

	const startResize = (
		event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement },
		index: number
	) => {
		isResizing = true;
		startX = event.pageX;
		startWidth = columns[index].width;
		resizingColumnIndex = index;

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', stopResize);
	};

	const onMouseMove = (event: { pageX: number }) => {
		if (!isResizing) return;
		if (!startX) return;
		if (!startWidth) return;
		if (!resizingColumnIndex) return;

		const dx = event.pageX - startX;
		columns[resizingColumnIndex].width = Math.max(startWidth + dx, 50);
	};

	const stopResize = () => {
		isResizing = false;
		resizingColumnIndex = undefined;
		startWidth = undefined;
		startX = undefined;
		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('mouseup', stopResize);
	};

	// context menu
	let showContextMenu = false;
	let pos = { x: 0, y: 0 };
	let menu = { h: 0, w: 0 };
	let browser = { h: 0, w: 0 };
	let selectedRow: Feature | undefined = undefined;
	let contextMenuElement: HTMLElement;
	let selectedFatureMarker: Marker | undefined = undefined;

	const handleContextMenu = (
		event: MouseEvent & { currentTarget: EventTarget & HTMLTableRowElement },
		row: Feature
	) => {
		showContextMenu = true;

		browser = {
			w: window.innerWidth,
			h: window.innerHeight
		};
		pos = {
			x: event.pageX,
			y: event.pageY
		};

		if (contextMenuElement) {
			menu = {
				h: contextMenuElement.clientHeight,
				w: contextMenuElement.clientWidth
			};
		}

		// If bottom part of context menu will be displayed
		// after right-click, then change the position of the
		// context menu. This position is controlled by `top` and `left`
		// at inline style.
		// Instead of context menu is displayed from top left of cursor position
		// when right-click occur, it will be displayed from bottom left.
		if (browser.h - pos.y < menu.h) pos.y = pos.y - menu.h;
		if (browser.w - pos.x < menu.w) pos.x = pos.x - menu.w;

		selectedRow = row;
	};

	const hideContextMenu = () => {
		showContextMenu = false;
		pos = { x: 0, y: 0 };
		menu = { h: 0, w: 0 };
		browser = { h: 0, w: 0 };
	};

	const showMarker = (feature: Feature) => {
		const bounds = bbox(feature) as [number, number, number, number];
		const center = [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2];

		if (selectedFatureMarker) {
			selectedFatureMarker.setLngLat([center[0], center[1]]);
		} else {
			selectedFatureMarker = new Marker().setLngLat([center[0], center[1]]).addTo($map);
		}
	};

	const ZoomOrPanTo = (feature: Feature, zoomTo = true) => {
		// unregister map event to prevent reloading table data
		registerMapEvents(false);

		const bounds = bbox(feature) as [number, number, number, number];
		const center = [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2];
		if (zoomTo) {
			$map.fitBounds(new LngLatBounds(bounds), {
				padding: 20,
				linear: true,
				maxZoom: 14
			});
		} else {
			$map.panTo([center[0], center[1]]);
		}

		// after zooming, reregister map events to enable reloading table
		setTimeout(() => {
			registerMapEvents(true);
		}, 1000);
	};

	const zoomTo = () => {
		if (!selectedRow) return;
		ZoomOrPanTo(selectedRow, true);
		hideContextMenu();
	};

	const moveTo = () => {
		if (!selectedRow) return;
		ZoomOrPanTo(selectedRow, false);
		hideContextMenu();
	};

	const handleClickFeature = (row: Feature) => {
		selectedRow = row;
	};

	$: selectedRow, updateMarker();
	const updateMarker = () => {
		if (selectedRow) {
			showMarker(selectedRow);
		} else {
			if (selectedFatureMarker) {
				selectedFatureMarker.remove();
				selectedFatureMarker = undefined;
			}
		}
	};
</script>

<nav
	class="context-menu"
	style="top:{pos.y}px; left:{pos.x}px;"
	use:clickOutside={hideContextMenu}
	hidden={!showContextMenu}
	bind:this={contextMenuElement}
>
	<div class="navbar">
		<ul>
			<li>
				<button class="is-flex is-align-items-center p-2" on:click={zoomTo}>
					<span class="icon is-small material-symbols-outlined mr-2"> zoom_in </span>
					<span> Zoom to </span>
				</button>
			</li>
			<li>
				<button class="is-flex is-align-items-center p-2" on:click={moveTo}>
					<span class="icon is-small material-symbols-outlined mr-2"> open_with </span>
					<span> Move to </span>
				</button>
			</li>
		</ul>
	</div>
</nav>

<FloatingPanel
	title={$editingLayerStore ? `${$editingLayerStore.name}` : 'Table'}
	on:close={handleClose}
	showExpand={false}
	bind:headerHeight={panelHeaderHeight}
>
	<div class="panel-contents">
		<div class="is-flex px-4 py-2" bind:clientHeight={headerHeight}>
			<div class="search-control">
				<SearchExpand
					bind:value={query}
					open={true}
					placeholder="Type keyword..."
					on:change={handleFilterInput}
					{minSearchLength}
					iconSize={16}
					fontSize={6}
					timeout={SearchDebounceTime}
					disabled={!tableData}
					loading={!tableData}
				/>
			</div>

			<div class="ml-auto is-flex is-align-items-center">
				{#if tableData}
					<div
						class="dropdown {showDownloadMenu ? 'is-active' : ''}"
						role="menu"
						tabindex="-1"
						on:mouseenter={() => (showDownloadMenu = true)}
						on:mouseleave={() => {
							showDownloadMenu = false;
						}}
					>
						<div class="dropdown-trigger">
							<button
								class="button"
								aria-haspopup="true"
								aria-controls="download-table-dropdown-menu"
								on:click={() => {
									showDownloadMenu = !showDownloadMenu;
								}}
								use:tippyTooltip={{ content: 'Download table data as various formats' }}
							>
								<span class="icon is-small">
									<span class="material-symbols-outlined"> download </span>
								</span>
								<span>Download</span>
								<span class="icon is-small has-text-primary">
									<i
										class="fas fa-chevron-down toggle-icon {showDownloadMenu ? 'active' : ''}"
										aria-hidden="true"
									></i>
								</span>
							</button>
						</div>
						<div class="dropdown-menu" id="download-table-dropdown-menu" role="menu">
							<div class="dropdown-content">
								{#each SupportedTableFormats as format}
									{@const fileUrl = tableData?.links?.find((l) => l.rel === format)?.href}
									{#if fileUrl}
										<a href={fileUrl} target="_blank" class="dropdown-item">
											<p class="is-uppercase">{format}</p>
										</a>
									{/if}
								{/each}
							</div>
						</div>
					</div>
				{/if}
				<div class="ml-1 select">
					<select
						bind:value={selectedLimit}
						on:change={handleLimitChanged}
						use:tippyTooltip={{ content: 'Change the maximum rows in the table' }}
						disabled={!tableData}
					>
						{#each limits as limit}
							<option value={limit}>{limit}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>

		<div
			class="table-contents"
			style="height: {height - panelHeaderHeight - headerHeight}px;"
			on:scroll={hideContextMenu}
		>
			<div class="attribute-table">
				<table class="table is-hoverable {showHistogram ? '' : 'has-sticky-header'}">
					<thead>
						<tr>
							<th class="row-number"></th>
							{#if columns.length > 0}
								{#each columns as col, index}
									<th style="width: {col.width}px;">
										<VectorTableColumn
											bind:name={col.name}
											bind:width={col.width}
											bind:attribute={col.attribute}
											bind:order={sortingorder}
											isFiltered={filteredFields.includes(col.name)}
											isActive={sortby === col.name}
											bind:showHistogram
											on:change={handleColumnClick}
										/>

										<div
											class="resizer"
											role="button"
											tabindex="-1"
											on:mousedown={(e) => startResize(e, index)}
										></div>
									</th>
								{/each}
							{/if}
						</tr>
					</thead>

					{#if !tableData}
						<div class="loader-container mt-4">
							<Loader />
						</div>
					{:else if tableData.features.length > 0}
						<tbody>
							{#each tableData.features as feature, index}
								{#if feature.properties}
									<tr
										class={isEqual(JSON.stringify(selectedRow), JSON.stringify(feature))
											? 'is-active'
											: ''}
										on:click={() => handleClickFeature(feature)}
										on:contextmenu|preventDefault={(event) => handleContextMenu(event, feature)}
									>
										<th class="row-number">{index + 1}</th>
										{#if columns.length > 0}
											{#each columns as col}
												{@const value = feature.properties[col.name]}
												<td style="max-width: {col.width}px;">
													{#if value}
														{value}
													{/if}
												</td>
											{/each}
										{/if}
									</tr>
								{/if}
							{/each}
						</tbody>
					{/if}
				</table>
				{#if tableData && tableData.features.length === 0}
					<div class="p-4">
						<Notification type="info" showIcon={false} showCloseButton={false}>
							No table content found in current map extent.
						</Notification>
					</div>
				{/if}
			</div>

			{#if tableData}
				<div class="pagination ml-4 mb-5 mt-4">
					<Pagination
						bind:totalPages={tableData.pages.totalPages}
						bind:currentPage={tableData.pages.currentPage}
						hidden={tableData.pages.totalPages <= 1}
						on:clicked={handlePaginationClicked}
					/>
				</div>
			{/if}
		</div>
	</div>
</FloatingPanel>

<style lang="scss">
	.context-menu {
		position: fixed;
		z-index: 99;

		.navbar {
			display: inline-flex;
			border: 1px #d4d6d8 solid;
			width: fit-content;
			min-width: 150px;
			background-color: #fff;
			border-radius: 0;
			overflow: hidden;
			flex-direction: column;
			box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.1);

			ul {
				margin: 6px 0;
			}
		}

		ul li {
			display: block;
			list-style-type: none;
			width: 1fr;

			button {
				font-size: 1rem;
				color: #232e3d;
				width: 100%;
				height: 30px;
				border: 0px;
				background-color: #fff;

				&:hover {
					color: #000;
					background-color: #edeff0;
				}
			}
		}
	}

	.panel-contents {
		.search-control {
			max-width: 200px;
		}

		.dropdown-trigger {
			button {
				border: 1px solid black;
			}

			.toggle-icon {
				-webkit-transition: all 0.3s ease;
				-moz-transition: all 0.3s ease;
				-ms-transition: all 0.3s ease;
				-o-transition: all 0.3s ease;
				transition: all 0.3s ease;

				&.active {
					transform: rotate(-180deg);
					-webkit-transform: rotate(-180deg);
					-moz-transform: rotate(-180deg);
					-ms-transform: rotate(-180deg);
					-o-transform: rotate(-180deg);
					transition: rotateZ(-180deg);
				}
			}
		}

		.pagination {
			position: sticky;
			left: 1rem;
			z-index: 1;
		}

		.table-contents {
			overflow-y: auto;

			.attribute-table {
				position: relative;

				.row-number {
					background-color: #edeff0;
					text-align: center;
					max-width: 60px;
				}

				tr {
					&.is-active {
						background-color: #edeff0;
					}
				}

				th,
				td {
					white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
				}

				.table.has-sticky-header {
					thead th {
						position: sticky;
						background-color: #edeff0;
						top: 0;
						z-index: 2;
					}

					tbody th:first-child,
					thead th:first-child {
						position: sticky;
						left: 0;
						background-color: #edeff0;
					}
					thead th:first-child {
						z-index: 3;
					}
				}

				.resizer {
					position: absolute;
					top: 0;
					right: 0;
					width: 5px;
					height: 100%;
					cursor: col-resize;
					background-color: transparent;
				}

				th:hover .resizer {
					background-color: #ccc;
				}

				.loader-container {
					position: sticky;
					left: 50%;
					transform: translateX(-50%);
				}
			}
		}
	}
</style>
