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

	const embed = $page.url.searchParams.get('embed');
	let showHeaderFooter = !(embed && embed.toLowerCase() === 'true');

	let innerWidth = 0;
	$: backToTopPosition = innerWidth >= 1023 ? '130px' : '90px';

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);
	});
</script>

<svelte:window bind:innerWidth />

{#if showHeaderFooter}
	<Header isPositionFixed={true} />
{/if}

<StoryMap
	bind:config={data.storymap}
	bind:template={data.storymap.template_id}
	bind:marginTop={$headerHeightStore}
>
	<div slot="footer">
		{#if showHeaderFooter}
			<Footer
				logoUrl="/assets/undp-images/undp-logo-white.svg"
				bind:footerItems={data.footerLinks}
			/>
			<BackToTop bind:top={backToTopPosition} />
		{/if}
	</div>
</StoryMap>
