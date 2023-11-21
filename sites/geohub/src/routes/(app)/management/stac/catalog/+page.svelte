<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import BackToPreviousPage from '$components/util/BackToPreviousPage.svelte';
	import { clean } from '$lib/helper';
	import type { StacCatalog } from '$lib/types';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	const stacId = $page.url.searchParams.get('stac');

	let selectedStac = stacId ? data.stacCatalogs.find((s) => s.id === stacId) : data.stacCatalogs[0];
	let isInitialising: Promise<void>;

	let stacCatalog: StacCatalog;

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
	};

	const handleSelectChanged = () => {
		const url = $page.url;
		url.searchParams.set('stac', selectedStac.id);
		goto(url, { replaceState: true, noScroll: true, keepFocus: true, invalidateAll: false });
		reload();
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
										? `${link.href.replace('./', selectedStac.url.replace('catalog.json', ''))}`
										: link.href}
									<tr>
										<td>{index + 1}</td>
										<td>
											<a href="/management/stac/catalog/{selectedStac.id}?url={url}">
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
			{/if}
		{/await}
	{/if}
</section>

<SvelteToast />
