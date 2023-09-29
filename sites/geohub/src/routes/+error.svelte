<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$components/Header.svelte';
	import { FooterItems } from '$lib/config/AppConfig';
	import { Footer } from '@undp-data/svelte-undp-design';

	let headerHeight: number;

	let footerItems = FooterItems;
	if (!($page.data.session?.user?.is_superuser === true)) {
		if (footerItems['Management']) {
			delete footerItems['Management'];
		}
	}
</script>

<div class="header">
	<Header bind:headerHeight />
</div>

<div style="margin-top: {headerHeight}px">
	<div class="p-4">
		<h1 class="title">Whoops!</h1>

		<h2 class="subtitle">{$page.status}: {$page.error.message}</h2>

		{#if !$page.data.session && $page.status === 403}
			<p class="subtitle is-5">Please sign in to GeoHub first.</p>
		{/if}

		<p class="subtitle is-5">Please contact administrator.</p>
	</div>
</div>

<Footer logoUrl="/assets/undp-images/undp-logo-white.svg" bind:footerItems />
