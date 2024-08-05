<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$components/header/Header.svelte';
	import { createHeaderHeightStore, HEADER_HEIGHT_CONTEXT_KEY } from '$stores';
	import { StoryMap } from '@undp-data/svelte-maplibre-storymap';
	import { BackToTop } from '@undp-data/svelte-undp-components';
	import { Footer } from '@undp-data/svelte-undp-design';
	import { addProtocol } from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount, setContext } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const headerHeightStore = createHeaderHeightStore();
	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

	let innerWidth = 0;
	let storyHeight = 0;

	$: footerPosition = storyHeight + (innerWidth > 750 ? 265 : 75);

	let showHeaderFooter = true;

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);

		const embed = $page.url.searchParams.get('embed');
		if (embed && embed.toLowerCase() === 'true') {
			showHeaderFooter = false;
		}
	});
</script>

<svelte:window bind:innerWidth />

{#if showHeaderFooter}
	<div class="header">
		<Header isPositionFixed={true} />
	</div>
{/if}

<div bind:clientHeight={storyHeight}>
	<StoryMap
		bind:config={data.storymap}
		bind:template={data.storymap.template_id}
		bind:marginTop={$headerHeightStore}
	/>
</div>

{#if showHeaderFooter}
	<div class="undp-footer" style="top: {footerPosition}px;">
		<Footer logoUrl="/assets/undp-images/undp-logo-white.svg" bind:footerItems={data.footerLinks} />
	</div>
	<BackToTop top="24px" />
{/if}

<style lang="scss">
	.undp-footer {
		position: absolute;
		width: 100%;
	}
</style>
