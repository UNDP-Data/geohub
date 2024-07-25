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
	import type { DashboardMapStyle } from '$lib/types';
	import {
		FieldControl,
		initTooltipTippy,
		ModalTemplate,
		Tabs,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import type { StyleSpecification } from 'maplibre-gl';
	import { createEventDispatcher, onMount } from 'svelte';
	import GeoHubMapSelector from './GeoHubMapSelector.svelte';

	const tippyTooltip = initTooltipTippy();

	const dispatch = createEventDispatcher();

	export let mapConfig: StorymapBaseMapConfig = {};

	let tabs: Tab[] = [
		{ id: 'base_style_id', label: 'base map' },
		{ id: 'style_id', label: 'geoHub map' }
	];
	let activeTab: string = mapConfig?.style_id ? tabs[1].id : tabs[0].id;

	let showMapDialog = false;

	$: mapStyleId = mapConfig?.style_id ?? '';

	const handleBaseStyleChanged = (e: { title: string; uri: string }) => {
		mapConfig.base_style_id = e.title;
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
		showMapDialog = false;
	};

	onMount(() => {
		if (!mapStyleId) {
			if (mapConfig?.style_id) {
				mapStyleId = `${mapConfig?.style_id}`;
			}
		}
	});
</script>

<Tabs
	bind:tabs
	bind:activeTab
	isBoxed={false}
	isCentered={false}
	isUppercase={true}
	fontWeight="semibold"
/>

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
	<FieldControl title="GeoHub map ID" showHelp={false}>
		<div slot="control">
			<div class="is-flex">
				<input
					class="input"
					type="text"
					bind:value={mapStyleId}
					placeholder="Select a map"
					readonly
				/>
				<button class="button search-button" on:click={handleSearchClicked}>
					<span class="icon is-small">
						<span class="material-symbols-outlined"> search </span>
					</span>
				</button>
			</div>
		</div>
	</FieldControl>
</div>

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

	.search-button {
		border-color: black;
		border-left: none;
	}
</style>
