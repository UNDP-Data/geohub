<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import PublishedDatasets from '$components/pages/data/datasets/PublishedDatasets.svelte';
	import IngestingDatasets from '$components/pages/data/ingesting/IngestingDatasets.svelte';
	import { getWebPubSubClient } from '$lib/WebPubSubClient';
	import type { DatasetFeatureCollection, IngestingDataset } from '$lib/types';
	import {
		FieldControl,
		HeroHeader,
		HeroLink,
		ModalTemplate,
		type BreadcrumbPage,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import { onMount, setContext } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let datasets: DatasetFeatureCollection = data.datasets;
	let ingestingDatasets: IngestingDataset[] = data.ingestingDatasets;

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'datasets', url: $page.url.href }
	];

	// setup AzureWebPubSubClient instance and set it in context
	if (data.session && data.wss.url && data.wss.group) {
		const wpsClient = getWebPubSubClient(data.wss.url, data.wss.group);
		setContext(data.wss.group, wpsClient);
	}

	enum TabNames {
		DATA = 'Datasets',
		MYDATA = 'My data'
	}

	let tabs: Tab[] = [];

	const hash = $page.url.hash;

	let activeTab: string;

	let isDialogOpen = false;
	let externalUrl = '';

	let isValidExternalUrl = false;
	$: externalUrl, isValidUrl();

	const isValidUrl = () => {
		if (!externalUrl) {
			isValidExternalUrl = false;
			return;
		}
		try {
			const _url = new URL(externalUrl);

			const acceptableExts = ['.tiff', '.tif', '.pmtiles'];
			let isValidExt = false;
			acceptableExts.forEach((ext) => {
				if (_url.pathname.indexOf(ext) !== -1) {
					isValidExt = true;
				}
			});
			if (!isValidExt) {
				isValidExternalUrl = false;
				return;
			}

			isValidExternalUrl = true;
		} catch {
			isValidExternalUrl = false;
		}
	};

	const loadActiveTab = () => {
		if (tabs.length > 0) {
			activeTab = hash ? tabs.find((t) => t.id === hash)?.id : tabs[0].id;
		}
	};

	const updateCounters = () => {
		if (tabs.length === 0) return;
		tabs[0].counter = datasets?.pages?.totalCount ?? 0;
		if (tabs.length > 1) {
			tabs[1].counter = ingestingDatasets?.length ?? 0;
		}
	};

	const getActiveTabLabel = (id: string) => {
		if (tabs.length === 0) return TabNames.DATA;
		return tabs.find((t) => t.id === id).label;
	};

	onMount(() => {
		if (data.session) {
			tabs = [
				{
					id: '#data',
					label: TabNames.DATA
				},
				{
					id: '#mydata',
					label: TabNames.MYDATA
				}
			];
		}

		loadActiveTab();
		updateCounters();
	});

	$: datasets, updateCounters();
	$: ingestingDatasets, updateCounters();
</script>

<HeroHeader
	title="Datasets"
	bind:breadcrumbs
	bind:tabs
	bind:activeTab
	button={{
		title: 'Data upload',
		href: '/data/upload',
		tooltip: 'Please upload your datasets to GeoHub!'
	}}
	subButtons={data.session
		? [
				{
					title: 'Register remote file',
					href: '',
					tooltip: 'Register a cloud optiomized file from remote source',
					callback: () => {
						isDialogOpen = true;
						externalUrl = '';
					}
				}
			]
		: undefined}
/>

<div class="mx-6 my-4">
	<div class="pb-2 {data.session ? 'pt-4' : 'pt-6'}">
		<div hidden={getActiveTabLabel(activeTab) !== TabNames.DATA}>
			<PublishedDatasets bind:datasets />
		</div>
		<div hidden={getActiveTabLabel(activeTab) !== TabNames.MYDATA}>
			{#if data.session}
				<IngestingDatasets bind:datasets={ingestingDatasets} />
			{/if}
		</div>
	</div>
</div>

<HeroLink title="Analytical tools" linkName="Explore analytical tools" href="/tools">
	More and more geospatial analytical tools for decision making are being developed to GeoHub.
</HeroLink>

<ModalTemplate title="Register remote file" bind:show={isDialogOpen} showClose={true}>
	<div slot="content">
		<FieldControl
			title="Remote file URL"
			isFirstCharCapitalized={false}
			showHelpPopup={false}
			showHelp={true}
		>
			<div slot="help">
				<div class="content">
					<p>
						Paste a URL of cloud optimized file either COG or PMTiles from a remote data source.
						Currently, GeoHub supports:
					</p>

					<ul>
						<li><b>Cloud Optimized GeoTiff (COG)</b>: Raster dataset</li>
						<li><b>PMTiles</b>: Vector Tiles dataset</li>
					</ul>

					<p>A remote URL must be a public data source.</p>

					<p>
						<b>PMTiles</b> must be <b>pbf</b> format and includes <b>vector_layers</b> and
						<b>tilestats</b>
						properties in metadata since GeoHub requires statistics to generate GUI. Raster format in
						PMTiles is not supported.
					</p>
				</div>
			</div>
			<div slot="control">
				<input
					class="input"
					type="text"
					placeholder="paste a remote file URL"
					bind:value={externalUrl}
				/>
			</div>
		</FieldControl>
	</div>
	<div class="buttons" slot="buttons">
		<button
			class="button is-primary is-uppercase has-text-weight-bold"
			disabled={!isValidExternalUrl}
			on:click={() => {
				let dataUrl = externalUrl;
				if (dataUrl.indexOf('.pmtiles') !== -1) {
					dataUrl = `pmtiles://${dataUrl}`;
				}
				const editUrl = `/data/edit?url=${dataUrl}`;
				goto(editUrl);
			}}
		>
			Register
		</button>
	</div>
</ModalTemplate>
