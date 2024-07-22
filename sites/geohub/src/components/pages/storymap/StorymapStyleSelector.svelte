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
	import { initTooltipTippy, Tabs, type Tab } from '@undp-data/svelte-undp-components';
	import type { StyleSpecification } from 'maplibre-gl';
	import { createEventDispatcher } from 'svelte';

	const tippyTooltip = initTooltipTippy();

	const dispatch = createEventDispatcher();

	export let mapConfig: StorymapBaseMapConfig = {};

	let tabs: Tab[] = [
		{ id: 'base_style_id', label: 'from base map' },
		{ id: 'style_id', label: 'from geoHub map' }
	];
	let activeTab: string = tabs[0].id;

	const handleBaseStyleChanged = (e: { title: string; uri: string }) => {
		mapConfig.base_style_id = e.title;
		mapConfig.style = new URL(e.uri, $page.url).href;
		mapConfig.style_id = undefined;

		dispatch('change', mapConfig);
	};
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
	{#if mapConfig.base_style_id}
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
					checked={mapConfig.base_style_id.toLowerCase() === style.title.toLowerCase()}
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
	{/if}
</div>

<div hidden={activeTab !== 'style_id'}>coming soon</div>

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
</style>
