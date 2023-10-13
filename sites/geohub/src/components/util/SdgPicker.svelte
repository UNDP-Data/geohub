<script lang="ts">
	import { initTippy } from '$lib/helper';
	import type { Tag } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import SdgCard from './SdgCard.svelte';

	const dispatch = createEventDispatcher();

	const tippy = initTippy();
	let tooltipContent: HTMLElement;

	const BASE_ASSEST_URL = '/assets/sdgs';
	const TAG_KEY = 'sdg_goal';
	let sdgs = [...Array(17)].map((v, i) => i + 1);
	export let tags: Tag[] = [];
	export let size: 'small' | 'medium' = 'medium';
	export let showSelectionOnButton = true;

	let selectedSDGs: { [key: number]: boolean } = {};
	// $: selectedSDGs, updateTags()

	const initSelectedSDGs = () => {
		if (tags.length === 0) {
			selectedSDGs = {};
		} else {
			Object.keys(selectedSDGs).forEach((key) => {
				if (!tags.find((t) => `${t.value}` === `${key}`)) {
					delete selectedSDGs[key];
				}
			});
			tags?.forEach((t) => {
				selectedSDGs[Number(t.value)] = true;
			});
		}
	};
	initSelectedSDGs();

	$: tags, initSelectedSDGs();

	const handleSDGSelected = (e) => {
		const sdg = e.detail.sdg;
		const isSelected = e.detail.isSelected;

		selectedSDGs[sdg] = isSelected;

		const index = tags.findIndex((t) => t.value === `${sdg}`);
		if (isSelected) {
			if (index === -1) {
				tags.push({
					key: TAG_KEY,
					value: `${sdg}`
				});
				tags = [...tags];
			}
		} else {
			if (index > -1) {
				tags.splice(index, 1);
				tags = [...tags];
			}
		}

		dispatch('change', {
			tags
		});
	};
</script>

<div class="sdgs-select-button" use:tippy={{ content: tooltipContent }}>
	<div class="box p-1">
		{#if showSelectionOnButton && Object.keys(selectedSDGs).filter((sdg) => selectedSDGs[sdg] === true).length > 0}
			<div class="is-flex is-flex-direction-row is-flex-wrap-wrap">
				{#each Object.keys(selectedSDGs).filter((sdg) => selectedSDGs[sdg] === true) as sdg}
					<SdgCard sdg={Number(sdg)} isSelectable={false} />
				{/each}
			</div>
		{:else}
			<figure
				class={`image ${size === 'medium' ? 'is-48x48' : 'is-24x24'}`}
				data-testid="icon-figure"
			>
				<img
					src="{BASE_ASSEST_URL}/SDG Wheel_WEB.png"
					alt="SDG Wheel_WEB.png"
					title="SDG Wheel_WEB.png"
				/>
			</figure>
		{/if}
	</div>
</div>

<div class="tooltip p-2" data-testid="tooltip" bind:this={tooltipContent}>
	<div class="grid">
		{#each sdgs as sdg}
			<SdgCard
				bind:sdg
				isSelected={selectedSDGs[sdg] && selectedSDGs[sdg] === true ? true : false}
				on:sdgSelected={handleSDGSelected}
			/>
		{/each}
	</div>
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

	.sdgs-select-button {
		width: fit-content;
		cursor: pointer;
	}

	.tooltip {
		max-height: 250px;
		overflow-y: auto;

		.grid {
			display: grid;
			grid-gap: 5px;
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
