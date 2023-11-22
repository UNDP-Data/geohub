<script context="module" lang="ts">
	interface StacPage {
		title: string;
		url: string;
		type: 'Catalog' | 'Collection' | 'Item';
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import BackToPreviousPage from '$components/util/BackToPreviousPage.svelte';
	import { clean, handleEnterKey, resolveRelativeUrl } from '$lib/helper';
	import type { Link, StacCatalog } from '$lib/types';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import StacCatalogCollections from './StacCatalogCollections.svelte';
	import StacCatalogItem from './StacCatalogItem.svelte';

	export let data: PageData;
	const stacId = $page.url.searchParams.get('stac');

	let selectedStac = stacId ? data.stacCatalogs.find((s) => s.id === stacId) : data.stacCatalogs[0];
	let isInitialising: Promise<void>;

	let stacCatalog: StacCatalog;

	let stacPages: StacPage[];

	onMount(() => {
		reload();
	});

	const reload = () => {
		isInitialising = initialise();
	};

	const initialise = async () => {
		if (!selectedStac) return;
		const res = await fetch(selectedStac.url);
		stacCatalog = await res.json();

		stacPages = [
			{
				title: clean(stacCatalog.id),
				url: selectedStac.url,
				type: 'Catalog'
			}
		];
	};

	const handleSelectChanged = () => {
		const url = $page.url;
		url.searchParams.set('stac', selectedStac.id);
		goto(url, { replaceState: true, noScroll: true, keepFocus: true, invalidateAll: false });
		reload();
	};

	const handleSelectCollection = (link: Link) => {
		const parts = link.href.replace('/collection.json', '').split('/');
		const collectionId = parts[parts.length - 1];
		const url = link.href.startsWith('./')
			? resolveRelativeUrl(link.href, selectedStac.url)
			: link.href;

		stacPages = [
			...stacPages,
			{
				title: link.title ?? clean(collectionId),
				url: url,
				type: 'Collection'
			}
		];
	};

	const handleSelectChild = (e: { detail: StacPage }) => {
		const data = e.detail as StacPage;
		stacPages = [...stacPages, data];
	};

	const handleBreadcrumbClicked = (page: StacPage) => {
		if (stacPages?.length > 0) {
			const pageIndex = stacPages.findIndex((p) => p.title === page.title);
			stacPages = [...stacPages.slice(0, pageIndex + 1)];
		}
	};
</script>

<section class=" p-4">
	<h1 class="title">STAC Catalog Management tools</h1>

	<div class="my-2"><BackToPreviousPage defaultLink="/management/stac" /></div>

	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label">Select STAC</label>
		<div class="control">
			<div class="select is-link">
				<select bind:value={selectedStac} on:change={handleSelectChanged}>
					{#each data.stacCatalogs as stac}
						<option value={stac}>{stac.name}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	{#if selectedStac}
		{#await isInitialising}
			<div class="is-flex is-justify-content-center">
				<Loader size="large" />
			</div>
		{:then}
			{#if stacCatalog}
				<p class="is-size-6 mb-4">{stacCatalog.description}</p>
			{/if}

			{#if stacPages && stacPages.length > 0}
				<nav class="breadcrumb has-text-weight-bold" aria-label="breadcrumbs">
					<ul>
						{#each stacPages as page, index}
							{#if index === stacPages.length - 1}
								<li class="is-active">
									<!-- svelte-ignore a11y-missing-attribute -->
									<a
										aria-current="page"
										data-sveltekit-preload-data="off"
										data-sveltekit-preload-code="off">{page.title}</a
									>
								</li>
							{:else}
								<li>
									<!-- svelte-ignore a11y-missing-attribute -->
									<a
										role="button"
										tabindex="0"
										on:click={() => {
											handleBreadcrumbClicked(page);
										}}
										on:keydown={handleEnterKey}
										data-sveltekit-preload-data="off"
										data-sveltekit-preload-code="off"
									>
										{page.title}
									</a>
								</li>
							{/if}
						{/each}
					</ul>
				</nav>

				{#each stacPages as page, index}
					{@const isLastPage = index === stacPages.length - 1}
					<div hidden={!isLastPage}>
						{#if page.type === 'Catalog'}
							<div class="table-container">
								<table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
									<thead>
										<tr>
											<th>No.</th>
											<th>Title</th>
											<th>STAC page</th>
										</tr>
									</thead>
									<tbody>
										{#each stacCatalog.links as link, index}
											{#if link.rel === 'child'}
												{@const parts = link.href.replace('/collection.json', '').split('/')}
												{@const collectionId = parts[parts.length - 1]}
												{@const url = link.href.startsWith('./')
													? `${link.href.replace(
															'./',
															selectedStac.url.replace('catalog.json', '')
													  )}`
													: link.href}
												<tr>
													<td>{index + 1}</td>
													<td>
														<!-- svelte-ignore a11y-missing-attribute -->
														<a
															role="button"
															tabindex="0"
															data-sveltekit-preload-data="off"
															data-sveltekit-preload-code="off"
															on:click={() => {
																handleSelectCollection(link);
															}}
															on:keydown={handleEnterKey}
														>
															{#if link.title}
																{link.title}
															{:else}
																{clean(collectionId)}
															{/if}
														</a>
													</td>
													<td>
														<a href={url} target="_blank"> STAC API </a>
													</td>
												</tr>
											{/if}
										{/each}
									</tbody>
									<tfoot>
										<th>No.</th>
										<th>Title</th>
										<th>STAC page</th>
									</tfoot>
								</table>
							</div>
						{:else if page.type === 'Collection'}
							<StacCatalogCollections bind:url={page.url} on:selected={handleSelectChild} />
						{:else if page.type === 'Item'}
							<StacCatalogItem bind:stacId={selectedStac.id} bind:url={page.url} />
						{:else}
							error
						{/if}
					</div>
				{/each}
			{/if}
		{/await}
	{/if}
</section>
