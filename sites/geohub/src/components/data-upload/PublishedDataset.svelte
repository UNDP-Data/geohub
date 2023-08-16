<script lang="ts">
	import { goto } from '$app/navigation';
	import { createAttributionFromTags, removeSasTokenFromDatasetUrl } from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import Time from 'svelte-time';
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import { clickOutside } from 'svelte-use-click-outside';
	import Notification from '$components/controls/Notification.svelte';
	import { Permission } from '$lib/config/AppConfig';
	import MiniMap from '$components/data-view/MiniMap.svelte';
	import { marked } from 'marked';

	const dispatch = createEventDispatcher();

	export let feature: DatasetFeature;

	const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
		{ key: string; value: string }
	];
	const unit = tags?.find((t) => t.key === 'unit')?.value;
	const attribution = createAttributionFromTags(tags);

	let confirmDeleteDialogVisible = false;
	let deletedDataset: DatasetFeature = undefined;
	let deletedDatasetName = '';
	let isDeleting = false;

	let isMenuShown = false;
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

<div class="row">
	<div class="columns is-vcentered m-0 is-mobile">
		<div class="column is-4">
			{feature.properties.name}
			<br />
			<!-- svelte-ignore a11y-missing-attribute -->
			<a
				class="details"
				role="button"
				tabindex="0"
				on:click={() => (isDetailsShown = !isDetailsShown)}
				on:keydown={handleEnterKey}
			>
				{#if isDetailsShown}
					Hide details
				{:else}
					Show details
				{/if}
				<i class={isDetailsShown ? 'triangle-up' : 'triangle-down'}></i>
			</a>
		</div>
		<div class="column is-3">
			{feature.properties.license?.length > 0 ? feature.properties.license : 'No license'}
		</div>
		<div class="column is-2">
			<Time timestamp={feature.properties.createdat} format="hh:mm A, MM/DD/YYYY" />
		</div>
		<div class="column is-2">
			<Time timestamp={feature.properties.updatedat} format="hh:mm A, MM/DD/YYYY" />
		</div>

		<div class="column is-1">
			<div class="dropdown-trigger">
				<button
					class="button menu-button"
					aria-haspopup="true"
					aria-controls="dropdown-menu-{feature.properties.id}"
					on:click={() => (isMenuShown = !isMenuShown)}
					disabled={feature.properties.permission < Permission.WRITE}
				>
					<span class="icon is-small">
						<i class="fas fa-ellipsis-vertical" aria-hidden="true"></i>
					</span>
				</button>
			</div>
			{#if isMenuShown}
				<div
					class="dropdown {isMenuShown ? 'is-active' : ''}"
					id="dropdown-menu-{feature.properties.id}"
					use:clickOutside={() => (isMenuShown = false)}
				>
					<div class="dropdown-menu" role="menu">
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
				</div>
			{/if}
		</div>
	</div>

	{#if isDetailsShown}
		<div class="detail-panel p-0 py-2">
			<div class="columns m-0">
				<div class="column">
					<MiniMap bind:feature isLoadMap={isDetailsShown} width="100%" height="300px" />
				</div>
				<div class="column is-flex is-flex-direction-column">
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Description</label>
						<div class="control">
							<!-- eslint-disable svelte/no-at-html-tags -->
							{@html marked(feature.properties.description)}
						</div>
					</div>
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Source</label>
						<div class="control">
							<!-- eslint-disable svelte/no-at-html-tags -->
							{@html attribution}
						</div>
					</div>
					{#if unit}
						<div class="field">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label">Unit</label>
							<div class="control">
								{unit}
							</div>
						</div>
					{/if}
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Created by</label>
						<div class="control">
							{feature.properties.created_user}
						</div>
					</div>
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Updated by</label>
						<div class="control">
							{feature.properties.updated_user}
						</div>
					</div>
				</div>
			</div>
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

	.details {
		position: relative;
		color: gray;
		text-decoration: underline dotted gray;

		.triangle-up {
			position: absolute;
			bottom: 0.5em;
			right: -1em;
			border-left: 5px solid transparent;
			border-right: 5px solid transparent;
			border-bottom: 5px solid black;
		}

		.triangle-down {
			position: absolute;
			bottom: 0.5em;
			right: -1em;
			border-left: 5px solid transparent;
			border-right: 5px solid transparent;
			border-top: 5px solid black;
		}
	}

	.menu-button {
		border: none;
		background: transparent;
	}

	.detail-panel {
		border-top: 1px dashed gray;
	}
</style>
