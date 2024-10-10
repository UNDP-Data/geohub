<script lang="ts">
	import { page } from '$app/stores';
	import { SearchDebounceTime, SupportedTableFormats } from '$lib/config/AppConfig';
	import type { Link, Pages } from '$lib/types';
	import {
		MAPSTORE_CONTEXT_KEY,
		TABLE_LAYER_STORE_CONTEXT_KEY,
		TABLE_MENU_SHOWN_CONTEXT_KEY,
		type EditingLayerStore,
		type EditingMenuShownStore,
		type MapStore
	} from '$stores';
	import { clean, FloatingPanel, Notification } from '@undp-data/svelte-undp-components';
	import { Loader, Pagination, SearchExpand } from '@undp-data/svelte-undp-design';
	import type { Feature } from 'geojson';
	import { debounce } from 'lodash-es';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const tableLayerStore: EditingLayerStore = getContext(TABLE_LAYER_STORE_CONTEXT_KEY);
	const tableMenuShownStore: EditingMenuShownStore = getContext(TABLE_MENU_SHOWN_CONTEXT_KEY);

	export let height = 0;

	let panelHeaderHeight = 0;
	let headerHeight = 0;
	$: tableHeight = height - headerHeight - panelHeaderHeight;

	let tableData:
		| { type: 'FeatureCollection'; features: Feature[]; links: Link[]; pages: Pages }
		| undefined;
	let columns: string[] = [];
	let query = '';

	let showDownloadMenu = false;

	$: if ($map && $tableLayerStore && $tableMenuShownStore === true) {
		updateTable();
		$map.on('moveend', updateTable);
	} else {
		query = '';
		$map?.off('moveend', updateTable);
	}

	onMount(() => {});

	const updateTable = debounce(async () => {
		if (!$map) return;
		if (!$tableLayerStore) return;
		const dataset = $tableLayerStore.dataset;
		if (!dataset) return;
		const fgbUrls = $tableLayerStore.dataset?.properties.links?.filter((l) =>
			l.rel.startsWith('flatgeobuf')
		);
		if (!(fgbUrls && fgbUrls.length > 0)) return;
		const mapLayer = $map.getLayer($tableLayerStore.id);
		const vectorSourceLayer = mapLayer?.sourceLayer;

		const bounds = $map.getBounds();
		const bbox = [...bounds.toArray()[0], bounds.toArray()[1]].join(',');

		const apiUrl = `${$page.url.origin}/api/datasets/${dataset.properties.id}/table/layers/${vectorSourceLayer}.json`;

		const params: { [key: string]: string } = {};
		params.bbox = bbox;
		if (query.length > 0) {
			params.query = query;
		}
		const finalUrl = `${apiUrl}?${Object.keys(params)
			.map((key) => `${key}=${params[key]}`)
			.join('&')}`;
		await reload(finalUrl);
	}, 300);

	const reload = async (url: string) => {
		tableData = undefined;

		const res = await fetch(url);
		tableData = await res.json();
		if (tableData && tableData.features.length > 0) {
			columns = Object.keys(
				tableData.features[0].properties as unknown as { [key: string]: string }
			);
		}
	};

	const handleClose = () => {
		$tableMenuShownStore = false;
	};

	const handleFilterInput = () => {
		updateTable();
	};

	const handlePaginationClicked = async (e: { detail: { type: 'previous' | 'next' } }) => {
		const type = e.detail.type;

		const link = tableData?.links.find((l) => l.rel === type);
		if (link) {
			reload(link.href);
		}
	};
</script>

<FloatingPanel
	title={$tableLayerStore ? `Table: ${$tableLayerStore.name}` : 'Table'}
	on:close={handleClose}
	showExpand={false}
	bind:headerHeight={panelHeaderHeight}
>
	<div class="is-flex px-4 py-2" bind:clientHeight={headerHeight}>
		<div class="search-control">
			<SearchExpand
				bind:value={query}
				open={true}
				placeholder="Type keyword..."
				on:change={handleFilterInput}
				iconSize={16}
				fontSize={6}
				timeout={SearchDebounceTime}
				disabled={!tableData}
				loading={!tableData}
			/>
		</div>

		{#if tableData}
			<div
				class="ml-auto my-auto dropdown {showDownloadMenu ? 'is-active' : ''}"
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
							{@const fileUrl = tableData?.links.find((l) => l.rel === format)?.href}
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
	</div>

	<div class="table-contents mb-4" style="height: {tableHeight}px;">
		{#if !tableData}
			<div class="is-flex is-justify-content-center">
				<Loader />
			</div>
		{:else if tableData.features.length > 0}
			<div class="table-container attribute-table">
				<table class="table is-hoverable is-fullwidth">
					<thead>
						<tr>
							<th></th>
							{#each columns as col}
								<th>
									<p>{clean(col)}</p>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each tableData.features as feature, index}
							{#if feature.properties}
								<tr>
									<th class="row-number">{index + 1}</th>
									{#each columns as col}
										{@const value = feature.properties[col]}
										<td>
											{#if value}
												{value}
											{/if}
										</td>
									{/each}
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</div>

			<div class="pt-5">
				<Pagination
					bind:totalPages={tableData.pages.totalPages}
					bind:currentPage={tableData.pages.currentPage}
					hidden={tableData.pages.totalPages <= 1}
					on:clicked={handlePaginationClicked}
				/>
			</div>
		{:else}
			<Notification type="info" showIcon={false} showCloseButton={false}>
				No table content found in current map extent.
			</Notification>
		{/if}
	</div>
</FloatingPanel>

<style lang="scss">
	.search-control {
		max-width: 200px;
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

	.table-contents {
		.attribute-table {
			height: 100%;
			overflow: auto;

			.row-number {
				background-color: #edeff0;
				text-align: center;
			}

			th {
				white-space: nowrap;
			}
		}
	}
</style>
