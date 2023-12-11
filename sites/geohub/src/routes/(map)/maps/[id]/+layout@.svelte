<script lang="ts">
	import Header from '$components/header/Header.svelte';
	import BackToTop from '$components/util/BackToTop.svelte';
	import { FooterItems } from '$lib/config/AppConfig';
	import { HEADER_HEIGHT_CONTEXT_KEY, createHeaderHeightStore } from '$stores';
	import { Footer } from '@undp-data/svelte-undp-design';
	import { setContext } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const headerHeightStore = createHeaderHeightStore();
	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

	let footerItems = FooterItems;

	if (!(data.session?.user?.is_superuser === true)) {
		if (footerItems['Management']) {
			delete footerItems['Management'];
		}
	}
</script>

<div class="header">
	<Header />
</div>

<div style="margin-top: {$headerHeightStore}px">
	<slot />
</div>

<Footer logoUrl="/assets/undp-images/undp-logo-white.svg" bind:footerItems />

<BackToTop />

<style global lang="scss">
	@import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';
	@import 'bulma-switch/dist/css/bulma-switch.min.css';
	@import 'bulma-divider/dist/css/bulma-divider.min.css';
	@import '/node_modules/flag-icons/css/flag-icons.min.css';
</style>
