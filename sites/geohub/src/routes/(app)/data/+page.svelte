<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import PublishedDatasets from '$components/data-upload/PublishedDatasets.svelte';
	import IngestingDatasets from '$components/data-upload/IngestingDatasets.svelte';
	import type { DatasetFeatureCollection, IngestingDataset } from '$lib/types';
	import DataUploadButton from '$components/data-upload/DataUploadButton.svelte';
	import { SiteInfo } from '$lib/config/AppConfig';
	import { Tabs, type Tab } from '@undp-data/svelte-undp-design';

	export let data: PageData;

	let datasets: Promise<DatasetFeatureCollection> = data.promises.datasets;
	let ingestingDatasets: Promise<IngestingDataset[]> = data.promises.ingestingDatasets;

	const updateDatasets = () => {
		datasets = data.promises.datasets;
		ingestingDatasets = data.promises.ingestingDatasets;
	};

	const handleRefresh = async () => {
		await invalidateAll();
		updateDatasets();
	};

	let title = 'Data | GeoHub';
	let content = 'Data Portal';

	enum TabNames {
		DATA = 'Data',
		MYDATA = 'My data'
	}

	let tabs: Tab[] = [
		{
			label: TabNames.DATA,
			icon: 'fas fa-database'
		}
	];

	if (data.session) {
		tabs = [
			...tabs,
			{
				label: TabNames.MYDATA,
				icon: 'fas fa-user'
			}
		];
	}

	let activeTab: string = tabs[0].label;
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={SiteInfo.site_name} />
	<meta property="og:type" content="article" />
	<meta name="description" content={SiteInfo.site_description} />
	<meta property="og:description" content={SiteInfo.site_description} />
	<meta name="twitter:description" content={SiteInfo.site_description} />
	<meta property="og:title" content={title} />
	<meta property="og:image" content="/api/og?content={content}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:image" content="/api/og?content={content}" />
	<meta property="og:url" content="{$page.url.origin}{$page.url.pathname}" />
</svelte:head>

{#if data.session}
	<Tabs bind:tabs bind:activeTab fontSize="large" />
{/if}

<div class="m-2">
	<div hidden={activeTab !== TabNames.DATA}>
		<PublishedDatasets bind:datasets on:change={updateDatasets} />
	</div>
	<div hidden={activeTab !== TabNames.MYDATA}>
		{#if data.session}
			<DataUploadButton />

			<button class="button is-primary my-2" on:click={handleRefresh}>
				<span class="icon">
					<i class="fa-solid fa-rotate" />
				</span>
				<span>Refresh</span>
			</button>

			<p class="title align-center mb-4">Ingesting datasets</p>

			<IngestingDatasets bind:datasets={ingestingDatasets} on:change={updateDatasets} />
		{/if}
	</div>
</div>

<style lang="scss">
	.align-center {
		width: max-content;
		margin: auto;
	}
</style>
