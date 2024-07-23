<script lang="ts">
	import { StoryMap } from '@undp-data/svelte-maplibre-storymap';
	import { Footer } from '@undp-data/svelte-undp-design';
	import type { PageData } from './$types';

	export let data: PageData;

	let storyHeight = 0;

	$: footerPosition = storyHeight + 24;
</script>

<div bind:clientHeight={storyHeight}>
	<StoryMap bind:config={data.storymap} bind:template={data.storymap.template_id} />
</div>

<div class="undp-footer" style="top: {footerPosition}px;">
	<Footer logoUrl="/assets/undp-images/undp-logo-white.svg" bind:footerItems={data.footerLinks} />
</div>

<style lang="scss">
	.undp-footer {
		position: absolute;
	}
</style>
