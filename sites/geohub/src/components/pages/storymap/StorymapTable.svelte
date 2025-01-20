<script lang="ts">
	import { goto } from '$app/navigation';
	import Star from '$components/util/Star.svelte';
	import { AccessLevel } from '$lib/config/AppConfig';
	import { getAccessLevelIcon } from '$lib/helper';
	import type { StorymapsData, TableViewType } from '$lib/types';
	import { Notification } from '@undp-data/svelte-undp-components';
	import { CardWithImage, Loader, Pagination } from '@undp-data/svelte-undp-design';
	import Time from 'svelte-time/Time.svelte';

	interface Props {
		storiesData: StorymapsData | undefined;
		viewType: TableViewType;
		onReload?: (url: URL) => void;
	}

	let { storiesData = $bindable(), viewType = $bindable(), onReload = () => {} }: Props = $props();

	const handlePaginationClicked = async (url: string) => {
		const apiUrl = new URL(url);
		if (onReload) onReload(apiUrl);
	};
</script>

{#if !storiesData}
	<div class="is-flex is-justify-content-center">
		<Loader size="medium" />
	</div>
{:else if storiesData.stories?.length > 0}
	{#if viewType === 'list'}
		<div class="table-container">
			<table class="map-table table is-hoverable is-fullwidth">
				<thead>
					<tr>
						<th class="map-title">Title</th>
						<th></th>
						<th>Created at</th>
						<th>Created by</th>
						<th>Updated at</th>
						<th>Updated by</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each storiesData.stories as story}
						{@const storymapLink = story.links?.find((l) => l.rel === 'storymap')?.href}
						{@const accessIcon = getAccessLevelIcon(story.access_level as AccessLevel, true)}
						{#if storymapLink}
							<tr class="map-row">
								<td
									class="map-title map-col"
									onclick={() => {
										goto(storymapLink);
									}}
								>
									{story.title}
								</td>
								<td
									class="map-col"
									onclick={() => {
										goto(storymapLink);
									}}
								>
									{#if accessIcon}
										<span class="icon">
											<i class={accessIcon}></i>
										</span>
									{/if}
								</td>
								<td
									class="map-col"
									onclick={() => {
										goto(storymapLink);
									}}
								>
									<Time timestamp={story.createdat} format="HH:mm, MM/DD/YYYY" />
								</td>
								<td
									class="map-col"
									onclick={() => {
										goto(storymapLink);
									}}>{story.created_user}</td
								>
								<td
									class="map-col"
									onclick={() => {
										goto(storymapLink);
									}}
								>
									{#if story.updated_user}
										<Time timestamp={story.updatedat} format="HH:mm, MM/DD/YYYY" />
									{/if}
								</td>
								<td
									class="map-col"
									onclick={() => {
										goto(storymapLink);
									}}
								>
									{#if story.updated_user}
										{story.updated_user}
									{/if}
								</td>
								<td>
									<Star
										isCompact={true}
										bind:id={story.id as string}
										bind:isStar={story.is_star as boolean}
										bind:no_stars={story.no_stars}
										table="storymaps"
									/>
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="columns is-multiline is-mobile">
			{#each storiesData.stories as story}
				{@const storyLink = story.links?.find((l) => l.rel === 'storymap')?.href}
				{@const staticLink = story.links?.find((l) => l.rel === 'static-auto')?.href}
				{@const accessLevel = story.access_level}
				{@const accessIcon = getAccessLevelIcon(story.access_level as AccessLevel, true)}

				<div class="column is-one-third-tablet is-one-third-desktop is-full-mobile">
					<CardWithImage
						title={story.title as string}
						url={storyLink}
						tag="Story"
						image={staticLink?.replace('{width}', '298').replace('{height}', '180') as string}
						width={298}
						height={180}
						linkName="Explore"
						accent={accessLevel === AccessLevel.PRIVATE
							? 'red'
							: accessLevel === AccessLevel.ORGANIZATION
								? 'blue'
								: 'yellow'}
						icon={accessIcon}
					/>
				</div>
			{/each}
		</div>
	{/if}

	{#key storiesData}
		<div class="pt-2">
			<Pagination
				totalPages={storiesData.pages.totalPages}
				currentPage={storiesData.pages.currentPage}
				hidden={storiesData.pages.totalPages <= 1}
				on:clicked={(e) => {
					const url = storiesData.links?.find((l) => l.rel === e.detail.type)?.href;
					if (!url) return;
					handlePaginationClicked(url);
				}}
			/>
		</div>
	{/key}
{:else}
	<div class="p-4">
		<Notification type="info" showCloseButton={false}>No map found</Notification>
	</div>
{/if}

<style lang="scss">
	.map-table {
		.map-title {
			min-width: 120px;
		}
		.map-col {
			cursor: pointer;
			max-width: 80px;

			word-break: break-all;

			&:hover {
				color: #006eb5;
			}
		}
	}
</style>
