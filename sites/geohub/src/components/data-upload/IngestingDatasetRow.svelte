<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Notification from '$components/controls/Notification.svelte';
	import { handleEnterKey } from '$lib/helper';
	import type { IngestingDataset } from '$lib/types';
	import { filesize } from 'filesize';
	import { createEventDispatcher } from 'svelte';
	import Time from 'svelte-time/src/Time.svelte';
	import { fade } from 'svelte/transition';
	import IngestingDatasetRowDetail from './IngestingDatasetRowDetail.svelte';
	import ShowDetails from './ShowDetails.svelte';

	const dispatch = createEventDispatcher();

	export let dataset: IngestingDataset;

	let isDetailsShown = false;

	const getStatus = (dataset: IngestingDataset) => {
		if (dataset.raw.error) {
			return 'Failed';
		}
		if (dataset.datasets && dataset.datasets.length > 0) {
			const published = dataset.datasets?.filter((ds) => ds.processing !== true);
			if (dataset.datasets?.length === published?.length) {
				return 'Published';
			}
			return 'Processed';
		} else {
			return 'In progress';
		}
	};

	const status = getStatus(dataset);

	const disableScroll = () => {
		const root = document.documentElement;
		root.classList.add('is-clipped');
	};

	const enableScroll = () => {
		const root = document.documentElement;
		root.classList.remove('is-clipped');
	};

	let confirmDeleteDialogVisible = false;
	let cancelledDataset: IngestingDataset = undefined;
	let cancelledDatasetName = '';
	let isCancelling = false;

	const openCancelDialog = (dataset: IngestingDataset) => {
		cancelledDataset = dataset;
		confirmDeleteDialogVisible = true;
		cancelledDatasetName = '';
		disableScroll();
	};

	const closeCancelDialog = () => {
		confirmDeleteDialogVisible = false;
		cancelledDataset = undefined;
		cancelledDatasetName = '';
		enableScroll();
	};

	const handleCancelDataset = async () => {
		if (!cancelledDataset) return;

		try {
			isCancelling = true;

			const urls: string[] = [cancelledDataset.raw.url];
			if (cancelledDataset.raw.error) {
				urls.push(cancelledDataset.raw.error);
			}
			cancelledDataset?.datasets?.forEach((ds) => {
				urls.push(ds.url);
				if (ds.processing === true && ds.processingFile) {
					urls.push(ds.processingFile);
				}
			});
			for (const url of urls) {
				const res = await fetch(url, {
					method: 'DELETE'
				});
				if (!res.ok) {
					throw new Error(`Failed to delete ${url}`);
				}
			}

			await invalidateAll();
			dispatch('change');
			closeCancelDialog();
		} finally {
			isCancelling = false;
		}
	};

	let ErrorDialogVisible = false;
	let errorText = '';

	const showErrorDialog = async (errorFile: string) => {
		const res = await fetch(errorFile);
		errorText = await res.text();
		ErrorDialogVisible = true;
		disableScroll();
	};

	const closeErrorlDialog = () => {
		ErrorDialogVisible = false;
		errorText = '';
		enableScroll();
	};
</script>

