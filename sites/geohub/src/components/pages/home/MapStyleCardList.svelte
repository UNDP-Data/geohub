<script lang="ts">
	import { goto } from '$app/navigation';
	import Star from '$components/util/Star.svelte';
	import { AccessLevel } from '$lib/config/AppConfig';
	import { getAccessLevelIcon } from '$lib/helper';
	import type { MapsData, TableViewType } from '$lib/types';
	import { Notification } from '@undp-data/svelte-undp-components';
	import { CardWithImage, Loader, Pagination } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher } from 'svelte';
	import Time from 'svelte-time';
	const dispatch = createEventDispatcher();

	export let mapData: MapsData;
	export let showMenu = true;
	export let viewType: TableViewType = 'card';

	const handlePaginationClicked = async (url: string) => {
		const apiUrl = new URL(url);
		dispatch('reload', { url: apiUrl });
	};
</script>

{#if !mapData}
	<div class="is-flex is-justify-content-center">
		<Loader size="medium" />
	</div>
{:else if mapData.styles?.length > 0}
	{#key mapData.styles}
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
						{#each mapData.styles as style}
							{@const mapLink = style.links.find((l) => l.rel === 'map')?.href}
							{@const accessIcon = getAccessLevelIcon(style.access_level, true)}
							{#if mapLink}
								<tr class="map-row">
									<td
										class="map-title map-col"
										on:click={() => {
											goto(mapLink);
										}}
									>
										{style.name}
									</td>
									<td
										class="map-col"
										on:click={() => {
											goto(mapLink);
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
											goto(mapLink);
										}}
									>
										<Time timestamp={style.createdat} format="HH:mm, MM/DD/YYYY" />
									</td>
									<td
										class="map-col"
										on:click={() => {
											goto(mapLink);
										}}>{style.created_user}</td
									>
									<td
										class="map-col"
										on:click={() => {
											goto(mapLink);
										}}
									>
										{#if style.updated_user}
											<Time timestamp={style.updatedat} format="HH:mm, MM/DD/YYYY" />
										{/if}
									</td>
									<td
										class="map-col"
										on:click={() => {
											goto(mapLink);
										}}
									>
										{#if style.updated_user}
											{style.updated_user}
										{/if}
									</td>
									<td>
										<Star
											isCompact={true}
											bind:id={style.id}
											bind:isStar={style.is_star}
											bind:no_stars={style.no_stars}
											table="style"
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
				{#each mapData.styles as style}
					{@const mapLink = style.links.find((l) => l.rel === 'map')?.href}
					{@const styleLink = style.links.find((l) => l.rel === 'static-auto')?.href}
					{@const accessLevel = style.access_level}
					{@const accessIcon = getAccessLevelIcon(accessLevel, true)}
					{#if styleLink}
						<div class="column is-one-third-tablet is-one-quarter-desktop is-full-mobile">
							<CardWithImage
								title={style.name}
								url={mapLink}
								tag="Map"
								image={styleLink.replace('{width}', '298').replace('{height}', '180')}
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
					{/if}
				{/each}
			</div>
		{/if}
	{/key}

	{#if showMenu}
		<div class="is-flex is-justify-content-center pt-2">
			<Pagination
				totalPages={mapData.pages.totalPages}
				currentPage={mapData.pages.currentPage}
				hidden={mapData.pages.totalPages <= 1}
				on:clicked={(e) => {
					const url = mapData.links?.find((l) => l.rel === e.detail.type)?.href;
					if (!url) return;
					handlePaginationClicked(url);
				}}
			/>
		</div>
	{/if}
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
