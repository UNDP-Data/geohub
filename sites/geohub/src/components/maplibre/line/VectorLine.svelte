<script lang="ts">
	import LineColor from '$components/maplibre/line/LineColor.svelte';
	import LineWidth from '$components/maplibre/line/LineWidth.svelte';
	import { handleEnterKey } from '$lib/helper';
	import type { VectorTileMetadata } from '$lib/types';

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let defaultColor: string = undefined;

	let tabs = [
		{
			id: 'color',
			label: 'Line color'
		},
		{
			id: 'width',
			label: 'Line width'
		}
	];
	let activeTab: string = tabs[0].id;
</script>

<div class="tabs is-centered">
	<ul>
		{#each tabs as tab}
			<li class={activeTab === tab.id ? 'is-active' : ''}>
				<!-- svelte-ignore a11y-missing-attribute -->
				<a
					class="has-text-weight-bold"
					role="tab"
					tabindex="0"
					data-sveltekit-preload-code="off"
					data-sveltekit-preload-data="off"
					on:click={() => {
						activeTab = tab.id;
					}}
					on:keydown={handleEnterKey}
				>
					{tab.label}
				</a>
			</li>
		{/each}
	</ul>
</div>

<div hidden={activeTab !== tabs[0].id}>
	<LineColor {layerId} bind:defaultColor {metadata} />
</div>

<div hidden={activeTab !== tabs[1].id}>
	<LineWidth {layerId} {metadata} bind:defaultColor />
</div>
