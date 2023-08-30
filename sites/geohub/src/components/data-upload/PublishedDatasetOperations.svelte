<script lang="ts">
	import { goto } from '$app/navigation';
	import Notification from '$components/controls/Notification.svelte';
	import { Permission } from '$lib/config/AppConfig';
	import { initTippy, removeSasTokenFromDatasetUrl } from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	export let feature: DatasetFeature;

	let confirmDeleteDialogVisible = false;
	let deletedDataset: DatasetFeature = undefined;
	let deletedDatasetName = '';
	let isDeleting = false;

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
	.menu-button {
		border: none;
		background: transparent;
	}

	:global(.tippy-box[data-theme='transparent']) {
		background-color: transparent;
		color: transparent;
	}
</style>
