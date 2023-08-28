<script lang="ts">
	import { goto } from '$app/navigation';
	import { removeSasTokenFromDatasetUrl } from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import Time from 'svelte-time';
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import Notification from '$components/controls/Notification.svelte';
	import { Permission } from '$lib/config/AppConfig';
	import { initTippy } from '$lib/helper';
	import ShowDetails from './ShowDetails.svelte';
	import Star from '$components/data-view/Star.svelte';
	import PublishedDataset from './PublishedDataset.svelte';

	const dispatch = createEventDispatcher();

	export let feature: DatasetFeature;

	$: showMobile = innerWidth <= 768 ? true : false;

	const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
		{ key: string; value: string }
	];
	const sdgs = tags.filter((t) => t.key === 'sdg_goal');

	let confirmDeleteDialogVisible = false;
	let deletedDataset: DatasetFeature = undefined;
	let deletedDatasetName = '';
	let isDeleting = false;

	let innerWidth = 0;

	const tippy = initTippy({
		placement: 'bottom-end',
		arrow: false,
		theme: 'transparent',
		offset: [10, 0],
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

	let isDetailsShown = false;

	const gotoEditMetadataPage = (url: string) => {
		const url4edit = removeSasTokenFromDatasetUrl(url);
		goto(`/data/publish?url=${url4edit}`);
	};

	const handleDeleteDataset = async () => {
		if (!deletedDataset) return;
		try {
			isDeleting = true;

			const res = await fetch(`/api/datasets/${deletedDataset.properties.id}`, {
				method: 'DELETE'
			});
			if (res.ok && res.status === 204) {
				dispatch('deleted', {
					feature
				});
				closeDeleteDialog();
			}
		} finally {
			isDeleting = false;
		}
	};

	const openDeleteDialog = (dataset: DatasetFeature) => {
		deletedDataset = dataset;
		confirmDeleteDialogVisible = true;
		deletedDatasetName = '';
		disableScroll();
	};

	const closeDeleteDialog = () => {
		confirmDeleteDialogVisible = false;
		deletedDataset = undefined;
		deletedDatasetName = '';
		enableScroll();
	};

	const disableScroll = () => {
		const root = document.documentElement;
		root.classList.add('is-clipped');
	};

	const enableScroll = () => {
		const root = document.documentElement;
		root.classList.remove('is-clipped');
	};

	const handleEnterKey = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			e.target.click();
		}
	};
</script>

<svelte:window bind:innerWidth />

<div class="row">
	<div class="columns is-vcentered m-0 is-mobile">
		<div class="column is-4-desktop">
			<Star
				isCompact={true}
				bind:dataset_id={feature.properties.id}
				bind:isStar={feature.properties.is_star}
			/>
			<a class="dataset-name" href={`/data/${feature.properties.id}`}>{feature.properties.name}</a>
			<br />
			<ShowDetails bind:show={isDetailsShown} />
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
		<div class="column is-1 has-text-centered">
			{#if feature.properties.permission > Permission.READ}
				<div class="dropdown-trigger">
					<button
						class="button menu-button"
						use:tippy={{ content: tooltipContent }}
						disabled={feature.properties.permission < Permission.WRITE}
					>
						<span class="icon is-small">
							<i class="fas fa-ellipsis-vertical" aria-hidden="true"></i>
						</span>
					</button>
				</div>
				<div class="tooltip" role="menu" bind:this={tooltipContent}>
					<div class="dropdown-content">
						{#if feature.properties.permission > Permission.READ}
							<!-- svelte-ignore a11y-missing-attribute -->
							<a
								class="dropdown-item"
								role="button"
								tabindex="0"
								on:click={() => {
									gotoEditMetadataPage(feature.properties.url);
								}}
								on:keydown={handleEnterKey}
							>
								Edit
							</a>
						{/if}
						{#if feature.properties.permission > Permission.WRITE}
							<!-- svelte-ignore a11y-missing-attribute -->
							<a
								class="dropdown-item"
								role="button"
								tabindex="0"
								on:click={() => {
									openDeleteDialog(feature);
								}}
								on:keydown={handleEnterKey}
							>
								Delete
							</a>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>

	{#if isDetailsShown}
		<div class="detail-panel">
			<PublishedDataset bind:feature showLicense={showMobile} showDatatime={showMobile} />
		</div>
	{/if}
</div>

{#if confirmDeleteDialogVisible}
	<div class="modal is-active" transition:fade|global>
		<div
			class="modal-background"
			role="none"
			on:click={closeDeleteDialog}
			on:keydown={handleEnterKey}
		/>
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title">Are you sure deleting the dataset?</p>
				<button class="delete" aria-label="close" title="Close" on:click={closeDeleteDialog} />
			</header>
			<section class="modal-card-body is-size-6 has-text-weight-normal">
				<!-- svelte-ignore missing-declaration -->
				<Notification type="warning" showCloseButton={false}>
					Unexpected bad things will happen if you don't read this!
				</Notification>
				<div class="has-text-weight-medium mt-2 mx-1">
					This action <b>cannot</b> be undone. This will delete
					<b>{deletedDataset.properties.name}</b>
					from GeoHub data catalogue. It will not be searchable again from Data tab in GeoHub app.
					<br />
					Please type <b>{deletedDataset.properties.name}</b> to confirm.
				</div>
				<br />
				<input class="input" type="text" bind:value={deletedDatasetName} />
			</section>
			<footer class="modal-card-foot">
				<button
					class="button is-primary is-fullwidth {isDeleting ? 'is-loading' : ''}"
					on:click={handleDeleteDataset}
					disabled={deletedDatasetName !== deletedDataset.properties.name}
				>
					I understand the consequences, delete this dataset
				</button>
			</footer>
		</div>
	</div>
{/if}

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

	.menu-button {
		border: none;
		background: transparent;
	}

	.detail-panel {
		border-top: 1px dashed gray;
	}

	:global(.tippy-box[data-theme='transparent']) {
		background-color: transparent;
		color: transparent;
	}
</style>
