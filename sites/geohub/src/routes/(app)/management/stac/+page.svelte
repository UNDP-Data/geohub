<script lang="ts">
	import type { StacCollection, StacCollections } from '$lib/types';
	import { Loader, SearchExpand } from '@undp-data/svelte-undp-design';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let selectedStac = data.stacs[0];
	let isInitialising: Promise<void>;

	let stacCollections: StacCollections;
	let filteredCollection: StacCollection[] = [];
	let query = '';

	onMount(() => {
		reload();
	});

	$: selectedStac, reload();

	const reload = () => {
		isInitialising = initialise();
	};

	const initialise = async () => {
		stacCollections = await getCollections();
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
							</tr>
						</thead>
						<tbody>
							{#if filteredCollection}
								{#each filteredCollection as collection, index}
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
									</tr>
								{/each}
							{/if}
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
