<script lang="ts">
	import Header from '$components/header/Header.svelte';
	import { HEADER_HEIGHT_CONTEXT_KEY, createHeaderHeightStore } from '$stores';
	import { BackToTop } from '@undp-data/svelte-undp-components';
	import { Footer } from '@undp-data/svelte-undp-design';
	import { setContext, type Snippet } from 'svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
		children?: Snippet;
	}

	let { data = $bindable(), children }: Props = $props();

	let innerWidth = $state(0);

	let backToTopPosition = $derived(innerWidth >= 1023 ? '130px' : '90px');

	const headerHeightStore = createHeaderHeightStore();
	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);
</script>

<svelte:window bind:innerWidth />

<div class="header">
	<Header />
</div>

<div style="margin-top: {$headerHeightStore}px">
	{@render children?.()}
</div>

<Footer logoUrl="/assets/undp-images/undp-logo-white.svg" footerItems={data.footerLinks} />

<BackToTop top={backToTopPosition} />

<style global lang="scss">
	@import 'bulma-divider/dist/css/bulma-divider.min.css';
	@import 'flag-icons/css/flag-icons.min.css';
</style>
