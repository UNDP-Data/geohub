<script lang="ts">
	import Header from '$components/header/Header.svelte';
	import { HEADER_HEIGHT_CONTEXT_KEY, createHeaderHeightStore } from '$stores';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { addProtocol } from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount, setContext } from 'svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
	let innerWidth = $state(0);

	const headerHeightStore = createHeaderHeightStore();
	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);
	});
</script>

<svelte:window bind:innerWidth />

<Header isPositionFixed={false} />

<div style="padding-top: {$headerHeightStore}px">
	{@render children?.()}
</div>

<SvelteToast />
