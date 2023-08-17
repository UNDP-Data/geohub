<script lang="ts">
	import { goto } from '$app/navigation';
	import { createAttributionFromTags, removeSasTokenFromDatasetUrl } from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import Time from 'svelte-time';
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import Notification from '$components/controls/Notification.svelte';
	import { Permission } from '$lib/config/AppConfig';
	import MiniMap from '$components/data-view/MiniMap.svelte';
	import { marked } from 'marked';
	import { filesize } from 'filesize';
	import { initTippy } from '$lib/helper';

	const dispatch = createEventDispatcher();

	export let feature: DatasetFeature;

	const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
		{ key: string; value: string }
	];
	const sdgs = tags.filter((t) => t.key === 'sdg_goal');
	const unit = tags?.find((t) => t.key === 'unit')?.value;
	const attribution = createAttributionFromTags(tags);

	const is_raster: boolean = feature.properties.is_raster as unknown as boolean;
	const stacType = tags?.find((tag) => tag.key === 'stac');
	const url = feature.properties.url;

	const isStac = is_raster && stacType ? true : false;
	const isPbf = !is_raster && url.toLocaleLowerCase().endsWith('.pbf');

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

	interface FileOptions {
		title: string;
		url: string;
	}

	let file: FileOptions;
	if (!(isStac === true || isPbf === true)) {
		const fileUrl = new URL(url.replace('pmtiles://', ''));
		const filePath = fileUrl.pathname.split('/');
		file = {
			title: filePath[filePath.length - 1],
			url: fileUrl.toString()
		};
	}

	const getFileSize = async (url: string) => {
		let bytes = 'N/A';
		const res = await fetch(url);
		if (res.ok) {
			const contentLength = res.headers.get('content-length');
			if (contentLength) {
				bytes = filesize(Number(contentLength), { round: 1 }) as string;
			}
		}
		return bytes;
	};

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
		<div class="column is-1 hidden-mobile">
			{#if sdgs.length > 0}
				<div class="sdg-grid">
					{#each sdgs as sdg}
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
					{/each}
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
		</div>
	</div>

	{#if isDetailsShown}
		<div class="detail-panel p-0 py-2">
			<div class="columns m-0">
				<div class="column is-flex is-flex-direction-column">
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Description</label>
						<div class="control">
							<!-- eslint-disable svelte/no-at-html-tags -->
							{@html marked(feature.properties.description)}
						</div>
					</div>
					{#if sdgs.length > 0}
						<div class="field show-mobile">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label">SDGs</label>
							<div class="control">
								<div class="sdg-grid">
									{#each sdgs as sdg}
										<figure
											class={`image is-48x48 is-flex is-align-items-center`}
											data-testid="icon-figure"
										>
											<img
												src="/assets/sdgs/{sdg.value}.png"
												alt="SDG {sdg.value}"
												title="SDG {sdg.value}"
											/>
										</figure>
									{/each}
								</div>
							</div>
						</div>
					{/if}
					<div class="field show-mobile">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">License</label>
						<div class="control">
							{feature.properties.license?.length > 0 ? feature.properties.license : 'No license'}
						</div>
					</div>
					<div class="columns is-mobile">
						<div class="column field">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label">Source</label>
							<div class="control">
								<!-- eslint-disable svelte/no-at-html-tags -->
								{@html attribution}
							</div>
						</div>
						{#if unit}
							<div class="column field">
								<!-- svelte-ignore a11y-label-has-associated-control -->
								<label class="label">Unit</label>
								<div class="control">
									{unit}
								</div>
							</div>
						{/if}
					</div>
					<div class="columns is-mobile">
						<div class="column field">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label">Created by</label>
							<div class="control">
								{feature.properties.created_user}
							</div>
						</div>
						<div class="column field">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label">Updated by</label>
							<div class="control">
								{feature.properties.updated_user}
							</div>
						</div>
					</div>
					<div class="columns is-mobile is-flex show-mobile">
						<div class="column field">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label">Created at</label>
							<div class="control">
								<Time timestamp={feature.properties.createdat} format="HH:mm, MM/DD/YYYY" />
							</div>
						</div>
						<div class="column field">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label">Updated at</label>
							<div class="control">
								<Time timestamp={feature.properties.updatedat} format="HH:mm, MM/DD/YYYY" />
							</div>
						</div>
					</div>
					{#if file}
						<div class="field">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label">Dataset</label>
							<div class="control">
								<a class="download-button is-flex is-align-items-center" href={file.url}>
									{file.title}
									{#await getFileSize(file.url) then bytes}
										({bytes})
									{/await}
									<i class="fas fa-download has-text-primary pl-2"></i>
								</a>
							</div>
						</div>
					{/if}
				</div>
				<div class="column">
					<MiniMap
						bind:feature
						isLoadMap={isDetailsShown}
						width="95%"
						height={innerWidth < 768 ? '150px' : '350px'}
					/>
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

	.sdg-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 5px;

		@media (max-width: 48em) {
			grid-template-columns: repeat(5, 1fr);
		}
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

	.download-button {
		color: rgb(60, 60, 60);
		text-decoration: 2px underline #d12800;
	}

	.detail-panel {
		border-top: 1px dashed gray;
	}

	:global(.tippy-box[data-theme='transparent']) {
		background-color: transparent;
		color: transparent;
	}
</style>
