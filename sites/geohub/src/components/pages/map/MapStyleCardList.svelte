<script lang="ts">
	import { goto } from '$app/navigation';
	import Star from '$components/util/Star.svelte';
	import { AccessLevel } from '$lib/config/AppConfig';
	import { getAccessLevelIcon } from '$lib/helper';
	import type { DashboardMapStyle, MapsData, TableViewType } from '$lib/types';
	import { Notification } from '@undp-data/svelte-undp-components';
	import { CardWithImage, Loader, Pagination } from '@undp-data/svelte-undp-design';
	import Time from 'svelte-time';

	interface Props {
		mapData: MapsData | undefined;
		showMenu?: boolean;
		viewType?: TableViewType;
		mode?: 'browse' | 'select';
		selectedId?: string;
		onreload?: (url: URL) => void;
		onselect?: (style: DashboardMapStyle) => void;
	}

	let {
		mapData = $bindable(),
		showMenu = $bindable(true),
		viewType = $bindable('card'),
		mode = $bindable('browse'),
		selectedId = $bindable(''),
		onreload = () => {},
		onselect = () => {}
	}: Props = $props();

	const handlePaginationClicked = async (url: string) => {
		const apiUrl = new URL(url);
		if (onreload) onreload(apiUrl);
	};

	const handleSelect = (style: DashboardMapStyle) => {
		if (mode === 'browse') {
			const mapLink = style.links.find((l) => l.rel === 'map')?.href;
			if (mapLink) {
				goto(mapLink);
			}
		} else {
			if (selectedId !== style.id) {
				if (onselect) onselect(style);
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
							<tr
								class="map-row {selected ? 'selected' : ''}"
								onclick={() => {
									handleSelect(style);
								}}
							>
								<td class="map-title map-col">
									{style.name}
								</td>
								<td class="map-col">
									{#if accessIcon}
										<span class="icon">
											<i class={accessIcon}></i>
										</span>
									{/if}
								</td>
								<td class="map-col">
									<Time timestamp={style.createdat} format="HH:mm, MM/DD/YYYY" />
								</td>
								<td class="map-col">{style.created_user}</td>
								<td class="map-col">
									{#if style.updated_user}
										<Time timestamp={style.updatedat} format="HH:mm, MM/DD/YYYY" />
									{/if}
								</td>
								<td class="map-col">
									{#if style.updated_user}
										{style.updated_user}
									{/if}
								</td>
								<td
									onclick={(e) => {
										e.stopPropagation();
									}}
								>
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
						<div class="column is-one-third-tablet is-one-quarter-desktop is-full-mobile">
							{#if mode === 'browse'}
								{@const mapLink = style.links.find((l) => l.rel === 'map')?.href}

								<CardWithImage
									title={style.name}
									url={mapLink}
									tag="Map"
									image={styleLink.replace('{width}', '298').replace('{height}', '180')}
									width={298}
									height={180}
									linkName={'Explore'}
									accent={accentColor}
									icon={accessIcon}
								/>
							{:else}
								<CardWithImage
									title={style.name}
									onclick={() => {
										handleSelect(style);
									}}
									url=""
									tag="Map"
									image={styleLink.replace('{width}', '298').replace('{height}', '180')}
									width={298}
									height={180}
									linkName={selectedId === style.id ? 'Selected' : 'Use this map'}
									accent={selectedId === style.id ? 'yellow' : 'blue'}
									icon={accessIcon}
								/>
							{/if}
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	{/key}

	{#if showMenu}
		<div class="pt-2">
			<Pagination
				totalPages={mapData.pages.totalPages}
				currentPage={mapData.pages.currentPage}
				hidden={mapData.pages.totalPages <= 1}
				onclick={(type: 'previous' | 'next') => {
					const url = mapData.links?.find((l) => l.rel === type)?.href;
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