<div class="row">
	<div class="columns is-vcentered m-0 is-mobile">
		<div class="column is-9-mobile">
			{dataset.raw.name}

			<div class="pt-4 field show-mobile">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Size</label>
				<div class="control">
					{filesize(dataset.raw.contentLength, { round: 1 })}
				</div>
			</div>

			<div class="field show-mobile">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Uploaded at</label>
				<div class="control">
					<Time timestamp={dataset.raw.createdat} format="HH:mm, MM/DD/YYYY" />
				</div>
			</div>

			{#if status !== 'Published'}
				<button
					class="button is-link my-1 table-button is-small show-mobile"
					on:click={() => {
						openCancelDialog(dataset);
					}}
				>
					<span class="icon">
						<i class="fa-solid fa-xmark fa-lg" />
					</span>
					<span>Cancel</span>
				</button>
			{/if}

			{#if ['Processed', 'Published'].includes(status)}
				<br />
				<ShowDetails bind:show={isDetailsShown} />
			{/if}
		</div>
		<div class="column is-2">
			{#if status === 'Processed'}
				<span class="tag is-success">
					<span class="icon pr-2">
						<i class="fas fa-check"></i>
					</span>
					{status}
				</span>
			{:else if status === 'In progress'}
				<span class="tag is-link">
					<span class="icon pr-2">
						<i class="fa-solid fa-spinner"></i>
					</span>
					{status}
				</span>
			{:else if status === 'Failed'}
				<div class="is-flex">
					<span class="tag is-danger">
						<span class="icon pr-2">
							<i class="fa-solid fa-exclamation"></i>
						</span>
						{status}
					</span>
					<div
						class="pl-2 icon error-dialog-button"
						role="button"
						tabindex="0"
						on:click={() => {
							showErrorDialog(dataset.raw.error);
						}}
						on:keydown={handleEnterKey}
					>
						<i class="fa-solid fa-arrow-up-right-from-square fa-lg has-text-primary" />
					</div>
				</div>
			{:else if status === 'Published'}
				<span class="tag is-success is-light">
					<span class="icon pr-2">
						<i class="fas fa-check"></i>
					</span>
					{status}
				</span>
			{/if}
		</div>
		<div class="column is-1 hidden-mobile">
			{filesize(dataset.raw.contentLength, { round: 1 })}
		</div>
		<div class="column is-2 hidden-mobile">
			<Time timestamp={dataset.raw.createdat} format="HH:mm, MM/DD/YYYY" />
		</div>
		<div class="column is-1 hidden-mobile">
			{#if status !== 'Published'}
				<button
					class="button is-link my-1 table-button is-small"
					on:click={() => {
						openCancelDialog(dataset);
					}}
				>
					<span class="icon">
						<i class="fa-solid fa-xmark fa-lg" />
					</span>
					<span>Cancel</span>
				</button>
			{/if}
		</div>
	</div>

	{#if isDetailsShown}
		<div class="detail-panel p-0 py-2">
			{#each dataset.datasets as ds}
				<IngestingDatasetRowDetail bind:dataset={ds} />
			{/each}
		</div>
	{/if}
</div>

{#if confirmDeleteDialogVisible}
	<div class="modal is-active" transition:fade|global>
		<div
			role="none"
			class="modal-background"
			on:click={closeCancelDialog}
			on:keydown={handleEnterKey}
		/>
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title">Are you sure cancelling?</p>
				<button class="delete" aria-label="close" title="Close" on:click={closeCancelDialog} />
			</header>
			<section class="modal-card-body is-size-6 has-text-weight-normal">
				<Notification type="warning" showCloseButton={false}>
					Unexpected bad things will happen if you don't read this!
				</Notification>
				<div class="has-text-weight-medium mt-2 mx-1">
					This action <b>cannot</b> be undone. This will permanently delete
					<b>{cancelledDataset.raw.name}</b>
					which were uploaded and ingested.
					<br />
					Please type <b>{cancelledDataset.raw.name}</b> to confirm.
				</div>
				<br />
				<input class="input" type="text" bind:value={cancelledDatasetName} />
			</section>
			<footer class="modal-card-foot">
				<button
					class="button is-primary is-fullwidth {isCancelling ? 'is-loading' : ''}"
					on:click={handleCancelDataset}
					disabled={cancelledDatasetName !== cancelledDataset?.raw.name}
				>
					I understand the consequences, cancel this ingesting dataset
				</button>
			</footer>
		</div>
	</div>
{/if}

{#if ErrorDialogVisible}
	<div class="modal is-active" transition:fade|global>
		<div
			role="none"
			class="modal-background"
			on:click={closeErrorlDialog}
			on:keydown={handleEnterKey}
		/>
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title">Error log</p>
				<button class="delete" aria-label="close" title="Close" on:click={closeErrorlDialog} />
			</header>
			<section class="modal-card-body is-size-6 has-text-weight-normal">
				<textarea class="textarea error-log" bind:value={errorText} readonly />
			</section>
			<footer class="modal-card-foot">
				<button class="button is-link is-fullwidth" on:click={closeErrorlDialog}>Close</button>
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

	.show-mobile {
		display: none;
		@media (max-width: 48em) {
			display: block;
		}
	}

	.detail-panel {
		border-top: 1px dashed gray;
	}

	.error-dialog-button {
		cursor: pointer;
	}
</style>
