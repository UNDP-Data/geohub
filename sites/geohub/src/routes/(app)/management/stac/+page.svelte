<script lang="ts">
	import type { DatasetFeatureCollection, StacCollection, StacCollections } from '$lib/types';
	import { Loader, SearchExpand } from '@undp-data/svelte-undp-design';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import type { StacTemplate } from '$lib/stac/StacTemplate';
	import { getStacInstance } from '$lib/stac/getStacInstance';
	import { generateHashKey } from '$lib/helper';

	export let data: PageData;

	let selectedStac = data.stacs[0];
	let isInitialising: Promise<void>;

	let stacCollections: StacCollections;
	let filteredCollection: StacCollection[] = [];
	let geohubDatasets: DatasetFeatureCollection;
	let query = '';
	let isProcessing = false;

	onMount(() => {
		reload();
	});

	$: selectedStac, reload();

	const reload = () => {
		isInitialising = initialise();
	};

	const initialise = async () => {
		stacCollections = await getCollections();
		geohubDatasets = await getDatasets();
	};

	const getDatasets = async () => {
		const res = await fetch(`/api/datasets?type=stac&stac=${selectedStac.id}`);
		const json = await res.json();
		return json as DatasetFeatureCollection;
	};

	const getCollections = async () => {
		if (!selectedStac) return;
		const res = await fetch(`${selectedStac.url}/collections`);
		const collections: StacCollections = await res.json();
		filteredCollection = collections.collections;
		return collections;
	};

	const handleFilterInput = () => {
		if (query) {
			const text = query.toLowerCase();
			filteredCollection = stacCollections.collections.filter((c) => {
				return (
					c.title.toLowerCase().indexOf(text) > -1 || c.description.toLowerCase().indexOf(text) > -1
				);
			});
		} else {
			filteredCollection = stacCollections.collections;
		}
	};

	const handleRegister = async (collectionId: string) => {
		isProcessing = true;
		try {
			let stacInstance: StacTemplate;
			stacInstance = getStacInstance(selectedStac.id, collectionId);
			await stacInstance.getStacCollection();
			const feature = await stacInstance.generateCollectionDatasetFeature();

			const formData = new FormData();
			formData.append('feature', JSON.stringify(feature));
			const res = await fetch(`${$page.url.pathname}?/register`, {
				method: 'POST',
				body: formData
			});
			if (!res.ok) {
				const message = 'Failed to complete registering';
				toast.push(message);
				throw new Error(message);
			}
			await res.json();

			toast.push(`The STAC collection was registered successfully`);

			reload();
		} finally {
			isProcessing = false;
		}
	};

	const handleDelete = async (collection: StacCollection) => {
		isProcessing = true;
		try {
			const collectionUrl = collection.links.find((l) => l.rel === 'items').href;
			const key = generateHashKey(collectionUrl);

			const res = await fetch(`/api/datasets/${key}`, {
				method: 'DELETE'
			});
			if (!res.ok) {
				const message = 'Failed to delete';
				toast.push(message);
				throw new Error(message);
			}
			toast.push(`The STAC collection was deleted successfully`);

			reload();
		} finally {
			isProcessing = false;
		}
	};
</script>

<section class=" p-4">
	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label">Select STAC</label>
		<div class="control">
			<div class="select is-link">
				<select bind:value={selectedStac}>
					{#each data.stacs as stac}
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
			<div class="search p-4">
				<SearchExpand
					bind:value={query}
					open={true}
					placeholder="Type keyword..."
					on:change={handleFilterInput}
					iconSize={24}
					fontSize={5}
					timeout={500}
				/>
			</div>
			{#if filteredCollection}
				<div class="table-container">
					<table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
						<thead>
							<tr>
								<th>No.</th>
								<th>Title</th>
								<th>STAC page</th>
								<th>Operation</th>
							</tr>
						</thead>
						<tbody>
							{#if filteredCollection}
								{#each filteredCollection as collection, index}
									{@const collectionUrl = collection.links.find((l) => l.rel === 'items').href}
									{@const id = generateHashKey(collectionUrl)}
									{@const registred = geohubDatasets.features.find((f) => f.properties.id === id)
										? true
										: false}
									<tr>
										<td>{index + 1}</td>
										<td>
											<a href="/management/stac/{selectedStac.id}/{collection.id}">
												{collection.title}
											</a>
										</td>
										<td>
											<a href={collection.links.find((l) => l.rel === 'self').href} target="_blank">
												STAC API
											</a>
										</td>
										<td>
											{#if registred}
												<button
													class="button is-link is-small {isProcessing ? 'is-loading' : ''}"
													disabled={isProcessing}
													on:click={() => {
														handleDelete(collection);
													}}>Delete</button
												>
											{:else}
												<button
													class="button is-primary is-small {isProcessing ? 'is-loading' : ''}"
													disabled={isProcessing}
													on:click={() => {
														handleRegister(collection.id);
													}}>Register</button
												>
											{/if}
										</td>
									</tr>
								{/each}
							{/if}
						</tbody>
						<tfoot>
							<th>No.</th>
							<th>Title</th>
							<th>STAC page</th>
							<th>Operation</th>
						</tfoot>
					</table>
				</div>
			{/if}
		{/await}
	{/if}
</section>

<SvelteToast />
