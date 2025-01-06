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
		MenuButton,
		ModalTemplate,
		type BreadcrumbPage,
		type MenuButtonType,
		type MenuSubButtonType,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import { onMount, setContext } from 'svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let datasets: DatasetFeatureCollection | undefined = $state();
	let ingestingDatasets: IngestingDataset[] | undefined = $state();

	let breadcrumbs: BreadcrumbPage[] = $state([
		{ title: 'home', url: '/' },
		{ title: 'datasets', url: $page.url.href }
	]);

	// setup AzureWebPubSubClient instance and set it in context
	if (data.session && data.wss.url && data.wss.group) {
		const wpsClient = getWebPubSubClient(data.wss.url, data.wss.group);
		setContext(data.wss.group, wpsClient);
	}

	// svelte-ignore non_reactive_update
	enum TabNames {
		DATA = 'Datasets',
		MYDATA = 'My data',
		UPLOADED = 'Uploaded data'
	}

	let tabs: Tab[] = $state([]);

	const hash = $page.url.hash;

	let activeTab: string = $state('');

	let isDialogOpen = $state(false);
	let externalUrl = $state('');

	let isValidExternalUrl = $state(false);

	let uploadButton: MenuButtonType = $state({
		title: 'Data upload',
		href: '/data/upload',
		tooltip: 'Please upload your datasets to GeoHub!'
	});
	let uploadSubButtons: MenuSubButtonType[] | undefined = $state();

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
			activeTab = hash ? (tabs.find((t) => t.id === hash)?.id as string) : tabs[0].id;
		}
	};

	const updateCounters = () => {
		if (tabs.length === 0) return;

		if (activeTab === '#mydata') {
			tabs[0].counter = 0;
			if (tabs.length > 1) {
				tabs[1].counter = datasets?.pages?.totalCount ?? 0;
			}
		} else {
			tabs[0].counter = datasets?.pages?.totalCount ?? 0;
			if (tabs.length > 1) {
				tabs[1].counter = 0;
			}
		}

		if (tabs.length > 2) {
			tabs[2].counter = ingestingDatasets?.length ?? 0;
		}
	};

	const getActiveTabLabel = (id: string) => {
		if (tabs.length === 0) return TabNames.DATA;
		return tabs.find((t) => t.id === id)?.label ?? TabNames.DATA;
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
				},
				{
					id: '#uploadeddata',
					label: TabNames.UPLOADED
				}
			];

			uploadSubButtons = [
				{
					title: 'Register remote file',
					href: '',
					tooltip: 'Register a cloud optiomized file from remote source',
					callback: () => {
						isDialogOpen = true;
						externalUrl = '';
					}
				}
			];
		}

		loadActiveTab();
		updateCounters();
	});

	let showMydata = $derived(activeTab === '#mydata');

	$effect(() => {
		isValidUrl();
		updateCounters();
	});
</script>

<HeroHeader title="Datasets" bind:breadcrumbs bind:tabs bind:activeTab />

<div class="m-6">
	<div class="pb-2 {data.session ? 'pt-4' : 'pt-6'}">
		<div hidden={getActiveTabLabel(activeTab) === TabNames.UPLOADED}>
			{#key showMydata}
				<PublishedDatasets bind:datasets showMyData={showMydata}>
					{#snippet button()}
						<div class="pl-1">
							<MenuButton
								color="primary"
								bind:button={uploadButton}
								bind:subButtons={uploadSubButtons}
							/>
						</div>
					{/snippet}
				</PublishedDatasets>
			{/key}
		</div>
		{#if data.session}
			<div hidden={getActiveTabLabel(activeTab) !== TabNames.UPLOADED}>
				<IngestingDatasets bind:datasets={ingestingDatasets}>
					{#snippet button()}
						<div>
							<MenuButton
								color="primary"
								bind:button={uploadButton}
								bind:subButtons={uploadSubButtons}
							/>
						</div>
					{/snippet}
				</IngestingDatasets>
			</div>
		{/if}
	</div>
</div>

<ModalTemplate title="Register remote file" bind:show={isDialogOpen} showClose={true}>
	{#snippet content()}
		<div>
			<FieldControl
				title="Remote file URL"
				isFirstCharCapitalized={false}
				showHelpPopup={false}
				showHelp={true}
			>
				{#snippet help()}
					<div>
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
								properties in metadata since GeoHub requires statistics to generate GUI. Raster format
								in PMTiles is not supported.
							</p>
						</div>
					</div>
				{/snippet}
				{#snippet control()}
					<div>
						<input
							class="input"
							type="text"
							placeholder="paste a remote file URL"
							bind:value={externalUrl}
						/>
					</div>
				{/snippet}
			</FieldControl>
		</div>
	{/snippet}
	{#snippet buttons()}
		<div class="buttons">
			<button
				class="button is-primary is-uppercase has-text-weight-bold"
				disabled={!isValidExternalUrl}
				onclick={() => {
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
	{/snippet}
</ModalTemplate>
