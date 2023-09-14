<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import DataUploadButton from '$components/data-upload/DataUploadButton.svelte';
	import IngestingDatasets from '$components/data-upload/IngestingDatasets.svelte';
	import PublishedDatasets from '$components/data-upload/PublishedDatasets.svelte';
	import { SiteInfo } from '$lib/config/AppConfig';
	import { handleEnterKey } from '$lib/helper';
	import type { DatasetFeatureCollection, IngestingDataset } from '$lib/types';
	import { signIn } from '@auth/sveltekit/client';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let datasets: Promise<DatasetFeatureCollection> = data.promises.datasets;
	let ingestingDatasets: Promise<IngestingDataset[]> = data.promises.ingestingDatasets;

	let tabHeight = 0;

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

	onMount(() => {
		const hash = $page.url.hash;
		tabs.forEach((t) => {
			if (t.id === hash) {
				activeTab = t.label;
				return;
			}
		});
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={SiteInfo.site_name} />
	<meta property="og:type" content="article" />
	<meta name="description" content={SiteInfo.site_description} />
	<meta property="og:description" content={SiteInfo.site_description} />
	<meta name="twitter:description" content={SiteInfo.site_description} />
	<meta property="og:title" content={title} />
	<meta property="og:image" content="{$page.url.origin}/api/og?content={content}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:image" content="{$page.url.origin}/api/og?content={content}" />
	<meta property="og:url" content="{$page.url.origin}{$page.url.pathname}" />
</svelte:head>

{#if data.session}
	<div class="tabs is-fullwidth is-medium data-tabs" bind:clientHeight={tabHeight}>
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
<div class="m-4 py-2">
	<div hidden={activeTab !== TabNames.DATA}>
		<PublishedDatasets bind:datasets on:change={updateDatasets} />
	</div>
	<div hidden={activeTab !== TabNames.MYDATA}>
		{#if data.session}
			<div class="pb-4">
				<DataUploadButton />

				<button class="button is-primary my-2" on:click={handleRefresh}>
					<span class="icon">
						<i class="fa-solid fa-rotate" />
					</span>
					<span>Refresh</span>
				</button>
			</div>

			{#await ingestingDatasets}
				<div class="is-flex is-justify-content-center my-4">
					<Loader />
				</div>
			{:then ds}
				<IngestingDatasets datasets={ds} on:change={updateDatasets} />
			{/await}
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
				<button class="button is-primary is-large" on:click={() => signIn('azure-ad')}>
					SIGN IN
				</button>
			{/if}
		</div>
	</div>
</section>
