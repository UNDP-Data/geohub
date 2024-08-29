<script lang="ts">
	import { goto } from '$app/navigation';
	import Star from '$components/util/Star.svelte';
	import { AccessLevel } from '$lib/config/AppConfig';
	import { getAccessLevelIcon } from '$lib/helper';
	import type { StorymapsData, TableViewType } from '$lib/types';
	import { Notification } from '@undp-data/svelte-undp-components';
	import { CardWithImage, Loader, Pagination } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher } from 'svelte';
	import Time from 'svelte-time/Time.svelte';

	export let storiesData: StorymapsData | undefined;
	export let viewType: TableViewType;

	const dispatch = createEventDispatcher();

	const handlePaginationClicked = async (url: string) => {
		const apiUrl = new URL(url);
		dispatch('reload', { url: apiUrl });
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
						{@const accessIcon = getAccessLevelIcon(story.access_level, true)}
						{#if storymapLink}
							<tr class="map-row">
								<td
									class="map-title map-col"
									on:click={() => {
										goto(storymapLink);
									}}
								>
									{story.title}
								</td>
								<td
									class="map-col"
									on:click={() => {
										goto(storymapLink);
									}}
								>
									{#if accessIcon}
										<span class="icon">
											<i class={accessIcon} />
										</span>
									{/if}
								</td>
								<td
									class="map-col"
									on:click={() => {
										goto(storymapLink);
									}}
								>
									<Time timestamp={story.createdat} format="HH:mm, MM/DD/YYYY" />
								</td>
								<td
									class="map-col"
									on:click={() => {
										goto(storymapLink);
									}}>{story.created_user}</td
								>
								<td
									class="map-col"
									on:click={() => {
										goto(storymapLink);
									}}
								>
									{#if story.updated_user}
										<Time timestamp={story.updatedat} format="HH:mm, MM/DD/YYYY" />
									{/if}
								</td>
								<td
									class="map-col"
									on:click={() => {
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
										bind:id={story.id}
										bind:isStar={story.is_star}
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
				{@const accessIcon = getAccessLevelIcon(story.access_level, true)}

				<div class="column is-one-third-tablet is-one-third-desktop is-full-mobile">
					<CardWithImage
						title={story.title}
						url={storyLink}
						tag="Story"
						image={staticLink?.replace('{width}', '298').replace('{height}', '180')}
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
		<div class="is-flex is-justify-content-center pt-2">
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
