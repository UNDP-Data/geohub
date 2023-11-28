<script lang="ts">
	import ShowDetails from '$components/util/ShowDetails.svelte';
	import Star from '$components/util/Star.svelte';
	import { SdgLogos } from '$lib/config/AppConfig';
	import { getAccessLevelIcon, initTippy } from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import { CtaLink, DefaultLink } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher } from 'svelte';
	import Time from 'svelte-time';
	import PublishedDataset from './PublishedDataset.svelte';
	import PublishedDatasetOperations from './PublishedDatasetOperations.svelte';

	const dispatch = createEventDispatcher();

	export let feature: DatasetFeature;

	const accessIcon = getAccessLevelIcon(feature.properties.access_level, true);

	let innerWidth = 0;
	$: showMobile = innerWidth <= 768 ? true : false;

	const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
		{ key: string; value: string }
	];
	const sdgs = tags
		.filter((t) => t.key === 'sdg_goal')
		.sort((a, b) => parseInt(a.value) - parseInt(b.value));

	let isDetailsShown = false;

	const handleDeleted = () => {
		dispatch('deleted', { feature });
	};

	const tippy = initTippy({
		placement: 'bottom-end',
		arrow: true,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		trigger: 'mouseenter focus',
		interactive: false,
		offset: [10, 10],
		onShow(instance) {
			instance.popper.querySelector('.close')?.addEventListener('click', () => {
				instance.hide();
			});
		},
		onHide(instance) {
			instance.popper.querySelector('.close')?.removeEventListener('click', () => {
				instance.hide();
			});
		}
	});
	let tooltipContent: HTMLElement;
</script>

<svelte:window bind:innerWidth />

<div class="row">
	<div class="columns is-vcentered m-0 is-mobile">
		<div class="column is-3-desktop">
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
			<DefaultLink
				href={feature.properties.links.find((l) => l.rel === 'dataset').href}
				title={feature.properties.name}
			/>
			<br />
			<div class="mt-2">
				<ShowDetails bind:show={isDetailsShown} />
			</div>
		</div>
		<div class="column is-2 hidden-mobile">
			{#if sdgs.length > 0}
				<div class="sdg-grid">
					{#each sdgs as sdg, index}
						{@const logo = SdgLogos.find((s) => s.value === parseInt(sdg.value))}
						{#if index < 3}
							<div
								class="sdg_number has-text-white has-text-weight-bold is-size-7"
								style="background-color: {logo.color};"
							>
								{logo.value}
							</div>
						{/if}
					{/each}
					{#if sdgs.length > 3}
						<div
							class="sdg_number border has-text-black has-text-weight-bold is-size-7"
							style="background-color: #FFFFFF;"
							use:tippy={{ content: tooltipContent }}
						>
							...
						</div>

						<div class="tooltip sdg-grid p-2" role="menu" bind:this={tooltipContent}>
							{#each sdgs.slice(3) as sdg}
								{@const logo = SdgLogos.find((s) => s.value === parseInt(sdg.value))}
								<div
									class="sdg_number has-text-white has-text-weight-bold is-size-7"
									style="background-color: {logo.color};"
								>
									{logo.value}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{:else}
				N/A
			{/if}
		</div>
		<div class="column is-2 hidden-mobile">
			{feature.properties.license?.length > 0 ? feature.properties.license : 'No license'}
		</div>
		<div class="column is-2 hidden-mobile">
			<Time timestamp={feature.properties.createdat} format="HH:mm, MM/DD/YYYY" />
		</div>
		<div class="column is-2 hidden-mobile">
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

	.sdg-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 5px;

		.sdg_number {
			width: 28px;
			height: 28px;
			padding-top: 5px;
			border-radius: 50%;
			text-align: center;
			box-sizing: border-box;
		}

		.border {
			border: 1px solid black;
		}
	}

	.detail-panel {
		border-top: 1px dashed gray;
	}
</style>
