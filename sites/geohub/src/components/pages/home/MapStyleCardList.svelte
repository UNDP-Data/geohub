<script lang="ts">
	import { goto } from '$app/navigation';
	import Star from '$components/util/Star.svelte';
	import { AccessLevel } from '$lib/config/AppConfig';
	import { getAccessLevelIcon } from '$lib/helper';
	import type { DashboardMapStyle, MapsData, TableViewType } from '$lib/types';
	import { Notification } from '@undp-data/svelte-undp-components';
	import { CardWithImage, Loader, Pagination } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher } from 'svelte';
	import Time from 'svelte-time';
	const dispatch = createEventDispatcher();

	export let mapData: MapsData | undefined;
	export let showMenu = true;
	export let viewType: TableViewType = 'card';
	export let mode: 'browse' | 'select' = 'browse';
	export let selectedId = '';

	const handlePaginationClicked = async (url: string) => {
		const apiUrl = new URL(url);
		dispatch('reload', { url: apiUrl });
	};

	const handleSelect = (style: DashboardMapStyle) => {
		if (mode === 'browse') {
			const mapLink = style.links.find((l) => l.rel === 'map')?.href;
			if (mapLink) {
				goto(mapLink);
			}
		} else {
			if (selectedId !== style.id) {
				dispatch('select', { style });
			}
		}
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
							{@const accessIcon = getAccessLevelIcon(style.access_level, true)}
							{@const selected = selectedId === style.id}
							<tr class="map-row {selected ? 'selected' : ''}">
								<td
									class="map-title map-col"
									on:click={() => {
										handleSelect(style);
									}}
								>
									{style.name}
								</td>
								<td
									class="map-col"
									on:click={() => {
										handleSelect(style);
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
										handleSelect(style);
									}}
								>
									<Time timestamp={style.createdat} format="HH:mm, MM/DD/YYYY" />
								</td>
								<td
									class="map-col"
									on:click={() => {
										handleSelect(style);
									}}>{style.created_user}</td
								>
								<td
									class="map-col"
									on:click={() => {
										handleSelect(style);
									}}
								>
									{#if style.updated_user}
										<Time timestamp={style.updatedat} format="HH:mm, MM/DD/YYYY" />
									{/if}
								</td>
								<td
									class="map-col"
									on:click={() => {
										handleSelect(style);
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
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="columns is-multiline is-mobile">
				{#each mapData.styles as style}
					{@const styleLink = style.links.find((l) => l.rel === 'static-auto')?.href}
					{@const accessLevel = style.access_level}
					{@const accessIcon = getAccessLevelIcon(accessLevel, true)}
					{@const accentColor =
						accessLevel === AccessLevel.PRIVATE
							? 'red'
							: accessLevel === AccessLevel.ORGANIZATION
								? 'blue'
								: 'yellow'}
					{#if styleLink}
						<div class="column is-one-third is-full-mobile">
							<CardWithImage
								title={style.name}
								on:click={() => {
									handleSelect(style);
								}}
								tag="Map"
								image={styleLink.replace('{width}', '298').replace('{height}', '180')}
								width={298}
								height={180}
								linkName={mode === 'browse'
									? 'Explore'
									: selectedId === style.id
										? 'Selected'
										: 'Use this map'}
								accent={mode === 'browse'
									? accentColor
									: selectedId === style.id
										? 'yellow'
										: 'blue'}
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

		.map-row {
			cursor: pointer;

			&.selected {
				background-color: #ffeb00;
				cursor: not-allowed !important;
			}
		}

		.map-col {
			max-width: 80px;

			word-break: break-all;

			&:hover {
				color: #006eb5;
			}
		}
	}
</style>
