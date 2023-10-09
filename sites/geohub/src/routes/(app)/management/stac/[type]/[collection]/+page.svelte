<script lang="ts">
	import StacAssetExplorer from '$components/stac/StacAssetExplorer.svelte';
	import type { StacCollection } from '$lib/types';
	import type { PageData } from './$types';

	export let data: PageData;

	let collection: StacCollection = data.collection;

	let thumbnail = collection.assets?.thumbnail;
</script>

<section class=" p-4">
	<h1 class="title is-1">{collection.title}</h1>

	{#if thumbnail}
		<div class="columns">
			<div class="column is-6">
				<img src={thumbnail.href} alt={thumbnail.title} />
			</div>
			<div class="column is-6">
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">ID</label>
					<div class="control">
						<p>{collection.id}</p>
					</div>
				</div>

				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">Description</label>
					<div class="control">
						<p>{collection.description}</p>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">ID</label>
			<div class="control">
				<p>{collection.id}</p>
			</div>
		</div>

		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Description</label>
			<div class="control">
				<p>{collection.description}</p>
			</div>
		</div>
	{/if}

	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label">License</label>
		<div class="control">
			<p>{collection.license}</p>
		</div>
	</div>

	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label">Providers</label>
		<div class="control">
			{#each collection.providers as provider, index}
				{#if index > 0}
					,
				{/if}
				<a href={provider.url} target="_blank">{provider.name}</a>
			{/each}
		</div>
	</div>

	<div class="my-4">
		<StacAssetExplorer stacType={data.stacType} collection={collection.id} />
	</div>
</section>
