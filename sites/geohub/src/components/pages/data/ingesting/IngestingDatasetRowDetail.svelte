<script lang="ts">
	import PublishedDatasetDeleteDialog from '$components/pages/data/datasets/PublishedDatasetDeleteDialog.svelte';
	import { removeSasTokenFromDatasetUrl } from '$lib/helper';
	import type { IngestedDataset } from '$lib/types';
	import { handleEnterKey, initTippy } from '@undp-data/svelte-undp-components';
	import { filesize } from 'filesize';
	import Time from 'svelte-time';
	import DatasetPreview from '../datasets/DatasetPreview.svelte';

	interface Props {
		dataset: IngestedDataset;
		change: () => void;
	}

	let { dataset = $bindable(), change = () => {} }: Props = $props();

	let datasetId: string = $derived(dataset.id as string);
	let datasetName: string = $derived(dataset.name as string);

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

	const getEditMetadataPage = (url: string, isNew: boolean) => {
		const url4edit = removeSasTokenFromDatasetUrl(url);
		return isNew ? `/data/edit?url=${url4edit}` : `/data/${dataset.id}/edit?url=${url4edit}`;
	};

	let isLoadPreviewMap = $state(false);
	const previewTippy = initTippy({
		placement: 'left',
		maxWidth: 400,
		onShow(instance) {
			isLoadPreviewMap = true;
			instance.popper.querySelector('.close')?.addEventListener('click', () => {
				instance.hide();
			});
		}
	});
	let previewContent: HTMLElement | undefined = $state();

	let confirmDeleteDialogVisible = $state(false);

	const clickMenuButton = () => {
		const buttons = document.getElementsByClassName(`menu-button-${dataset.id}`);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const button: HTMLButtonElement = buttons[0];
		button.click();
	};

	const handleDeleteDataset = () => {
		change();
	};
</script>

<tr>
	<td class="px-1"></td>
	<td class="pl-0">
		{dataset.name}
	</td>
	<td>
		<span class="tag {dataset.processing ? 'is-link' : 'is-success is-light'}">
			<span class="icon">
				<i class="fa-solid {dataset.processing ? 'fa-lock' : 'fa-check'}"></i>
			</span>
			<span>{dataset.processing ? 'Unpublished' : 'Published'}</span>
		</span>
	</td>
	<td>
		{filesize(dataset.contentLength ?? 0, { round: 1 })}
	</td>
	<td>
		<Time timestamp={dataset.createdat} format="HH:mm, MM/DD/YYYY" />
	</td>
	<td>
		<div class="dropdown">
			<button
				class="button menu-button menu-button-{dataset.id}"
				use:tippy={{ content: tooltipContent }}
				aria-expanded="true"
				aria-label="menu"
			>
				<span class="icon is-small">
					<i class="fas fa-ellipsis-vertical" aria-hidden="true"></i>
				</span>
			</button>
			<div class="dropdown-content" bind:this={tooltipContent}>
				<a class="dropdown-item" role="button" href={dataset.url?.replace('pmtiles://', '')}>
					<span class="icon">
						<i class="fa-solid fa-download"></i>
					</span>
					<span>Download</span>
				</a>

				<!-- svelte-ignore a11y_missing_attribute -->
				<a class="dropdown-item" use:previewTippy={{ content: previewContent }}>
					<span class="icon">
						<i class="fa-solid fa-map"></i>
					</span>
					<span>Preview</span>
				</a>
				<div bind:this={previewContent} class="tooltip p-2 preview">
					{#if isLoadPreviewMap && dataset.feature}
						<DatasetPreview bind:feature={dataset.feature} height="300px" showButtons={false}
						></DatasetPreview>
					{/if}
				</div>

				<a
					class="dropdown-item"
					role="button"
					href={getEditMetadataPage(dataset.url ?? '', dataset.processing ?? false)}
				>
					<span class="icon">
						<i class="fa-solid {dataset.processing ? 'fa-lock-open' : 'fa-pen-to-square'}"></i>
					</span>
					<span>
						{#if dataset.processing}
							Publish
						{:else}
							Edit
						{/if}
					</span>
				</a>

				{#if !dataset.processing}
					<a class="dropdown-item" role="button" tabindex="0" href="/data/{dataset.id}/style/edit">
						<span class="icon">
							<i class="fa-solid fa-paintbrush"></i>
						</span>
						<span>Set default style</span>
					</a>
				{/if}

				{#if !dataset.processing}
					<!-- svelte-ignore a11y_missing_attribute -->
					<a
						class="dropdown-item"
						role="button"
						tabindex="0"
						onclick={() => {
							clickMenuButton();
							confirmDeleteDialogVisible = true;
						}}
						onkeydown={handleEnterKey}
					>
						<span class="icon">
							<i class="fa-solid fa-trash"></i>
						</span>
						<span>Unpublish</span>
					</a>
				{/if}
			</div>
		</div>
	</td>
</tr>

<PublishedDatasetDeleteDialog
	id={datasetId}
	name={datasetName}
	bind:dialogShown={confirmDeleteDialogVisible}
	on:deleted={handleDeleteDataset}
/>

<style lang="scss">
	.menu-button {
		border: none;
		background: transparent;
		box-shadow: none;
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

	.operation-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-gap: 5px;
	}

	.preview {
		width: 350px;
	}

	:global(.tippy-box[data-theme='transparent']) {
		background-color: transparent;
		color: transparent;
	}
</style>
