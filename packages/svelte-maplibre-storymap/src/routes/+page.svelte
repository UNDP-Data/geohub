<script lang="ts">
	import { StoryMap, type StoryMapTemplate } from '$lib/index.js';
	import type { PageData } from './$types.js';

	export let data: PageData;

	let cssMode: StoryMapTemplate = 'dark';
	let cssModes: { id: StoryMapTemplate; label: string }[] = [
		{ id: 'light', label: 'Light' },
		{ id: 'dark', label: 'Dark' }
	];
</script>

<StoryMap bind:config={data.config} bind:template={cssMode} />

<div class="overlay">
	<div class="buttons has-addons">
		{#each cssModes as mode}
			<label class="radio">
				<input type="radio" name="cssmode" value={mode.id} bind:group={cssMode} />
				{mode.label}
			</label>
		{/each}
	</div>
</div>

<style lang="scss">
	/** Test with bulma to make sure no conflicts of style */
	@import 'https://cdn.jsdelivr.net/npm/bulma@1.0.1/css/bulma.min.css';
	.overlay {
		position: fixed;
		top: 5px;
		left: 5px;
		padding: 0.5rem;
		background-color: rgba(255, 255, 255, 0.75);
	}
</style>
