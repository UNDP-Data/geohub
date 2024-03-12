<script lang="ts">
	import { page } from '$app/stores';
	import PublishedDatasets from '$components/pages/data/datasets/PublishedDatasets.svelte';
	import IngestingDatasets from '$components/pages/data/ingesting/IngestingDatasets.svelte';
	import { getWebPubSubClient } from '$lib/WebPubSubClient';
	import type { DatasetFeatureCollection, IngestingDataset } from '$lib/types';
	import {
		Breadcrumbs,
		HeroLink,
		Tabs,
		initTooltipTippy,
		type BreadcrumbPage,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import { onMount, setContext } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const tippyTooltip = initTooltipTippy();

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

<div class="has-background-light px-6 {data.session ? 'pt-4' : 'py-4'}">
	<div class="py-4"><Breadcrumbs pages={breadcrumbs} /></div>

	<div class="is-flex mt-6 mb-5">
		<p class="title is-3">Datasets</p>

		{#if data.session}
			<div class="ml-auto hidden-mobile">
				<a
					class="button is-primary is-uppercase has-text-weight-bold"
					href="/data/upload"
					use:tippyTooltip={{ content: 'Please upload your datasets to GeoHub!' }}
				>
					Data upload
				</a>
			</div>
		{/if}
	</div>

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

<style lang="scss">
	.hidden-mobile {
		@media (max-width: 48em) {
			display: none;
		}
	}
</style>
