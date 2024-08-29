<script lang="ts" context="module">
	export interface StorymapBaseMapConfig {
		base_style_id?: string;
		style?: string | StyleSpecification;
		style_id?: number;
	}
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import { MapStyles } from '$lib/config/AppConfig';
	import { getMapImageFromStyle } from '$lib/helper';
	import type { DashboardMapStyle } from '$lib/types';
	import {
		FieldControl,
		initTooltipTippy,
		ModalTemplate,
		SegmentButtons,
		type SegmentButton
	} from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import type { StyleSpecification } from 'maplibre-gl';
	import { createEventDispatcher, onMount } from 'svelte';
	import GeoHubMapSelector from './GeoHubMapSelector.svelte';

	const tippyTooltip = initTooltipTippy();

	const dispatch = createEventDispatcher();

	export let mapConfig: StorymapBaseMapConfig = {};

	let buttons: SegmentButton[] = [
		{ value: 'base_style_id', title: 'Empty Map' },
		{ value: 'style_id', title: 'GeoHub Map' }
	];
	let activeTab: string = (mapConfig?.style_id ? buttons[1].value : buttons[0].value) as string;

	let showMapDialog = false;

	let mapImageSize = [128, 64];
	let mapImageData = '';

	$: mapStyleId = mapConfig?.style_id ?? '';

	const handleBaseStyleChanged = (e: { title: string; uri: string }) => {
		mapConfig.base_style_id = e.title.toLowerCase();
		mapConfig.style = new URL(e.uri, $page.url).href;
		mapConfig.style_id = undefined;
		dispatch('change', mapConfig);
	};

	const handleSearchClicked = () => {
		showMapDialog = true;
	};

	const handleSelectMap = (e: { detail: { style: DashboardMapStyle } }) => {
		const style: DashboardMapStyle = e.detail.style;
		mapStyleId = style.id;

		const mapLink = style.links.find((l) => l.rel === 'stylejson');

		mapConfig.base_style_id = undefined;
		mapConfig.style = mapLink.href;
		mapConfig.style_id = Number(mapStyleId);
		dispatch('change', mapConfig);
		getGeoHubMapImageUrl();
		showMapDialog = false;
	};

	onMount(() => {
		if (!mapStyleId) {
			if (mapConfig?.style_id) {
				mapStyleId = `${mapConfig?.style_id}`;
			}
		} else {
			getGeoHubMapImageUrl();
		}
	});

	const getGeoHubMapImageUrl = async () => {
		if (!mapStyleId) return;
		mapImageData = '';
		const styleUrl = `/api/style/${mapStyleId}.json`;
		const res = await fetch(styleUrl);
		const style: StyleSpecification = await res.json();
		mapImageData = await getMapImageFromStyle(
			style,
			mapImageSize[0],
			mapImageSize[1],
			$page.data.staticApiUrl
		);
	};
</script>

<FieldControl title="Select Map Layer" showHelp={false}>
	<div slot="control">
		<SegmentButtons bind:buttons bind:selected={activeTab} capitalized={true} />
	</div>
</FieldControl>

<FieldControl
	title={activeTab === 'base_style_id' ? 'Choose map style' : 'Choose a map from GeoHub'}
	showHelp={false}
>
	<div slot="control">
		<div class="basemap-style-selector" hidden={activeTab !== 'base_style_id'}>
			{#each MapStyles as style}
				<label
					class="m-1"
					use:tippyTooltip={{
						content: `Use ${style.title === 'Carto' ? 'Standard' : style.title} style as default.`
					}}
				>
					<input
						on:click={() => {
							handleBaseStyleChanged(style);
						}}
						type="radio"
						name="DefaultMapStyle"
						value={style.title}
						checked={mapConfig.base_style_id?.toLowerCase() === style.title.toLowerCase()}
					/>
					<img
						class="sidebar-image"
						src={style.image}
						alt="{style.title} style"
						width="64"
						height="64"
						loading="lazy"
					/>
				</label>
			{/each}
		</div>

		<div hidden={activeTab !== 'style_id'}>
			<div class="columns mt-2 px-2">
				<div class="column p-0">
					<button
						class="geohubmap-button button has-text-weight-bold has-background-white-ter is-uppercase is-fullwidth py-3"
						on:click={handleSearchClicked}
					>
						geohub map catalog
					</button>
				</div>
				{#if mapStyleId}
					<div class="column p-0 ml-2">
						{#if mapImageData}
							<img
								src={mapImageData}
								alt="map preview"
								loading="lazy"
								width={mapImageSize[0]}
								height={mapImageSize[1]}
								use:tippyTooltip={{
									content: `This is current GeoHub map selected. To select another map, click GEOHUB MAP CATALOG button`
								}}
							/>
						{:else}
							<div class="is-flex is-justify-content-center mt-2">
								<Loader size="small" />
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<input
				class="input"
				type="hidden"
				bind:value={mapStyleId}
				placeholder="Select a map"
				readonly
			/>
		</div>
	</div>
</FieldControl>

{#if showMapDialog}
	<ModalTemplate title="Select a map from GeoHub" width="100%" bind:show={showMapDialog}>
		<div slot="content">
			<GeoHubMapSelector bind:id={mapStyleId} on:select={handleSelectMap} />
		</div>
	</ModalTemplate>
{/if}

<style lang="scss">
	.basemap-style-selector {
		[type='radio'] {
			position: absolute;
			opacity: 0;
			width: 0;
			height: 0;
		}

		[type='radio'] + img {
			cursor: pointer;
		}

		[type='radio']:checked + img {
			outline: 2px solid #f00;
		}

		.sidebar-image {
			box-shadow: #0a0a0a 0 0 2px 0;
		}
	}

	.geohubmap-button {
		border: none;
	}
</style>
