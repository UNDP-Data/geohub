<script lang="ts">
	import BackToTop from '$components/util/BackToTop.svelte';
	import Header from '$components/header/Header.svelte';
	import { FooterItems } from '$lib/config/AppConfig';
	import { Footer } from '@undp-data/svelte-undp-design';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import type { PageData } from './$types';

	export let data: PageData;

	let headerHeight = writable<number>(115);

	setContext('headerHeight', headerHeight);

	let footerItems = FooterItems;

	if (!(data.session?.user?.is_superuser === true)) {
		if (footerItems['Management']) {
			delete footerItems['Management'];
		}
	}
</script>

<div class="header">
	<Header bind:headerHeight={$headerHeight} />
</div>

<div style="margin-top: {$headerHeight}px">
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
