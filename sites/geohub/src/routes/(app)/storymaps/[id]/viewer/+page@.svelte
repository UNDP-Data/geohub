<script lang="ts">
	import { page } from '$app/state';
	import Header from '$components/header/Header.svelte';
	import { createHeaderHeightStore, HEADER_HEIGHT_CONTEXT_KEY } from '$stores';
	import { StoryMap } from '@undp-data/svelte-maplibre-storymap';
	import { BackToTop } from '@undp-data/svelte-undp-components';
	import { Footer } from '@undp-data/svelte-undp-design';
	import { addProtocol } from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount, setContext } from 'svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data = $bindable() }: Props = $props();

	const headerHeightStore = createHeaderHeightStore();
	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

	const embed = page.url.searchParams.get('embed');
	let showHeaderFooter = !(embed && embed.toLowerCase() === 'true');

	let innerWidth = $state(0);
	let backToTopPosition = $derived(innerWidth >= 1023 ? '130px' : '90px');

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
	config={data.storymap}
	template={data.storymap.template_id}
	bind:marginTop={$headerHeightStore}
>
	{#snippet footer()}
		<div>
			{#if showHeaderFooter}
				<Footer logoUrl="/assets/undp-images/undp-logo-white.svg" footerItems={data.footerLinks} />
				<BackToTop top={backToTopPosition} />
			{/if}
		</div>
	{/snippet}
</StoryMap>
