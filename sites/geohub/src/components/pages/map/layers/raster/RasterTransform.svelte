<script lang="ts">
	import RasterTransformAdvanced from '$components/pages/map/layers/raster/RasterTransformAdvanced.svelte';
	import RasterTransformSimple from '$components/pages/map/layers/raster/RasterTransformSimple.svelte';
	import { handleEnterKey } from '$lib/helper';
	import type { Layer } from '$lib/types';

	export let layer: Layer;

	let activeTab = 'Simple';
	let isAdvancedPanelVisible = false;
	let isSimplePanelVisible = false;

	$: {
		isAdvancedPanelVisible = false;
		isSimplePanelVisible = false;

		switch (activeTab) {
			case 'Advanced':
				isAdvancedPanelVisible = true;
				isSimplePanelVisible = false;
				break;
			case 'Simple':
				isSimplePanelVisible = true;
				isAdvancedPanelVisible = false;
				break;

			default:
				break;
		}
	}

	let tabs = [
		{ label: 'Simple', icon: 'fa-solid fa-thumbs-up' },
		{ label: 'Advanced', icon: 'fa-solid fa-magnifying-glass-plus' }
	];
</script>

<nav class="block">
	<div class="tabs is-centered is-toggle">
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

	<div class="block" />
	<p>
		{#if isSimplePanelVisible === true}
			<RasterTransformSimple bind:layer />
		{/if}
		{#if isAdvancedPanelVisible}
			<RasterTransformAdvanced bind:layer />
		{/if}
	</p>
</nav>
