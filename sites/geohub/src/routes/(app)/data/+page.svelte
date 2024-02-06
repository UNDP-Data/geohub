<script lang="ts">
	// import { afterNavigate, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import PublishedDatasets from '$components/pages/data/datasets/PublishedDatasets.svelte';
	import DataUploadButton from '$components/pages/data/ingesting/DataUploadButton.svelte';
	import IngestingDatasets from '$components/pages/data/ingesting/IngestingDatasets.svelte';
	import Breadcrumbs, { type BreadcrumbPage } from '$components/util/Breadcrumbs.svelte';
	import type { Tab } from '$components/util/Tabs.svelte';
	import Tabs from '$components/util/Tabs.svelte';
	import { getWebPubSubClient } from '$lib/WebPubSubClient';
	import type { DatasetFeatureCollection, IngestingDataset } from '$lib/types';
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
	if (data.session) {
		const wpsClient = getWebPubSubClient(data.wss.url, data.wss.group);
		setContext(data.wss.group, wpsClient);
	}

	enum TabNames {
		DATA = 'Datasets',
		MYDATA = 'My data'
	}

	let tabs: Tab[] = [
		{
			id: '#data',
			label: TabNames.DATA
		}
	];

	if (data.session) {
		tabs = [
			...tabs,
			{
				id: '#mydata',
				label: TabNames.MYDATA
			}
		];
	}

	const hash = $page.url.hash;

	let activeTab: string = hash ? tabs.find((t) => t.id === hash)?.id : tabs[0].id;

	const updateCounters = () => {
		tabs[0].counter = datasets?.pages?.totalCount ?? 0;
		if (tabs.length > 1) {
			tabs[1].counter = ingestingDatasets?.length ?? 0;
		}
	};

	const getActiveTabLabel = (id: string) => {
		return tabs.find((t) => t.id === id).label;
	};

	onMount(() => {
		updateCounters();
	});

	$: datasets, updateCounters();
	$: ingestingDatasets, updateCounters();
</script>

<div class="has-background-light px-6 pt-4">
	<div class="py-4"><Breadcrumbs pages={breadcrumbs} /></div>

	<p class="title is-3 mt-6 mb-4">Datasets</p>

	<div class="is-fullwidth">
		{#if data.session}
			<Tabs
				bind:tabs
				bind:activeTab
				fontWeight="bold"
				isBoxed={false}
				isFullwidth={false}
				isCentered={false}
				isUppercase={true}
			/>
		{/if}
	</div>
</div>

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

	<section class="hero is-small">
		<div class="hero-body">
			<p class="title is-4 is-flex is-justify-content-center has-text-centered wordwrap">
				No datasets found?
				{#if !data.session}
					Please sign in to your account first,
					<br />
					then please upload your datasets to GeoHub!
				{:else}
					Please upload your datasets to GeoHub!
				{/if}
			</p>
			<div class="is-flex is-justify-content-center has-text-centered">
				{#if data.session}
					<DataUploadButton size="large" />
				{:else}
					<a class="button is-primary is-large" href="/auth/signIn"> SIGN IN </a>
				{/if}
			</div>
		</div>
	</section>
</div>
