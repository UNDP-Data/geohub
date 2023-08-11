<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from '../$types';
	import UserAccount from '$components/UserAccount.svelte';
	import { FooterItems, HeaderItems } from '$lib/config/AppConfig';
	import { Footer, Header, type HeaderLink } from '@undp-data/svelte-undp-design';

	export let data: PageData;

	let links: HeaderLink[] = HeaderItems(['home', 'data', 'map', 'userguide']);

	if (!data.session) {
		links = [...links.filter((l) => l.href !== '/data')];
	}
</script>

<Header
	region="UNDP's one stop shop for spatial data and analytics"
	siteTitle="GeoHub"
	url="https://geohub.data.undp.org"
	logoUrl="assets/undp-images/undp-logo-blue.svg"
	isPositionFixed={false}
	bind:links
>
	<div slot="custom-button">
		<UserAccount />
	</div>
</Header>

<div class="container mt-6 m-4">
	<p class="title is-4">Whoops! Something wrong!</p>
	<p class="subtitle is-5 has-text-justified pt-4">{$page.error.message}</p>
	<p class="subtitle is-5 has-text-justified">Please contact administrator.</p>
</div>

<Footer logoUrl="assets/undp-images/undp-logo-white.svg" footerItems={FooterItems} />
