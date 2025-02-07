<script lang="ts">
	import { page } from '$app/state';
	import type { IngestingDataset, IngestingWebsocketMessage } from '$lib/types';
	import type { OnGroupDataMessageArgs, WebPubSubClient } from '@azure/web-pubsub-client';
	import {
		ModalTemplate,
		Notification,
		handleEnterKey,
		initTippy
	} from '@undp-data/svelte-undp-components';
	import { filesize } from 'filesize';
	import { getContext, onMount } from 'svelte';
	import Time from 'svelte-time';
	import IngestingDatasetRowDetail from './IngestingDatasetRowDetail.svelte';

	interface Props {
		dataset: IngestingDataset;
		change: () => void;
	}

	let { dataset = $bindable(), change = () => {} }: Props = $props();
	const userId = page.data.session?.user?.id;

	const tippy = initTippy({
		placement: 'bottom-end',
		arrow: false,
		theme: 'transparent',
		// https://atomiks.github.io/tippyjs/v6/faq/#my-tooltip-appears-cut-off-or-is-not-showing-at-all
		popperOptions: {
			strategy: 'fixed'
		}
	});
	let tooltipContent: HTMLElement | undefined = $state();

	// get AzureWebPubSubClient from +page.svelte
	const wpsClient: WebPubSubClient | undefined = page.data.wss.url
		? getContext(page.data.wss.group)
		: undefined;

	let isDetailsShown = $state(false);

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
			const published = dataset.datasets?.filter((ds) => ds.processing === true);
			if (published.length === 0) {
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
		status !== 'Published' && dataset.datasets?.filter((ds) => ds.processing !== true).length === 0;

	let confirmDeleteDialogVisible = $state(false);
	let deletedDataset: IngestingDataset | undefined = $state(undefined);
	let deletedDatasetName = $state('');
	let isDeleting = $state(false);

	const openDeleteDialog = (dataset: IngestingDataset) => {
		deletedDataset = dataset;
		confirmDeleteDialogVisible = true;
		deletedDatasetName = '';
	};

	const closeDeleteDialog = () => {
		confirmDeleteDialogVisible = false;
		deletedDataset = undefined;
		deletedDatasetName = '';
	};

	const handleDatasetRowChanged = async () => {
		change();
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
				if (ds.originalFiles && ds.originalFiles.length > 0) {
					ds.originalFiles.forEach((f) => {
						urls.push(f);
					});
				}
				if (ds.url) {
					urls.push(ds.url);
				}
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

			change();
			closeDeleteDialog();
		} finally {
			isDeleting = false;
		}
	};

	let logDialogVisible = $state(false);
	let logText = $state('');

	const showLogDialog = async (file: string) => {
		const res = await fetch(file);
		logText = await res.text();
		logDialogVisible = true;
	};

	let cancelDialogVisible = $state(false);
	let cancelledDatasetName = $state('');

	const openCancelDialog = () => {
		cancelDialogVisible = true;
		cancelledDatasetName = '';
	};

	const closeCancelDialog = () => {
		deletedDataset = undefined;
		cancelledDatasetName = '';
		cancelDialogVisible = false;
	};

	const handleCancelDataset = () => {
		if (!wpsClient) return;
		const wss = page.data.wss;
		if (!wss.url) return;
		const rawUrl = new URL(dataset.raw.url);
		wpsClient.sendToGroup(
			wss.group,
			{
				user: page.data.session?.user.id,
				url: `${rawUrl.origin}${rawUrl.pathname}`,
				cancel: true
			},
			'json'
		);
		closeCancelDialog();
	};

	onMount(() => {
		if (!['Processed', 'Published', 'Failed'].includes(status)) {
			// register websocket callback if status is 'In progress'
			if (wpsClient) {
				wpsClient.on('group-message', onMessage);
			}
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

					dataset.raw.progress = data.progress;
					dataset.raw.stage = data.stage;

					if (dataset.raw.progress >= 100) {
						// once progress become 100%, remove event listener and refresh table from server.
						wpsClient?.off('group-message', onMessage);

						change();
					}
				}
			}
		} catch {
			// if message cannot be converted to JSON object, reject message
			return;
		}
	};

	const toggleChevron = () => {
		isDetailsShown = !isDetailsShown;
	};
</script>

