<script lang="ts">
	import { browser } from '$app/environment';
	import Star from '$components/util/Star.svelte';
	import {
		AcceptedOrganisationDomains,
		AccessLevel,
		Permission,
		SdgLogos
	} from '$lib/config/AppConfig';
	import {
		createAttributionFromTags,
		getDomainFromEmail,
		removeSasTokenFromDatasetUrl
	} from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import { FieldControl, handleEnterKey } from '@undp-data/svelte-undp-components';
	import { DefaultLink } from '@undp-data/svelte-undp-design';
	import { filesize } from 'filesize';
	import { marked } from 'marked';
	import Time from 'svelte-time';
	import PublishedDatasetDeleteDialog from './PublishedDatasetDeleteDialog.svelte';

	export let feature: DatasetFeature;

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
	const year = tags?.filter((t) => t.key === 'year')?.map((t) => t.value);
	const granularity = tags?.filter((t) => t.key === 'granularity')?.map((t) => t.value);
	const resolution = tags?.filter((t) => t.key === 'resolution')?.map((t) => t.value);

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
		<a
			class="button is-uppercase has-text-weight-bold"
			href={getEditMetadataPage(feature.properties.url)}
		>
			Edit
		</a>
	{/if}
	{#if feature.properties.permission > Permission.WRITE}
		<button
			class="button is-uppercase has-text-weight-bold"
			on:click={() => {
				confirmDeleteDialogVisible = true;
			}}
			on:keydown={handleEnterKey}
		>
			Unpublish
		</button>
	{/if}
</div>

<div class="is-flex is-flex-direction-column">
	<FieldControl title="Description" fontWeight="bold" showHelp={false}>
		<div slot="control">
			<!-- eslint-disable svelte/no-at-html-tags -->
			{@html marked(feature.properties.description)}
		</div>
	</FieldControl>

	{#if sdgs.length > 0}
		<FieldControl title="SDGs" isFirstCharCapitalized={false} fontWeight="bold" showHelp={false}>
			<div slot="control">
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
		</FieldControl>
	{/if}

	<div class="columns is-multiline">
		<div class="column is-6">
			<FieldControl title="License" fontWeight="bold" showHelp={false}>
				<div slot="control">
					{feature.properties.license?.length > 0 ? feature.properties.license : 'No license'}
				</div>
			</FieldControl>
		</div>

		<div class="column is-6">
			<FieldControl title="Access level" fontWeight="bold" showHelp={false}>
				<div slot="control">
					{#if feature.properties.access_level === AccessLevel.PUBLIC}
						Public
					{:else if feature.properties.access_level === AccessLevel.PRIVATE}
						Private
					{:else}
						{@const domain = getDomainFromEmail(feature.properties.created_user)}
						{@const org = AcceptedOrganisationDomains.find((d) => d.domain === domain).name}
						{org.toUpperCase()}
					{/if}
				</div>
			</FieldControl>
		</div>

		<div class="column is-6">
			<FieldControl title="Source" fontWeight="bold" showHelp={false}>
				<div slot="control">
					<!-- eslint-disable svelte/no-at-html-tags -->
					{@html attribution}
				</div>
			</FieldControl>
		</div>
		{#if unit}
			<div class="column is-6">
				<FieldControl title="Unit" fontWeight="bold" showHelp={false}>
					<div slot="control">
						{unit}
					</div>
				</FieldControl>
			</div>
		{/if}

		{#if year?.length > 0}
			<div class="column is-6">
				<FieldControl title="Year" fontWeight="bold" showHelp={false}>
					<div slot="control">
						{year.join(', ')}
					</div>
				</FieldControl>
			</div>
		{/if}

		{#if granularity?.length > 0}
			<div class="column is-6">
				<FieldControl title="Admin Level" fontWeight="bold" showHelp={false}>
					<div slot="control">
						{granularity.join(', ')}
					</div>
				</FieldControl>
			</div>
		{/if}

		{#if resolution?.length > 0}
			<div class="column is-6">
				<FieldControl title="Resolution" fontWeight="bold" showHelp={false}>
					<div slot="control">
						{resolution.join(', ')}
					</div>
				</FieldControl>
			</div>
		{/if}

		<div class="column is-6">
			<FieldControl title="Created by" fontWeight="bold" showHelp={false}>
				<div slot="control">
					{feature.properties.created_user}
				</div>
			</FieldControl>
		</div>
		<div class="column is-6">
			<FieldControl title="Updated by" fontWeight="bold" showHelp={false}>
				<div slot="control">
					{feature.properties.updated_user}
				</div>
			</FieldControl>
		</div>

		<div class="column is-6">
			<FieldControl title="Created at" fontWeight="bold" showHelp={false}>
				<div slot="control">
					<Time timestamp={feature.properties.createdat} format="HH:mm, MM/DD/YYYY" />
				</div>
			</FieldControl>
		</div>
		<div class="column is-6">
			<FieldControl title="Updated at" fontWeight="bold" showHelp={false}>
				<div slot="control">
					<Time timestamp={feature.properties.updatedat} format="HH:mm, MM/DD/YYYY" />
				</div>
			</FieldControl>
		</div>

		{#if downloadUrl}
			{@const filePath = new URL(downloadUrl).pathname.split('/')}
			<div class="column is-6">
				<FieldControl title="Dataset" fontWeight="bold" showHelp={false}>
					<div slot="control">
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
				</FieldControl>
			</div>
		{/if}
	</div>
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
