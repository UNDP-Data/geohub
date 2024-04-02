<script lang="ts">
	import RasterAlgorithmExplorer, {
		ALGORITHM_TAG_KEY
	} from '$components/maplibre/raster/RasterAlgorithmExplorer.svelte';
	import StacCollectionMap from '$components/util/stac/StacCollectionMap.svelte';
	import type {
		DatasetFeature,
		RasterAlgorithm,
		StacCatalogBreadcrumb,
		StacCollection,
		Tag
	} from '$lib/types';
	import { FieldControl, Tabs, type Tab } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher, onMount } from 'svelte';
	import StacCatalogDatePicker from './StacCatalogDatePicker.svelte';

	const dispatch = createEventDispatcher();

	export let stacId: string;
	export let collectionUrl: string;
	export let url: string;
	export let dataset: DatasetFeature = undefined;

	let collections: StacCollection;

	let tabs: Tab[] = [{ id: 'catalog', label: 'Catalog' }];

	const algorithmTags = dataset?.properties.tags?.filter((t) => t.key === ALGORITHM_TAG_KEY) ?? [];
	if (algorithmTags.length > 0) {
		tabs.push({ id: 'tools', label: 'Tools' });
	}

	let activeTab = tabs[0].id;

	let selectedTool: { algorithmId: string; algorithm: RasterAlgorithm };

	onMount(() => {
		initialise();
	});

	$: url, initialise();

	const initialise = async () => {
		collections = undefined;
		collections = await fetchCollection(url);
	};

	const fetchCollection = async (collectionUrl: string) => {
		const res = await fetch(collectionUrl);
		return (await res.json()) as StacCollection;
	};

	const handleChildSelected = (e: { detail: StacCatalogBreadcrumb }) => {
		const data: StacCatalogBreadcrumb = e.detail;
		dispatch('selected', data);
	};

	const dataAddedToMap = (e) => {
		dispatch('dataAdded', e.detail);
	};

	const handleToolSelected = (e) => {
		const tag: Tag = e.detail.tag;
		const algorithm: RasterAlgorithm = e.detail.algorithm;
		selectedTool = {
			algorithmId: tag.value,
			algorithm
		};
		console.log(selectedTool);
	};
</script>

{#if collections}
	<p class="is-size-6 mb-4">{collections.description}</p>

	{#if algorithmTags.length > 0}
		<Tabs
			bind:tabs
			bind:activeTab
			isCentered={false}
			isBoxed={false}
			isUppercase={true}
			fontWeight="bold"
		/>
	{/if}

	<div hidden={activeTab !== 'catalog'}>
		<StacCollectionMap
			bind:stacId
			bind:collectionUrl
			bind:url
			bind:links={collections.links}
			on:selected={handleChildSelected}
			on:dataAdded={dataAddedToMap}
		/>
	</div>

	{#if dataset}
		<div hidden={activeTab !== 'tools'}>
			<RasterAlgorithmExplorer
				bind:feature={dataset}
				mode="select"
				toggleTool={false}
				on:selected={handleToolSelected}
			/>

			{#if selectedTool}
				<FieldControl title="Select input data" showHelpPopup={false}>
					<div slot="control">
						{#each [1, selectedTool.algorithm.inputs.nbands] as bandNo}
							<div class="field">
								<!-- svelte-ignore a11y-label-has-associated-control -->
								<label class="label">Input Band {bandNo}</label>
								<div class="control">
									<StacCatalogDatePicker bind:collectionUrl bind:collection={collections} />
								</div>
							</div>
						{/each}
					</div>
					<div slot="help">{selectedTool.algorithm.description}</div>
				</FieldControl>
			{/if}
		</div>
	{/if}
{/if}
