<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import Notification from '$components/controls/Notification.svelte';
	import { handleEnterKey, initTippy } from '$lib/helper';
	import type { IngestingDataset, IngestingWebsocketMessage } from '$lib/types';
	import type { OnGroupDataMessageArgs, WebPubSubClient } from '@azure/web-pubsub-client';
	import { filesize } from 'filesize';
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import Time from 'svelte-time/src/Time.svelte';
	import { fade } from 'svelte/transition';
	import IngestingDatasetRowDetail from './IngestingDatasetRowDetail.svelte';
	import ShowDetails from './ShowDetails.svelte';

	const dispatch = createEventDispatcher();

	export let dataset: IngestingDataset;
	const userId = $page.data.session?.user?.id;
	let progress: number | undefined;
	let stage: string = 'provisining';

	// get AzureWebPubSubClient from +page.svelte
	const wpsClient: WebPubSubClient = getContext($page.data.wss.group);

	let isDetailsShown = false;

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

	const clickMenuButton = () => {
		const buttons = document.getElementsByClassName(`menu-button-${dataset.raw.id}`);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const button: HTMLButtonElement = buttons[0];
		button.click();
	};

	const getStatus = () => {
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

	const status = getStatus();

	let logAvailable = dataset.raw.log ? true : false;
	let deletable =
		status !== 'Published' && dataset.datasets.filter((ds) => ds.processing !== true).length === 0;

	const disableScroll = () => {
		const root = document.documentElement;
		root.classList.add('is-clipped');
	};

	const enableScroll = () => {
		const root = document.documentElement;
		root.classList.remove('is-clipped');
	};

	let confirmDeleteDialogVisible = false;
	let deletedDataset: IngestingDataset = undefined;
	let deletedDatasetName = '';
	let isDeleting = false;

	const openDeleteDialog = (dataset: IngestingDataset) => {
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

	const handleDatasetRowChanged = async () => {
		await invalidateAll();
		dispatch('change');
	};

	const handleDeleteDataset = async () => {
		if (!deletedDataset) return;

		try {
			isDeleting = true;

			const urls: string[] = [deletedDataset.raw.url];
			if (deletedDataset.raw.error) {
				urls.push(deletedDataset.raw.error);
			}
			if (deletedDataset.raw.log) {
				urls.push(deletedDataset.raw.log);
			}
			deletedDataset?.datasets?.forEach((ds) => {
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
			closeDeleteDialog();
		} finally {
			isDeleting = false;
		}
	};

	let logDialogVisible = false;
	let logText = '';

	const showLogDialog = async (file: string) => {
		const res = await fetch(file);
		logText = await res.text();
		logDialogVisible = true;
		disableScroll();
	};

	const closeLogDialog = () => {
		logDialogVisible = false;
		logText = '';
		enableScroll();
	};

	let cancelDialogVisible = false;
	let cancelledDatasetName = '';

	const openCancelDialog = () => {
		cancelDialogVisible = true;
		cancelledDatasetName = '';
		disableScroll();
	};

	const closeCancelDialog = () => {
		deletedDataset = undefined;
		cancelledDatasetName = '';
		enableScroll();
		cancelDialogVisible = false;
	};

	const handleCancelDataset = () => {
		if (!wpsClient) return;
		const wss = $page.data.wss;
		const rawUrl = new URL(dataset.raw.url);
		wpsClient.sendToGroup(
			wss.group,
			{
				user: $page.data.session.user.id,
				url: `${rawUrl.origin}${rawUrl.pathname}`,
				cancel: true
			},
			'json'
		);
	};

	onMount(() => {
		// register websocket callback if status is 'In progress'
		if (wpsClient) {
			wpsClient.on('group-message', onMessage);
		}
	});

	const onMessage = (e: OnGroupDataMessageArgs) => {
		try {
			// websocket message from data pipeline is defined at
			// https://github.com/UNDP-Data/geohub/discussions/545#discussioncomment-7000251
			if (e.message.data instanceof ArrayBuffer) {
				return;
			}
			const message = e.message.data as string;
			const data = JSON.parse(message) as IngestingWebsocketMessage;
			// console.log(data);

			// validate to make sure all props exist in message
			let allPropExists = true;
			['user', 'url', 'progress', 'stage'].forEach((prop) => {
				if (!(prop in data)) {
					allPropExists = false;
				}
			});
			// console.log(`allPropExists: ${allPropExists}`);
			if (!allPropExists) return;

			// console.log(data.user, userId, data.user === userId, data.user == userId);
			// only consider message belong to login user id
			if (data.user === userId) {
				const rawUrl = new URL(dataset.raw.url);
				const messageUrl = new URL(data.url);

				// only handle message if blob URL from pipeline is the same with this component's dataset raw URL.
				if (rawUrl.pathname === messageUrl.pathname) {
					// console.debug(data);

					progress = data.progress;
					stage = data.stage;

					if (progress >= 100) {
						// once progress become 100%, remove event listener and refresh table from server.
						wpsClient.off('group-message', onMessage);

						invalidateAll().then(() => {
							dispatch('change');
						});
					}
				}
			}
		} catch {
			// if message cannot be converted to JSON object, reject message
			return;
		}
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

			{#if deletable}
				<button
					class="button is-link my-1 table-button is-small show-mobile"
					on:click={() => {
						openDeleteDialog(dataset);
					}}
				>
					<span class="icon">
						<i class="fa-solid fa-trash fa-lg" />
					</span>
					<span>Delete</span>
				</button>
			{/if}

			{#if dataset.datasets.length > 0}
				<br />
				<ShowDetails bind:show={isDetailsShown} />
			{/if}
		</div>
		<div class="column is-2 has-text-centered">
			{#if status === 'Processed'}
				<span class="tag is-success">
					<span class="icon">
						<i class="fas fa-check"></i>
					</span>
					<span>{status}</span>
				</span>
			{:else if status === 'In progress'}
				{#if progress}
					<progress
						class="ingesting-progress m-0 progress is-small {progress < 30
							? 'is-danger'
							: progress < 50
							? 'is-warning'
							: progress < 70
							? 'is-info'
							: 'is-success'} is-link"
						value={progress}
						max="100"
					>
						{progress}%
					</progress>
					<p>{progress}%: {stage}</p>
				{:else}
					<progress class="ingesting-progress m-0 progress is-small is-info" max="100" />
					<p>Preparing...</p>
				{/if}
			{:else if status === 'Failed'}
				<span class="tag {dataset.datasets.length === 0 ? 'is-danger' : 'is-warning'}">
					<span class="icon">
						<i class="fa-solid fa-triangle-exclamation"></i>
					</span>
					<span>
						{#if dataset.datasets.length === 0}
							{status}
						{:else}
							Partially done
						{/if}
					</span>
				</span>
				<br />
				<!-- svelte-ignore a11y-missing-attribute -->
				<a
					class="pl-2 error-dialog-button is-flex is-justify-content-center is-align-items-center"
					role="button"
					tabindex="0"
					on:click={() => {
						showLogDialog(dataset.raw.error);
					}}
					on:keydown={handleEnterKey}
				>
					<span class="icon">
						<i class="fa-solid fa-arrow-up-right-from-square fa-lg has-text-primary" />
					</span>
					<span class="error-button-name has-text-black subtitle is-6">Show error logs</span>
				</a>
			{:else if status === 'Published'}
				<span class="tag is-success is-light">
					<span class="icon">
						<i class="fas fa-check"></i>
					</span>
					<span>{status}</span>
				</span>
			{/if}
		</div>
		<div class="column is-1 hidden-mobile has-text-centered">
			{filesize(dataset.raw.contentLength, { round: 1 })}
		</div>
		<div class="column is-2 hidden-mobile has-text-centered">
			<Time timestamp={dataset.raw.createdat} format="HH:mm, MM/DD/YYYY" />
		</div>
		<div class="column is-1 hidden-mobile">
			<div class="dropdown-trigger">
				<button
					class="button menu-button menu-button-{dataset.raw.id}"
					use:tippy={{ content: tooltipContent }}
				>
					<span class="icon is-small">
						<i class="fas fa-ellipsis-vertical" aria-hidden="true"></i>
					</span>
				</button>
			</div>
			<div class="tooltip" role="menu" bind:this={tooltipContent}>
				<div class="dropdown-content">
					<!-- cancellation is only avaiable if progress variable is not undefined after receving message from pipeline-->
					{#if status === 'In progress' && progress}
						<!-- svelte-ignore a11y-missing-attribute -->
						<a
							class="dropdown-item {progress ? '' : 'disabled'}"
							role="button"
							tabindex="0"
							on:click={() => {
								if (!progress) return;
								clickMenuButton();
								openCancelDialog();
							}}
							on:keydown={handleEnterKey}
						>
							<span class="icon">
								<i class="fa-solid fa-file-lines" />
							</span>
							<span>Cancel</span>
						</a>
					{/if}
					<a class="dropdown-item" role="button" href={dataset.raw.url.replace('pmtiles://', '')}>
						<span class="icon">
							<i class="fa-solid fa-download" />
						</span>
						<span>Download</span>
					</a>
					{#if logAvailable}
						<!-- svelte-ignore a11y-missing-attribute -->
						<a
							class="dropdown-item"
							role="button"
							tabindex="0"
							on:click={() => {
								clickMenuButton();
								showLogDialog(dataset.raw.log);
							}}
							on:keydown={handleEnterKey}
						>
							<span class="icon">
								<i class="fa-solid fa-file-lines" />
							</span>
							<span>Show logs</span>
						</a>
					{/if}
					{#if dataset.raw.error}
						<!-- svelte-ignore a11y-missing-attribute -->
						<a
							class="dropdown-item"
							role="button"
							tabindex="0"
							on:click={() => {
								clickMenuButton();
								showLogDialog(dataset.raw.error);
							}}
							on:keydown={handleEnterKey}
						>
							<span class="icon">
								<i class="fa-solid fa-triangle-exclamation" />
							</span>
							<span>Show error logs</span>
						</a>
					{/if}
					{#if deletable}
						<!-- svelte-ignore a11y-missing-attribute -->
						<a
							class="dropdown-item"
							role="button"
							tabindex="0"
							on:click={() => {
								clickMenuButton();
								openDeleteDialog(dataset);
							}}
							on:keydown={handleEnterKey}
						>
							<span class="icon">
								<i class="fa-solid fa-trash" />
							</span>
							<span>Delete</span>
						</a>
					{/if}
				</div>
			</div>
		</div>
	</div>

	{#if isDetailsShown}
		<div class="detail-panel p-0 py-2">
			{#each dataset.datasets as ds}
				<IngestingDatasetRowDetail bind:dataset={ds} on:change={handleDatasetRowChanged} />
			{/each}
		</div>
	{/if}
</div>

{#if confirmDeleteDialogVisible}
	<div class="modal is-active" transition:fade|global>
		<div
			role="none"
			class="modal-background"
			on:click={closeDeleteDialog}
			on:keydown={handleEnterKey}
		/>
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title">Are you sure deleting this job?</p>
				<button class="delete" aria-label="close" title="Close" on:click={closeDeleteDialog} />
			</header>
			<section class="modal-card-body is-size-6 has-text-weight-normal">
				<Notification type="warning" showCloseButton={false}>
					Unexpected bad things will happen if you don't read this!
				</Notification>
				<div class="has-text-weight-medium mt-2 mx-1">
					This action <b>cannot</b> be undone. This will permanently delete
					<b>{deletedDataset.raw.name}</b>
					which were uploaded and ingested. All ingested datasets associated to this raw file will also
					be deleted.
					<br />
					Please type <b>{deletedDataset.raw.name}</b> to confirm.
				</div>
				<br />
				<input class="input" type="text" bind:value={deletedDatasetName} />
			</section>
			<footer class="modal-card-foot">
				<button
					class="button is-primary is-fullwidth {isDeleting ? 'is-loading' : ''}"
					on:click={handleDeleteDataset}
					disabled={deletedDatasetName !== deletedDataset?.raw.name}
				>
					I understand the consequences, delete this ingesting dataset
				</button>
			</footer>
		</div>
	</div>
{/if}

{#if logDialogVisible}
	<div class="modal is-active" transition:fade|global>
		<div
			role="none"
			class="modal-background"
			on:click={closeLogDialog}
			on:keydown={handleEnterKey}
		/>
		<div class="modal-content">
			<textarea class="textarea error-log" bind:value={logText} readonly />

			<button
				class="delete close-dialog is-medium"
				aria-label="close"
				title="Close"
				on:click={closeLogDialog}
			/>
		</div>
	</div>
{/if}

{#if cancelDialogVisible}
	<div class="modal is-active" transition:fade|global>
		<div
			role="none"
			class="modal-background"
			on:click={closeCancelDialog}
			on:keydown={handleEnterKey}
		/>
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title">Are you sure cancelling this job?</p>
				<button class="delete" aria-label="close" title="Close" on:click={closeCancelDialog} />
			</header>
			<section class="modal-card-body is-size-6 has-text-weight-normal">
				<Notification type="warning" showCloseButton={false}>
					Unexpected bad things will happen if you don't read this!
				</Notification>
				<div class="has-text-weight-medium mt-2 mx-1">
					This action <b>cannot</b> be undone. This will permanently cancel and delete
					<b>{dataset.raw.name}</b>
					which was uploaded and being ingested now.
					<br />
					Please type <b>{dataset.raw.name}</b> to confirm.
				</div>
				<br />
				<input class="input" type="text" bind:value={cancelledDatasetName} />
			</section>
			<footer class="modal-card-foot">
				<button
					class="button is-primary is-fullwidth"
					on:click={handleCancelDataset}
					disabled={cancelledDatasetName !== dataset.raw.name}
				>
					I understand the consequences, cancel this ingesting process
				</button>
			</footer>
		</div>
	</div>
{/if}

<style lang="scss">
	.row {
		border-bottom: 1px solid gray;

		.ingesting-progress {
			width: 100%;
		}
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
		width: fit-content;

		.error-button-name {
			border-bottom: 2px solid #d12800;
			padding-bottom: 0.1em;
			display: inline;
		}
	}

	.modal-content {
		position: relative;
		.error-log {
			resize: none;
			height: calc(70vh);
			background-color: #1c1c1c;
			color: white;
		}

		.close-dialog {
			position: absolute;
			cursor: pointer;
			top: 5px;
			right: 5px;
		}
	}

	.menu-button {
		border: none;
		background: transparent;
	}

	:global(.tippy-box[data-theme='transparent']) {
		background-color: transparent;
		color: transparent;
	}

	.disabled {
		cursor: not-allowed;
	}
</style>
