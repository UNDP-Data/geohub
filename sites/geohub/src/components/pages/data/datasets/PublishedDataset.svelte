<script lang="ts">
	import { browser } from '$app/environment';
	import Star from '$components/util/Star.svelte';
	import { Permission, SdgLogos } from '$lib/config/AppConfig';
	import {
		createAttributionFromTags,
		handleEnterKey,
		removeSasTokenFromDatasetUrl
	} from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import { DefaultLink } from '@undp-data/svelte-undp-design';
	import { filesize } from 'filesize';
	import { marked } from 'marked';
	import Time from 'svelte-time';
	import PublishedDatasetDeleteDialog from './PublishedDatasetDeleteDialog.svelte';

	export let feature: DatasetFeature;
	export let showLicense = false;
	export let showDatatime = false;

	const datasetLinks = feature.properties.links;
	const downloadUrl = datasetLinks.find((l) => l.rel === 'download')?.href;

	const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
		{ key: string; value: string }
	];
	const sdgs = tags
		.filter((t) => t.key === 'sdg_goal')
		.sort((a, b) => parseInt(a.value) - parseInt(b.value));
	const unit = tags?.find((t) => t.key === 'unit')?.value;
	const attribution = createAttributionFromTags(tags);

	const isStac = feature.properties.tags?.find((t) => t.key === 'type')?.value === 'stac' ?? false;

	let confirmDeleteDialogVisible = false;

	let innerWidth = 0;

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

	const getEditMetadataPage = (url: string) => {
		const url4edit = removeSasTokenFromDatasetUrl(url);
		return `/data/${feature.properties.id}/edit?url=${url4edit}`;
	};

	const handleDeletedDataset = () => {
		if (browser) {
			window.location.href = '/data';
		}
	};
</script>

<svelte:window bind:innerWidth />

<div class="buttons my-2">
	<Star
		bind:id={feature.properties.id}
		bind:isStar={feature.properties.is_star}
		bind:no_stars={feature.properties.no_stars}
		table="datasets"
		size="normal"
	/>

	{#if !isStac && feature.properties.permission > Permission.READ}
		<a class="button" href={getEditMetadataPage(feature.properties.url)}>
			<span class="icon">
				<i class="fa-solid fa-pen-to-square" />
			</span>
			<span>Edit</span>
		</a>
	{/if}
	{#if feature.properties.permission > Permission.WRITE}
		<button
			class="button"
			on:click={() => {
				confirmDeleteDialogVisible = true;
			}}
			on:keydown={handleEnterKey}
		>
			<span class="icon">
				<i class="fa-solid fa-trash" />
			</span>
			<span>Unpublish</span>
		</button>
	{/if}
</div>

<div class="is-flex is-flex-direction-column">
	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label">Description</label>
		<div class="control">
			<!-- eslint-disable svelte/no-at-html-tags -->
			{@html marked(feature.properties.description)}
		</div>
	</div>
	{#if sdgs.length > 0}
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">SDGs</label>
			<div class="control">
				<div class="sdg-grid">
					{#each sdgs as sdg}
						{@const logo = SdgLogos.find((s) => s.value === parseInt(sdg.value))}
						<figure
							class={`image is-48x48 is-flex is-align-items-center`}
							data-testid="icon-figure"
						>
							<img src={logo.icon} alt="SDG {logo.value}" title="SDG {logo.value}" />
						</figure>
					{/each}
				</div>
			</div>
		</div>
	{/if}
	{#if showLicense}
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">License</label>
			<div class="control">
				{feature.properties.license?.length > 0 ? feature.properties.license : 'No license'}
			</div>
		</div>
	{/if}
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
	{#if showDatatime}
		<div class="columns is-mobile is-flex">
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
	{/if}
	{#if downloadUrl}
		{@const filePath = new URL(downloadUrl).pathname.split('/')}
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Dataset</label>
			<div class="control">
				{#await getFileSize(downloadUrl) then bytes}
					<div class="is-flex is-align-content-center">
						<DefaultLink
							href={downloadUrl}
							title={`${filePath[filePath.length - 1].split('.')[1].toUpperCase()} ${bytes}`}
							target=""
						>
							<i slot="content" class="fas fa-download has-text-primary pl-2"></i>
						</DefaultLink>
					</div>
				{/await}
			</div>
		</div>
	{/if}
</div>

<PublishedDatasetDeleteDialog
	bind:id={feature.properties.id}
	bind:name={feature.properties.name}
	bind:dialogShown={confirmDeleteDialogVisible}
	on:deleted={handleDeletedDataset}
/>

<style lang="scss">
	.hidden-mobile {
		display: block;
		@media (max-width: 48em) {
			display: none;
		}
	}

	.sdg-grid {
		display: flex;
		flex-direction: row;
		gap: 5px;
		flex-wrap: wrap;
	}
</style>
