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
			label: 'color',
			icon: 'fa-solid fa-fill'
		},
		{
			label: 'width',
			icon: 'fa-solid fa-grip-lines'
		}
	];
	let activeTab: string = tabs[0].label;
</script>

<div class="tabs is-centered">
	<ul>
		{#each tabs as tab}
			<li class={activeTab === tab.label ? 'is-active' : ''}>
				<!-- svelte-ignore a11y-missing-attribute -->
				<a
					class="has-text-weight-bold"
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
	<LineColor {layerId} bind:defaultColor {metadata} />
</div>

<div hidden={activeTab !== tabs[1].label}>
	<LineWidth {layerId} {metadata} bind:defaultColor />
</div>
