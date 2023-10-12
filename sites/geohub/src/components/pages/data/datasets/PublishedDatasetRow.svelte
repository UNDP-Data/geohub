<script lang="ts">
	import Star from '$components/util/Star.svelte';
	import { getAccessLevelIcon } from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import { CtaLink } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher } from 'svelte';
	import Time from 'svelte-time';
	import PublishedDataset from './PublishedDataset.svelte';
	import PublishedDatasetOperations from './PublishedDatasetOperations.svelte';
	import ShowDetails from '$components/util/ShowDetails.svelte';

	const dispatch = createEventDispatcher();

	export let feature: DatasetFeature;

	const accessIcon = getAccessLevelIcon(feature.properties.access_level, true);

	let innerWidth = 0;
	$: showMobile = innerWidth <= 768 ? true : false;

	const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
		{ key: string; value: string }
	];
	const sdgs = tags.filter((t) => t.key === 'sdg_goal');

	let isDetailsShown = false;

	const handleDeleted = () => {
		dispatch('deleted', { feature });
	};
</script>

<svelte:window bind:innerWidth />

<div class="row">
	<div class="columns is-vcentered m-0 is-mobile">
		<div class="column is-4-desktop">
			<Star
				isCompact={true}
				bind:id={feature.properties.id}
				bind:isStar={feature.properties.is_star}
				bind:no_stars={feature.properties.no_stars}
				table="datasets"
			/>
			{#if accessIcon}
				<i class="{accessIcon} p-1 pr-2" />
			{/if}
			<a class="dataset-name" href={feature.properties.links.find((l) => l.rel === 'dataset').href}>
				{feature.properties.name}
			</a>
			<br />
			<div class="mt-2">
				<ShowDetails bind:show={isDetailsShown} />
			</div>
		</div>
		<div class="column is-1 hidden-mobile">
			{#if sdgs.length > 0}
				<div class="sdg-grid">
					{#each sdgs as sdg, index}
						{#if index < 2}
							<!-- show first two SDGs on header. -->
							<figure
								class={`image ${
									sdgs.length < 2 ? 'is-48x48' : 'is-24x24'
								} is-flex is-align-items-center`}
								data-testid="icon-figure"
							>
								<img
									src="/assets/sdgs/{sdg.value}.png"
									alt="SDG {sdg.value}"
									title="SDG {sdg.value}"
								/>
							</figure>
						{/if}
					{/each}
				</div>
			{:else}
				N/A
			{/if}
		</div>
		<div class="column is-2 has-text-centered hidden-mobile">
			{feature.properties.license?.length > 0 ? feature.properties.license : 'No license'}
		</div>
		<div class="column is-2 has-text-centered hidden-mobile">
			<Time timestamp={feature.properties.createdat} format="HH:mm, MM/DD/YYYY" />
		</div>
		<div class="column is-2 has-text-centered hidden-mobile">
			<Time timestamp={feature.properties.updatedat} format="HH:mm, MM/DD/YYYY" />
		</div>
		<div class="column is-1">
			<PublishedDatasetOperations bind:feature on:deleted={handleDeleted} />
		</div>
	</div>

	{#if isDetailsShown}
		<div class="detail-panel">
			<PublishedDataset bind:feature showLicense={showMobile} showDatatime={showMobile} />

			<div class="readmore mx-3 mb-4">
				<CtaLink
					label="Read more"
					isArrow={true}
					href={feature.properties.links.find((l) => l.rel === 'dataset').href}
				/>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.row {
		border-bottom: 1px solid gray;
	}

	.hidden-mobile {
		display: block;
		@media (max-width: 48em) {
			display: none;
		}
	}

	.dataset-name {
		color: rgb(60, 60, 60);
		border-bottom: 2px solid #d12800;
		padding-bottom: 0.1em;
		display: inline;
	}

	.dataset-name:hover {
		color: #006eb5;
	}

	.sdg-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 5px;
	}

	.detail-panel {
		border-top: 1px dashed gray;
	}
</style>
