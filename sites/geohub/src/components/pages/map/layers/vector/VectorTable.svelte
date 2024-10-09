<script lang="ts">
	import type { Link, Pages } from '$lib/types';
	import {
		MAPSTORE_CONTEXT_KEY,
		TABLE_LAYER_STORE_CONTEXT_KEY,
		TABLE_MENU_SHOWN_CONTEXT_KEY,
		type EditingLayerStore,
		type EditingMenuShownStore,
		type MapStore
	} from '$stores';
	import { clean, Notification } from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import type { Feature } from 'geojson';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const tableLayerStore: EditingLayerStore = getContext(TABLE_LAYER_STORE_CONTEXT_KEY);
	const tableMenuShownStore: EditingMenuShownStore = getContext(TABLE_MENU_SHOWN_CONTEXT_KEY);

	export let height = 0;

	let tableData:
		| { type: 'FeatureCollection'; features: Feature[]; links?: Link[]; pages?: Pages }
		| undefined;
	let columns: string[] = [];

	onMount(() => {
		tableLayerStore.subscribe(updateTable);
	});

	const updateTable = async () => {
		if (!$map) return;
		if (!$tableLayerStore) return;
		const dataset = $tableLayerStore.dataset;
		if (!dataset) return;
		const fgbUrls = $tableLayerStore.dataset?.properties.links?.filter((l) =>
			l.rel.startsWith('flatgeobuf')
		);
		tableData = undefined;
		if (fgbUrls && fgbUrls.length > 0) {
			const mapLayer = $map.getLayer($tableLayerStore.id);
			const vectorSourceLayer = mapLayer?.sourceLayer;

			const bounds = $map.getBounds();
			const bbox = [...bounds.toArray()[0], bounds.toArray()[1]].join(',');

			const baseApi = `/api/datasets/${dataset.properties.id}/table/layers/${vectorSourceLayer}.json?bbox=${bbox}`;
			const res = await fetch(baseApi);
			tableData = await res.json();
			console.log(tableData);
			if (tableData && tableData.features.length > 0) {
				columns = Object.keys(
					tableData.features[0].properties as unknown as { [key: string]: string }
				);
			}
		}
	};

	const handleClose = () => {
		$tableMenuShownStore = false;
	};
</script>

<button class="delete close-icon is-medium" on:click={handleClose}></button>

<div class="table-contents pb-2" style="height: {height}px;">
	{#if !tableData}
		<div class="is-flex is-justify-content-center">
			<Loader />
		</div>
	{:else if tableData.features.length > 0}
		<div class="table-container attribute-table">
			<table class="table is-hoverable is-fullwidth">
				<thead>
					<tr>
						{#each columns as col}
							<th>{clean(col)}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each tableData.features as feature}
						{#if feature.properties}
							<tr>
								{#each columns as col}
									{@const value = feature.properties[col]}
									<td>{value}</td>
								{/each}
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<Notification type="info" showIcon={false} showCloseButton={false}>
			No table content found.
		</Notification>
	{/if}
</div>

<style lang="scss">
	.table-contents {
		position: relative;

		.attribute-table {
			height: 100%;
			overflow: auto;
		}
	}

	.close-icon {
		position: absolute;
		top: 8px;
		right: 8px;
		cursor: pointer;
		z-index: 10;
	}
</style>
