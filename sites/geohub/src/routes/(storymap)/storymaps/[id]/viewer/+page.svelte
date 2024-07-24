<script lang="ts">
	import { StoryMap } from '@undp-data/svelte-maplibre-storymap';
	import { BackToTop } from '@undp-data/svelte-undp-components';
	import { Footer } from '@undp-data/svelte-undp-design';
	import { addProtocol } from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let storyHeight = 0;

	$: footerPosition = storyHeight + 24;

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);
	});
</script>

<div bind:clientHeight={storyHeight}>
	<StoryMap bind:config={data.storymap} bind:template={data.storymap.template_id} />
</div>

<div class="undp-footer" style="top: {footerPosition}px;">
	<Footer logoUrl="/assets/undp-images/undp-logo-white.svg" bind:footerItems={data.footerLinks} />
</div>

<BackToTop top="24px" />

<style lang="scss">
	.undp-footer {
		position: absolute;
		width: 100%;
	}
</style>
