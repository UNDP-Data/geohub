<script lang="ts">
	import { handleEnterKey, resolveRelativeUrl } from '$lib/helper';
	import type { Link, StacCollection, StacItemFeature } from '$lib/types';
	import { DefaultLink, Loader } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	export let url: string;

	let isInitialising: Promise<StacCollection>;
	let collections: StacCollection;

	onMount(() => {
		isInitialising = initialise();
	});

	const initialise = async () => {
		collections = await fetchCollection(url);
		return collections;
	};

	const fetchCollection = async (collectionUrl: string) => {
		const res = await fetch(collectionUrl);
		return (await res.json()) as StacCollection;
	};

	const fetchItem = async (itemUrl: string) => {
		const res = await fetch(itemUrl);
		const json: StacItemFeature = await res.json();
		return json;
	};

	const handleSelectChild = (link: Link, title: string) => {
		const childUrl = resolveRelativeUrl(link.href, url);
		if (link.rel === 'child') {
			dispatch('selected', {
				title: title,
				url: childUrl,
				type: 'Collection',
				parentUrl: url
			});
		} else if (link.rel === 'item') {
			dispatch('selected', {
				title: title,
				url: childUrl,
				type: 'Item',
				parentUrl: url
			});
		}
	};
</script>

{#await isInitialising}
	<Loader size="small" />
{:then}
	{#if collections}
		<p class="is-size-6 mb-4">{collections.description}</p>

		<table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
			<thead>
				<tr>
					<th>Title</th>
					<td>Type</td>
					<th>STAC page</th>
				</tr>
			</thead>
			<tbody>
				{#each collections.links as link}
					{#if ['child', 'item'].includes(link.rel)}
						{@const childUrl = resolveRelativeUrl(link.href, url)}

						<tr>
							<td>
								{#if link.rel === 'child'}
									{#await fetchCollection(childUrl)}
										<Loader size="small" />
									{:then collection}
										{@const title = collection.title ?? collection.id}
										<!-- svelte-ignore a11y-missing-attribute -->
										<a
											role="button"
											tabindex="0"
											data-sveltekit-preload-data="off"
											data-sveltekit-preload-code="off"
											on:click={() => {
												handleSelectChild(link, title);
											}}
											on:keydown={handleEnterKey}
										>
											{title}
										</a>
									{/await}
								{:else if link.rel === 'item'}
									{#await fetchItem(childUrl)}
										<Loader size="small" />
									{:then item}
										<!-- svelte-ignore a11y-missing-attribute -->
										<a
											role="button"
											tabindex="0"
											data-sveltekit-preload-data="off"
											data-sveltekit-preload-code="off"
											on:click={() => {
												handleSelectChild(link, item.id);
											}}
											on:keydown={handleEnterKey}
										>
											{item.id}
										</a>
									{/await}
								{/if}
							</td>
							<td>{link.rel}</td>
							<td>
								<DefaultLink href={childUrl} title="STAC link" target="_blank" />
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	{/if}
{/await}
