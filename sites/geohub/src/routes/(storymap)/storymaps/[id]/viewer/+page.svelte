<script lang="ts">
	import { page } from '$app/stores';
	import { StoryMap } from '@undp-data/svelte-maplibre-storymap';
	import { BackToTop } from '@undp-data/svelte-undp-components';
	import { Footer } from '@undp-data/svelte-undp-design';
	import { addProtocol } from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let storyHeight = 0;

	$: footerPosition = storyHeight + 265;

	let showFooter = true;

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);

		const embed = $page.url.searchParams.get('embed');
		if (embed && embed.toLowerCase() === 'true') {
			showFooter = false;
		}
	});
</script>

<div bind:clientHeight={storyHeight}>
	<StoryMap bind:config={data.storymap} bind:template={data.storymap.template_id} />
</div>

{#if showFooter}
	<div class="undp-footer" style="top: {footerPosition}px;">
		<Footer logoUrl="/assets/undp-images/undp-logo-white.svg" bind:footerItems={data.footerLinks} />
	</div>
	<BackToTop top="24px" />
{/if}

<style lang="scss">
	.undp-footer {
		position: absolute;
		bottom: 0;
		width: 100%;
	}
</style>
