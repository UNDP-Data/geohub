<script lang="ts">
	import { initTippy, removeSasTokenFromDatasetUrl } from '$lib/helper';
	import type { IngestedDataset } from '$lib/types';
	import { filesize } from 'filesize';
	import Time from 'svelte-time/src/Time.svelte';
	import DataPreview from './DataPreview.svelte';
	import DataPreviewContent from './DataPreviewContent.svelte';

	export let dataset: IngestedDataset;

	const getEditMetadataPage = (url: string) => {
		const url4edit = removeSasTokenFromDatasetUrl(url);
		return `/data/publish?url=${url4edit}`;
	};

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

	let isLoadPreviewMap = false;
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
	let previewContent: HTMLElement;
</script>

<div class="columns m-0 is-mobile">
	<div class="column is-9-mobile">
		{dataset.name}

		<div class="show-mobile">
			<div class="pt-4 field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Size</label>
				<div class="control">
					{filesize(dataset.contentLength, { round: 1 })}
				</div>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Uploaded at</label>
				<div class="control">
					<Time timestamp={dataset.createdat} format="HH:mm, MM/DD/YYYY" />
				</div>
			</div>

			<div class="operation-grid">
				<a
					class="button is-primary table-button is-small"
					href={dataset.url.replace('pmtiles://', '')}
				>
					<span class="icon">
						<i class="fa-solid fa-download" />
					</span>
					<span>Download</span>
				</a>
				<DataPreview bind:url={dataset.url} bind:feature={dataset.feature} />
				{#if dataset.processing}
					<a
						class="button is-primary table-button is-small"
						href={getEditMetadataPage(dataset.url)}
					>
						<span class="icon">
							<i class="fa-solid fa-lock-open fa-lg" />
						</span>
						<span>Publish</span>
					</a>
				{/if}
			</div>
		</div>
	</div>
	<div class="column is-2">
		<span class="tag {dataset.processing ? 'is-link' : 'is-success is-light'}">
			<span class="icon pr-2">
				<i class="fa-solid {dataset.processing ? 'fa-lock' : 'fa-check'}"></i>
			</span>
			{dataset.processing ? 'Unpublished' : 'Published'}
		</span>
	</div>
	<div class="column is-1 hidden-mobile">
		{filesize(dataset.contentLength, { round: 1 })}
	</div>
	<div class="column is-2 hidden-mobile">
		<Time timestamp={dataset.createdat} format="HH:mm, MM/DD/YYYY" />
	</div>
	<div class="column is-1 hidden-mobile">
		<div class="dropdown-trigger">
			<button class="button menu-button" use:tippy={{ content: tooltipContent }}>
				<span class="icon is-small">
					<i class="fas fa-ellipsis-vertical" aria-hidden="true"></i>
				</span>
			</button>
		</div>
		<div class="tooltip" role="menu" bind:this={tooltipContent}>
			<div class="dropdown-content">
				<a class="dropdown-item" role="button" href={dataset.url.replace('pmtiles://', '')}>
					Download
				</a>

				<!-- svelte-ignore a11y-missing-attribute -->
				<a class="dropdown-item" use:previewTippy={{ content: previewContent }}> Preview </a>
				<div bind:this={previewContent} class="tooltip p-2">
					{#if isLoadPreviewMap}
						<DataPreviewContent
							bind:url={dataset.url}
							bind:feature={dataset.feature}
							bind:isLoadMap={isLoadPreviewMap}
						/>
					{/if}
				</div>

				{#if dataset.processing}
					<a class="dropdown-item" role="button" href={getEditMetadataPage(dataset.url)}>
						Publish
					</a>
				{/if}
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	:global(.tippy-box[data-theme='transparent']) {
		background-color: transparent;
		color: transparent;
	}

	.menu-button {
		border: none;
		background: transparent;
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
</style>
