<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ALGORITHM_TAG_KEY } from '$components/pages/map/data/RasterAlgorithmExplorer.svelte';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import { AccessLevel } from '$lib/config/AppConfig';
	import { generateHashKey } from '$lib/helper';
	import type { StacTemplate } from '$lib/stac/StacTemplate';
	import { getStacInstance } from '$lib/stac/getStacInstance';
	import type { DatasetFeatureCollection, StacCollection, StacCollections, Tag } from '$lib/types';
	import {
		FieldControl,
		HeroHeader,
		ModalTemplate,
		type BreadcrumbPage,
		type RasterAlgorithm
	} from '@undp-data/svelte-undp-components';
	import { Loader, SearchExpand } from '@undp-data/svelte-undp-design';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let stac = data.stac;

	let toolTags: Tag[] = $state([]);
	let isInitialising: Promise<void> | undefined = $state();
	let accessLevel: AccessLevel = $state(
		data.isRegistered ? data.dataset.properties.access_level : AccessLevel.PUBLIC
	);
	let stacCollections: StacCollections;
	let filteredCollection: StacCollection[] = $state([]);
	let geohubDatasets: DatasetFeatureCollection | undefined = $state();
	let query = $state(page.url.searchParams.get('query') ?? '');
	let isProcessing = $state(false);

	onMount(() => {
		reload();
		getAlgorithms();
	});

	const reload = () => {
		isInitialising = initialise();
	};

	const initialise = async () => {
		stacCollections = await getCollections();
		geohubDatasets = await getDatasets();
		handleFilterInput();
	};

	const getDatasets = async () => {
		const res = await fetch(`/api/datasets?type=stac&stac=${stac.id}&limit=999`);
		const json = await res.json();
		return json as DatasetFeatureCollection;
	};

	const getCollections = async () => {
		if (!stac) return;
		const res = await fetch(`${stac.url}/collections`);
		const collections: StacCollections = await res.json();
		filteredCollection = collections.collections;
		return collections;
	};

	const handleFilterInput = () => {
		const url = page.url;
		if (query) {
			const text = query.toLowerCase();
			filteredCollection = stacCollections.collections.filter((c) => {
				return (
					c.title.toLowerCase().indexOf(text) > -1 || c.description.toLowerCase().indexOf(text) > -1
				);
			});
			url.searchParams.set('query', query);
		} else {
			filteredCollection = stacCollections.collections;
			url.searchParams.delete('query');
		}
		goto(url, { replaceState: true, noScroll: true, keepFocus: true, invalidateAll: false });
	};

	const handleRegister = async (collectionId: string) => {
		isProcessing = true;
		try {
			let stacInstance: StacTemplate;
			stacInstance = getStacInstance(stac, collectionId);
			await stacInstance.getStacCollection();
			const feature = await stacInstance.generateCollectionDatasetFeature();
			feature.properties.access_level = accessLevel;
			const formData = new FormData();
			formData.append('feature', JSON.stringify(feature));
			const res = await fetch(`${page.url.pathname}?/register`, {
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
			data.isRegistered = true;
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

	let breadcrumbs: BreadcrumbPage[] = $state([
		{ title: 'home', url: '/' },
		{ title: 'management', url: '/management' },
		{ title: 'stac', url: '/management/stac' },
		{ title: stac.name, url: page.url.href }
	]);

	let editDialogOpen = $state(false);
	let algorithms: { [key: string]: RasterAlgorithm } = $state();
	let selectedAlgorithmId = $state('');
	let editCollection: StacCollection = $state();

	const getAlgorithms = async () => {
		const res = await fetch(`${data.titilerUrl}/algorithms`);
		algorithms = await res.json();
	};

	const openEditDialog = (coll: StacCollection) => {
		editCollection = coll;
		editDialogOpen = true;
		const selectedDataset = geohubDatasets.features.find((f) => {
			const id = f.properties.tags.find((t) => t.key === 'collection');
			return id.value === coll.id;
		});
		if (!selectedDataset) {
			toolTags = [];
			return;
		}
		const datasetTags = selectedDataset.properties.tags;
		toolTags = datasetTags.filter((t) => t.key === ALGORITHM_TAG_KEY);
	};

	const updateDataset = async (collection: StacCollection, tags: Tag[]) => {
		isProcessing = true;
		try {
			if (!data.isRegistered) {
				await handleRegister(collection.id);
				return;
			}
			const dataset = geohubDatasets.features.find((f) => {
				const id = f.properties.tags.find((t) => t.key === 'collection');
				return id.value === collection.id;
			});
			const newTags = dataset.properties.tags.filter((t) => t.key !== ALGORITHM_TAG_KEY);
			newTags.push(...tags);
			dataset.properties.tags = newTags;
			dataset.properties.access_level = accessLevel;
			const formData = new FormData();
			formData.append('feature', JSON.stringify(dataset));
			const res = await fetch(`${page.url.pathname}?/register`, {
				method: 'POST',
				body: formData
			});
			if (!res.ok) {
				const message = 'Failed to update';
				toast.push(message);
				throw new Error(message);
			}
			toast.push(`The STAC collection was updated successfully`);
			reload();
		} finally {
			isProcessing = false;
			editDialogOpen = false;
		}
	};
	// handleRegister(collection.id);
</script>

<HeroHeader title={breadcrumbs[breadcrumbs.length - 1].title} bind:breadcrumbs />

<section class="m-6">
	{#if stac}
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
					onchange={handleFilterInput}
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
								{#each filteredCollection as collection, index (collection.id)}
									{@const registred = !!geohubDatasets.features.find((f) => {
										const id = f.properties.tags.find((t) => t.key === 'collection');
										return id.value === collection.id;
									})}
									<tr>
										<td>{index + 1}</td>
										<td>
											<a href="/management/stac/api/{stac.id}/{collection.id}">
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
												<div class="is-flex">
													<button
														class="button mr-1 is-link is-uppercase has-text-weight-bold is-fullwidth {isProcessing
															? 'is-loading'
															: ''} "
														disabled={isProcessing}
														onclick={() => openEditDialog(collection)}>Edit</button
													>
													<button
														class="button ml-1 is-link is-uppercase has-text-weight-bold is-fullwidth {isProcessing
															? 'is-loading'
															: ''}"
														disabled={isProcessing}
														onclick={() => {
															handleDelete(collection);
														}}>Delete</button
													>
												</div>
											{:else}
												<button
													class="button is-primary is-uppercase has-text-weight-bold {isProcessing
														? 'is-loading'
														: ''} is-fullwidth"
													disabled={isProcessing}
													onclick={() => {
														openEditDialog(collection);
													}}>Register</button
												>
											{/if}
										</td>
									</tr>
								{/each}
							{/if}
						</tbody>
						<tfoot>
							<tr>
								<th>No.</th>
								<th>Title</th>
								<th>STAC page</th>
								<th>Operation</th>
							</tr>
						</tfoot>
					</table>
				</div>
			{/if}
		{/await}
	{/if}
</section>
<ModalTemplate title="Edit" bind:show={editDialogOpen}>
	{#snippet content()}
		<div>
			<FieldControl title="Access level" showHelp={false} fontWeight="bold">
				{#snippet control()}
					<div>
						<AccessLevelSwitcher bind:accessLevel />
					</div>
				{/snippet}
			</FieldControl>
			{#if algorithms}
				<div class="is-flex">
					<div class="select is-fullwidth">
						<select bind:value={selectedAlgorithmId}>
							<option value="">Select a tool</option>
							{#each Object.keys(algorithms) as id (id)}
								{#if toolTags.findIndex((t) => t.value === id) === -1}
									<option value={id}>{algorithms[id].title}</option>
								{/if}
							{/each}
						</select>
					</div>
					<button
						type="button"
						class="button is-link ml-2"
						disabled={selectedAlgorithmId === ''}
						onclick={() => {
							toolTags = [
								...toolTags,
								{
									key: ALGORITHM_TAG_KEY,
									value: selectedAlgorithmId
								}
							];
						}}>Add</button
					>
				</div>
				<div class="tags my-2">
					{#each toolTags as tag (tag.value)}
						<div class="tags has-addons m-1">
							<span class="tag is-link">{tag.value}</span>
							<button
								class="tag is-delete"
								onclick={() => {
									toolTags = toolTags.filter((t) => t.value !== tag.value);
								}}
								aria-label="delete"
							></button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/snippet}
	{#snippet buttons()}
		<div>
			<button
				class="button is-primary is-upppercase has-text-weight-bold {isProcessing
					? 'is-loading'
					: ''}"
				onclick={async () => {
					await updateDataset(editCollection, toolTags);
				}}
				disabled={isProcessing}
				type="button"
			>
				{data.isRegistered ? 'Update' : 'Register'}
			</button>
		</div>
	{/snippet}
</ModalTemplate>
<SvelteToast />
