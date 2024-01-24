<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$components/header/Header.svelte';
	import { FooterItems } from '$lib/config/AppConfig';
	import { HEADER_HEIGHT_CONTEXT_KEY, createHeaderHeightStore } from '$stores';
	import { Footer } from '@undp-data/svelte-undp-design';
	import { setContext } from 'svelte';

	const headerHeightStore = createHeaderHeightStore();
	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

	let footerItems = FooterItems;
	if (!($page.data.session?.user?.is_superuser === true)) {
		if (footerItems['Management']) {
			delete footerItems['Management'];
		}
	}
</script>

<div class="header">
	<Header />
</div>

<section class="hero is-halfheight is-bold">
	<div class="hero-body">
		<div class="container ml-0 has-text-aligned-left">
			<h1 class="title">Whoops!</h1>

			<h2 class="subtitle">{$page.status}: {$page.error.message}</h2>

			{#if !$page.data.session && $page.status === 403}
				<p class="subtitle is-5">Please sign in to GeoHub first.</p>
			{/if}

			<p class="subtitle is-5">Please contact administrator.</p>
		</div>
	</div>
</section>

<Footer logoUrl="/assets/undp-images/undp-logo-white.svg" bind:footerItems />