<tr>
	<td class="px-1">
		{#if dataset.datasets && dataset.datasets.length > 0}
			<button class="toggle-button button" onclick={toggleChevron} aria-label="toggle">
				<span class="icon has-text-primary">
					<i class="fa-solid fa-chevron-down toggle-icon {isDetailsShown ? 'active' : ''} fa-lg"
					></i>
				</span>
			</button>
		{/if}
	</td>
	<td class="pl-0">
		<!-- svelte-ignore a11y_missing_attribute -->
		<a
			class="name"
			role="button"
			tabindex="-1"
			data-sveltekit-preload-data="off"
			onclick={toggleChevron}
			onkeydown={handleEnterKey}>{dataset.raw.name}</a
		>

		<div class="columns is-vcentered">
			{#if dataset.raw.error}
				<div class="column is-flex">
					<p class="help is-danger">It has errors. Check logs.</p>
					<div
						class="error-dialog-button pl-1"
						role="button"
						tabindex="0"
						onclick={() => {
							showLogDialog(dataset.raw.error ?? '');
						}}
						onkeydown={handleEnterKey}
					>
						<span class="icon">
							<i class="fa-solid fa-arrow-up-right-from-square fa-lg has-text-primary"></i>
						</span>
					</div>
				</div>
			{/if}
		</div>
	</td>
	<td>
		{#if status === 'Processed'}
			<span class="tag is-success">
				<span class="icon">
					<i class="fas fa-check"></i>
				</span>
				<span>{status}</span>
			</span>
		{:else if status === 'In progress'}
			{@const progress = dataset.raw.progress}
			{@const stage = dataset.raw.stage}
			{#if stage?.toLowerCase() === 'cancelled'}
				<span class="tag is-light">
					<span class="icon">
						<i class="fa-solid fa-xmark"></i>
					</span>
					<span class="is-capitalized">{stage}</span>
				</span>
			{:else if progress}
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
				<progress class="ingesting-progress m-0 progress is-small is-info" max="100"></progress>
				<p>Preparing...</p>
			{/if}
		{:else if status === 'Failed'}
			<span
				class="tag {dataset.datasets && dataset.datasets.length === 0 ? 'is-danger' : 'is-warning'}"
			>
				<span class="icon">
					<i class="fa-solid fa-triangle-exclamation"></i>
				</span>
				<span>
					{#if dataset.datasets && dataset.datasets.length === 0}
						{status}
					{:else}
						Partially done
					{/if}
				</span>
			</span>
		{:else if status === 'Published'}
			<span class="tag is-success is-light">
				<span class="icon">
					<i class="fas fa-check"></i>
				</span>
				<span>{status}</span>
			</span>
		{/if}
	</td>
	<td>
		{filesize(dataset.raw.contentLength, { round: 1 })}
	</td>
	<td>
		<Time timestamp={dataset.raw.createdat} format="HH:mm, MM/DD/YYYY" />
	</td>
	<td>
		<div class="dropdown">
			<button
				class="button menu-button menu-button-{dataset.raw.id}"
				use:tippy={{ content: tooltipContent }}
				aria-expanded="true"
				aria-label="menu"
			>
				<span class="icon is-small">
					<i class="fas fa-ellipsis-vertical" aria-hidden="true"></i>
				</span>
			</button>
			<div class="dropdown-content" bind:this={tooltipContent}>
				<!-- cancellation is only avaiable if progress variable is not undefined after receving message from pipeline-->
				{#if status === 'In progress' && dataset.raw.progress < 100}
					<!-- svelte-ignore a11y_missing_attribute -->
					<a
						class="dropdown-item {dataset.raw.progress ? '' : 'disabled'}"
						role="button"
						tabindex="0"
						onclick={() => {
							if (!dataset.raw.progress) return;
							clickMenuButton();
							openCancelDialog();
						}}
						onkeydown={handleEnterKey}
					>
						<span class="icon">
							<i class="fa-solid fa-file-lines"></i>
						</span>
						<span>Cancel</span>
					</a>
				{/if}
				<a class="dropdown-item" role="button" href={dataset.raw.url.replace('pmtiles://', '')}>
					<span class="icon">
						<i class="fa-solid fa-download"></i>
					</span>
					<span>Download</span>
				</a>
				{#if logAvailable}
					<!-- svelte-ignore a11y_missing_attribute -->
					<a
						class="dropdown-item"
						role="button"
						tabindex="0"
						onclick={() => {
							clickMenuButton();
							showLogDialog(dataset.raw.log ?? '');
						}}
						onkeydown={handleEnterKey}
					>
						<span class="icon">
							<i class="fa-solid fa-file-lines"></i>
						</span>
						<span>Show logs</span>
					</a>
				{/if}
				{#if dataset.raw.error}
					<!-- svelte-ignore a11y_missing_attribute -->
					<a
						class="dropdown-item"
						role="button"
						tabindex="0"
						onclick={() => {
							clickMenuButton();
							showLogDialog(dataset.raw.error ?? '');
						}}
						onkeydown={handleEnterKey}
					>
						<span class="icon">
							<i class="fa-solid fa-triangle-exclamation"></i>
						</span>
						<span>Show error logs</span>
					</a>
				{/if}
				{#if deletable}
					<!-- svelte-ignore a11y_missing_attribute -->
					<a
						class="dropdown-item"
						role="button"
						tabindex="0"
						onclick={() => {
							clickMenuButton();
							openDeleteDialog(dataset);
						}}
						onkeydown={handleEnterKey}
					>
						<span class="icon">
							<i class="fa-solid fa-trash"></i>
						</span>
						<span>Delete</span>
					</a>
				{/if}
			</div>
		</div>
	</td>
</tr>

{#if isDetailsShown && dataset.datasets}
	{#each dataset.datasets as ds}
		<IngestingDatasetRowDetail dataset={ds} change={handleDatasetRowChanged} />
	{/each}
{/if}

<ModalTemplate
	title="Are you sure deleting this job?"
	bind:show={confirmDeleteDialogVisible}
	showClose={!isDeleting}
>
	{#snippet content()}
		<div>
			<Notification type="warning" showCloseButton={false}>
				Unexpected bad things will happen if you don't read this!
			</Notification>
			<div class="mt-2">
				This action <b>cannot</b> be undone. This will permanently delete
				<b>{deletedDataset?.raw.name}</b>
				which were uploaded and ingested. All ingested datasets associated to this raw file will also
				be deleted.
				<br />
				Please type <b>{deletedDataset?.raw.name}</b> to confirm.
			</div>
			<br />
			<input class="input" type="text" bind:value={deletedDatasetName} />
		</div>
	{/snippet}
	{#snippet buttons()}
		<div>
			<button
				class="button is-primary is-uppercase has-text-weight-bold {isDeleting ? 'is-loading' : ''}"
				onclick={handleDeleteDataset}
				disabled={isDeleting || deletedDatasetName !== deletedDataset?.raw.name}
			>
				Delete this ingesting dataset
			</button>
		</div>
	{/snippet}
</ModalTemplate>

<ModalTemplate title="Error" bind:show={logDialogVisible} hiddenButtons={true}>
	{#snippet content()}
		<div>
			<textarea class="textarea error-log" bind:value={logText} readonly></textarea>
		</div>
	{/snippet}
</ModalTemplate>

<ModalTemplate title="Are you sure cancelling this job?" bind:show={cancelDialogVisible}>
	{#snippet content()}
		<div>
			<Notification type="warning" showCloseButton={false}>
				Unexpected bad things will happen if you don't read this!
			</Notification>
			<div class="mt-2">
				This action <b>cannot</b> be undone. This will permanently cancel and delete
				<b>{dataset?.raw.name}</b>
				which was uploaded and being ingested now.
				<br />
				Please type <b>{dataset?.raw.name}</b> to confirm.
			</div>
			<br />
			<input class="input" type="text" bind:value={cancelledDatasetName} />
		</div>
	{/snippet}

	{#snippet buttons()}
		<div>
			<button
				class="button is-primary is-uppercase has-text-weight-bold"
				onclick={handleCancelDataset}
				disabled={cancelledDatasetName !== dataset?.raw.name}
			>
				Cancel this ingesting process
			</button>
		</div>
	{/snippet}
</ModalTemplate>

<style lang="scss">
	.toggle-button {
		border: none;
		background: transparent;
		box-shadow: none;

		.toggle-icon {
			-webkit-transition: all 0.3s ease;
			-moz-transition: all 0.3s ease;
			-ms-transition: all 0.3s ease;
			-o-transition: all 0.3s ease;
			transition: all 0.3s ease;

			&.active {
				transform: rotate(-180deg);
				-webkit-transform: rotate(-180deg);
				-moz-transform: rotate(-180deg);
				-ms-transform: rotate(-180deg);
				-o-transform: rotate(-180deg);
				transition: rotateZ(-180deg);
			}
		}
	}
	.detail-panel {
		border-top: 1px dashed gray;
	}

	.error-dialog-button {
		cursor: pointer;
	}

	.error-log {
		resize: none;
		height: calc(50vh);
		background-color: #1c1c1c;
		color: white;
	}

	.menu-button {
		border: none;
		background: transparent;
		box-shadow: none;
	}

	.disabled {
		cursor: not-allowed;
	}

	:global(.tippy-box[data-theme='transparent']) {
		background-color: transparent;
		color: transparent;
	}

	.name {
		color: black;

		&:hover {
			color: #006eb5;
		}
	}
</style>
