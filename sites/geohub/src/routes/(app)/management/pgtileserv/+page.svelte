<script lang="ts">
	import { page } from '$app/stores';
	import { generateHashKey } from '$lib/helper';
	import type { DatasetFeatureCollection, PgtileservLayer } from '$lib/types';
	import {
		Breadcrumbs,
		Notification,
		handleEnterKey,
		type BreadcrumbPage
	} from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import PgtileserveTable from './PgtileserveTable.svelte';

	export let data: PageData;

	interface ManagedPgtileservLayer extends PgtileservLayer {
		url: string;
		key: string;
	}

	let isLoading: Promise<void>;

	let tableLayers: ManagedPgtileservLayer[] = [];
	let functionLayers: ManagedPgtileservLayer[] = [];

	let tableDatasets: DatasetFeatureCollection;
	let functionDatasets: DatasetFeatureCollection;

	let selectedTab: 'table' | 'function' = 'table';

	onMount(() => {
		isLoading = initialise();
	});

	const initialise = async () => {
		const pgtileservJSON = await getPgtileServeJSON();

		Object.keys(pgtileservJSON).forEach((id) => {
			const layer: ManagedPgtileservLayer = pgtileservJSON[id];
			layer.url = `${layer.detailurl.replace('.json', '/{z}/{x}/{y}.pbf')}`;
			layer.key = generateHashKey(layer.url);
			if (layer.type === 'table') {
				tableLayers.push(layer);
			} else if (layer.type === 'function') {
				functionLayers.push(layer);
			}
		});

		tableDatasets = await getGeoHubTableDatasets();
		functionDatasets = await getGeoHubFunctionDatasets();
	};

	const getPgtileServeJSON = async () => {
		const res = await fetch(`${data.pgtileservUrl}/index.json`);
		const json = await res.json();
		return json as { [key: string]: ManagedPgtileservLayer };
	};

	const getGeoHubTableDatasets = async () => {
		const res = await fetch(`/api/datasets?type=pgtileserv&layertype=table&limit=9999`);
		const json = await res.json();
		return json as DatasetFeatureCollection;
	};

	const getGeoHubFunctionDatasets = async () => {
		const res = await fetch(`/api/datasets?type=pgtileserv&layertype=function&limit=9999`);
		const json = await res.json();
		return json as DatasetFeatureCollection;
	};

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'management', url: '/management' },
		{ title: 'pg_tileserv layers', url: $page.url.href }
	];
</script>

<div class="has-background-light px-6 py-4">
	<div class="py-4"><Breadcrumbs pages={breadcrumbs} /></div>

	<p class="title is-3 mt-6 mb-5">{breadcrumbs[breadcrumbs.length - 1].title}</p>
</div>

<div class="ml-6 mr-4 my-4">
	{#await isLoading}
		<div class="is-flex is-justify-content-center">
			<Loader size="large" />
		</div>
	{:then}
		<div class="tabs is-fullwidth">
			<ul>
				<li class={selectedTab === 'table' ? 'is-active' : ''}>
					<!-- svelte-ignore a11y-missing-attribute -->
					<a
						role="tab"
						tabindex="0"
						on:keydown={handleEnterKey}
						on:click={() => {
							selectedTab = 'table';
						}}
					>
						<span class="icon"><i class="fas fa-table" aria-hidden="true"></i></span>
						<span>Table layers</span>
					</a>
				</li>
				<li class={selectedTab === 'function' ? 'is-active' : ''}>
					<!-- svelte-ignore a11y-missing-attribute -->
					<a
						role="tab"
						tabindex="0"
						on:keydown={handleEnterKey}
						on:click={() => {
							selectedTab = 'function';
						}}
					>
						<span class="icon"><i class="fas fa-rocket" aria-hidden="true"></i></span>
						<span>Function layers</span>
					</a>
				</li>
			</ul>
		</div>

		<div hidden={selectedTab !== 'table'}>
			{#if tableLayers.length === 0}
				<Notification type="info">No layers found.</Notification>
			{:else}
				<PgtileserveTable bind:layers={tableLayers} bind:datasets={tableDatasets} />
			{/if}
		</div>

		<div hidden={selectedTab !== 'function'}>
			{#if functionLayers.length === 0}
				<Notification type="info">No layers found.</Notification>
			{:else}
				<PgtileserveTable bind:layers={functionLayers} bind:datasets={functionDatasets} />
			{/if}
		</div>
	{/await}
</div>
