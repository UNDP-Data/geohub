<script lang="ts">
	import IconColor from '$components/maplibre/symbol/IconColor.svelte';
	import IconImage from '$components/maplibre/symbol/IconImage.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import { handleEnterKey } from '$lib/helper';
	import type { VectorTileMetadata } from '$lib/types';
	import IconSize from './IconSize.svelte';

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let defaultColor: string = undefined;

	let tabs = [
		{
			id: 'icon',
			label: 'Icon'
		},
		{
			id: 'color',
			label: 'Color'
		},
		{
			id: 'size',
			label: 'Size'
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
	<FieldControl title="Icon">
		<div slot="help">Change icon for a vector layer.</div>
		<div slot="control">
			<IconImage {layerId} bind:defaultColor />
		</div>
	</FieldControl>
</div>

<div hidden={activeTab !== tabs[1].id}>
	<FieldControl title="Icon color">
		<div slot="help">Change icon color by using single color or selected property.</div>
		<div slot="control">
			<IconColor {layerId} {metadata} bind:defaultColor />
		</div>
	</FieldControl>
</div>

<div hidden={activeTab !== tabs[2].id}>
	<FieldControl title="Icon size">
		<div slot="help">Change icon color by using single color or selected property.</div>
		<div slot="control">
			<IconSize {layerId} />
		</div>
	</FieldControl>
</div>
