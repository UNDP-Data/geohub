<script lang="ts">
	import { afterNavigate, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import PublishedDatasets from '$components/pages/data/datasets/PublishedDatasets.svelte';
	import DataUploadButton from '$components/pages/data/ingesting/DataUploadButton.svelte';
	import IngestingDatasets from '$components/pages/data/ingesting/IngestingDatasets.svelte';
	import { getWebPubSubClient } from '$lib/WebPubSubClient';
	import { handleEnterKey } from '$lib/helper';
	import type { DatasetFeatureCollection, IngestingDataset } from '$lib/types';
	import { setContext } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let datasets: DatasetFeatureCollection = data.datasets;
	let ingestingDatasets: IngestingDataset[] = data.ingestingDatasets;

	// setup AzureWebPubSubClient instance and set it in context
	if (data.session) {
		const wpsClient = getWebPubSubClient(data.wss.url, data.wss.group);
		setContext(data.wss.group, wpsClient);
	}

	enum TabNames {
		DATA = 'Datasets',
		MYDATA = 'My data'
	}

	let tabs = [
		{
			id: '#data',
			label: TabNames.DATA,
			icon: 'fas fa-database'
		}
	];

	if (data.session) {
		tabs = [
			...tabs,
			{
				id: '#mydata',
				label: TabNames.MYDATA,
				icon: 'fas fa-user'
			}
		];
	}

	const hash = $page.url.hash;

	let activeTab: string = hash ? tabs.find((t) => t.id === hash)?.label : tabs[0].label;

	afterNavigate(async () => {
		await invalidateAll();
		datasets = data.datasets;
		ingestingDatasets = data.ingestingDatasets;
	});
</script>

{#if data.session}
	<div class="tabs is-fullwidth is-medium data-tabs">
		<ul>
			{#each tabs as tab}
				<li class={activeTab === tab.label ? 'is-active' : ''}>
					<a
						href={tab.id}
						role="tab"
						tabindex="0"
						on:click={() => (activeTab = tab.label)}
						on:keydown={handleEnterKey}
					>
						<span class="icon is-small"><i class={tab.icon} aria-hidden="true"></i></span>
						<span>
							{tab.label}
							{#if tab.label === TabNames.DATA}
								{@const datasetsCount = datasets?.pages?.totalCount ?? 0}
								{#if datasetsCount > 0}
									<span class="counter">{datasetsCount}</span>
								{/if}
							{:else if tab.label === TabNames.MYDATA}
								{@const ingestingDatasetsCount = ingestingDatasets?.length ?? 0}
								{#if ingestingDatasetsCount > 0}
									<span class="counter">{ingestingDatasetsCount}</span>
								{/if}
							{/if}
						</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
{/if}
<div class="m-4 pb-2 {data.session ? 'pt-4' : 'pt-6'}">
	<div hidden={activeTab !== TabNames.DATA}>
		<PublishedDatasets bind:datasets />
	</div>
	<div hidden={activeTab !== TabNames.MYDATA}>
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

<style lang="scss">
	.counter {
		background-color: rgb(233, 231, 231);
		border: max(1px, 0.0625rem) solid rgb(233, 231, 231);
		border-radius: 2em;
		color: #1c1c1c;
		display: inline-block;
		font-size: 1rem;
		font-weight: 500;
		line-height: calc(1.25rem - max(1px, 0.0625rem) * 2);
		min-width: var(--base-size-20, 1.25rem);
		padding: 0 6px;
		text-align: center;
	}
</style>
