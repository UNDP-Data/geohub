<script lang="ts">
	import type { StacCollections } from '$lib/types';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let selectedStac = data.stacs[0];
	let isInitialising: Promise<void>;

	let stacCollections: StacCollections;

	onMount(() => {
		isInitialising = initialise();
	});
	const initialise = async () => {
		stacCollections = await getCollections();
		console.log(stacCollections);
	};

	const getCollections = async () => {
		if (!selectedStac) return;
		const res = await fetch(`${selectedStac.url}/collections`);
		const collections: StacCollections = await res.json();
		return collections;
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
			{#if stacCollections}
				{@const collections = stacCollections.collections}
				<div class="table-container">
					<table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
						<thead>
							<tr>
								<th>No.</th>
								<th>Title</th>
								<th>STAC page</th>
								<th>Data Explorer</th>
							</tr>
						</thead>
						<tbody>
							{#if collections}
								{#each collections as colleciton, index}
									<tr>
										<td>{index + 1}</td>
										<td>{colleciton.title}</td>
										<td
											><a href={colleciton.links.find((l) => l.rel === 'self').href} target="_blank"
												>{colleciton.id}</a
											>
										</td>
										<td>
											<a href="/management/stac/{selectedStac.id}/{colleciton.id}">
												{colleciton.id}
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
							<th>Data Explorer</th>
						</tfoot>
					</table>
				</div>
			{/if}
		{/await}
	{/if}
</section>
