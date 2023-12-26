<script lang="ts">
	import LineColor from '$components/maplibre/line/LineColor.svelte';
	import LineWidth from '$components/maplibre/line/LineWidth.svelte';
	import Legend from '$components/pages/map/layers/header/Legend.svelte';
	import { getLayerStyle, handleEnterKey } from '$lib/helper';
	import type { VectorTileMetadata } from '$lib/types';
	import {
		LEGEND_READONLY_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type LegendReadonlyStore,
		type MapStore
	} from '$stores';
	import { getContext, onMount } from 'svelte';

	const legendReadonly: LegendReadonlyStore = getContext(LEGEND_READONLY_CONTEXT_KEY);
	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;

	let tabs = [
		{
			label: 'color',
			icon: 'fa-solid fa-fill'
		},
		{
			label: 'width',
			icon: 'fa-solid fa-arrows-left-right-to-line fa-rotate-90'
		}
	];
	let activeTab: string = tabs[0].label;

	let layerStyle = getLayerStyle($map, layerId);
	let isSimpleLegend = true;

	onMount(() => {
		const color = $map.getPaintProperty(layerId, 'line-color');
		if (color && ['interval', 'categorical'].includes(color['type'])) {
			isSimpleLegend = false;
		} else if (color && Array.isArray(color) && ['match', 'step'].includes(color[0])) {
			isSimpleLegend = false;
		} else {
			isSimpleLegend = true;
		}
	});
</script>

{#if !$legendReadonly}
	<div class="tabs is-centered is-toggle">
		<ul>
			{#each tabs as tab}
				<li class={activeTab === tab.label ? 'is-active' : ''}>
					<!-- svelte-ignore a11y-missing-attribute -->
					<a
						class="has-text-weight-bold tab"
						role="tab"
						tabindex="0"
						data-sveltekit-preload-code="off"
						data-sveltekit-preload-data="off"
						on:click={() => {
							activeTab = tab.label;
						}}
						on:keydown={handleEnterKey}
					>
						<span class="icon is-small"><i class={tab.icon} aria-hidden="true"></i></span>
						<span class="is-capitalized">{tab.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>

	<div hidden={activeTab !== tabs[0].label}>
		<LineColor {layerId} {metadata} />
	</div>

	<div hidden={activeTab !== tabs[1].label}>
		<LineWidth {layerId} {metadata} />
	</div>
{:else if isSimpleLegend}
	<Legend layer={layerStyle} />
{:else}
	<LineColor {layerId} {metadata} />
{/if}
