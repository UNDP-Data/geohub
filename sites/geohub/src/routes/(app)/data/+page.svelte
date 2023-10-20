<script lang="ts">
	import { invalidate } from '$app/navigation';
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

	const handleRefreshDatasets = async () => {
		datasets = undefined;
		await invalidate('data:datasets');
		datasets = data.datasets;
	};

	const handleRefreshIngestingDatasets = async () => {
		ingestingDatasets = undefined;
		await invalidate('data:ingestingDatasets');
		ingestingDatasets = data.ingestingDatasets;
	};

	enum TabNames {
		DATA = 'Data',
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

	let activeTab: string = tabs[0].label;
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
						<span>{tab.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
{/if}
<div class="m-4 pb-2 {data.session ? 'pt-4' : 'pt-6'}">
	<div hidden={activeTab !== TabNames.DATA}>
		<PublishedDatasets bind:datasets on:change={handleRefreshDatasets} />
	</div>
	<div hidden={activeTab !== TabNames.MYDATA}>
		{#if data.session}
			<div class="pb-4">
				<DataUploadButton />

				<button class="button is-primary my-2" on:click={handleRefreshIngestingDatasets}>
					<span class="icon">
						<i class="fa-solid fa-rotate" />
					</span>
					<span>Refresh</span>
				</button>
			</div>

			<IngestingDatasets datasets={ingestingDatasets} on:change={handleRefreshIngestingDatasets} />
		{/if}
	</div>
</div>

<section class="hero is-small">
	<div class="hero-body">
		<p class="title is-3 is-flex is-justify-content-center has-text-centered wordwrap">
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
