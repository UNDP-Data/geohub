<script lang="ts">
	import IconColor from '$components/maplibre/symbol/IconColor.svelte';
	import IconImage from '$components/maplibre/symbol/IconImage.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import { getVectorDefaultColor, handleEnterKey } from '$lib/helper';
	import type { VectorTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { getContext, onMount } from 'svelte';
	import IconSize from './IconSize.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let defaultColor: string = undefined;

	let tabs = [
		{
			label: 'icon',
			icon: 'fa-solid fa-icons'
		},
		{
			label: 'color',
			icon: 'fa-solid fa-fill'
		},
		{
			label: 'size',
			icon: 'fa-solid fa-maximize'
		}
	];
	let activeTab: string = tabs[0].label;

	onMount(() => {
		setDefaultColor();
	});

	$: activeTab, setDefaultColor();

	const setDefaultColor = () => {
		defaultColor = getVectorDefaultColor($map, layerId, 'icon-color');
	};
</script>

<div class="tabs is-centered is-toggle is-small">
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
	<FieldControl title="Icon">
		<div slot="help">Change icon for a vector layer.</div>
		<div slot="control">
			<IconImage {layerId} bind:defaultColor />
		</div>
	</FieldControl>
</div>

<div hidden={activeTab !== tabs[1].label}>
	<FieldControl title="Icon color">
		<div slot="help">Change icon color by using single color or selected property.</div>
		<div slot="control">
			<IconColor {layerId} {metadata} bind:defaultColor />
		</div>
	</FieldControl>
</div>

<div hidden={activeTab !== tabs[2].label}>
	<FieldControl title="Icon size">
		<div slot="help">Change icon color by using single color or selected property.</div>
		<div slot="control">
			<IconSize {layerId} {metadata} bind:defaultColor />
		</div>
	</FieldControl>
</div>
