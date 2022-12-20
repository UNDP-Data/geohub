<script lang="ts">
	import { onMount } from 'svelte';

	export let region: string;
	export let siteTitle: string;
	export let url = 'https://undp.org';
	export let logoUrl: string;
	export let height = 75;
	export let showProgressBar = false;
	export let isPositionFixed = true;

	onMount(() => {
		window.matchMedia('(prefers-color-scheme: light)');
	});
</script>

<header
	class="country-header"
	style="position: {isPositionFixed ? 'fixed' : 'relative'}!important;"
>
	<section
		class="header"
		style="position: {isPositionFixed ? 'fixed' : 'relative'}!important;"
		bind:clientHeight={height}
	>
		<div class="grid-container fluid">
			<div class="grid-x grid-margin-x align-content-middle">
				<div class="cell large-9 small-9 align-self-middle top-left">
					<a href={url} target="_blank" rel="noreferrer" class="logo" tabindex="0">
						<img src={logoUrl} alt="logoUrl" />
					</a>
					<div class="site-title">
						<span>{region}</span>
						<span>{siteTitle}</span>
					</div>
				</div>
				<div class="cell large-3 small-3 top-right">
					<slot name="menu-buttons" />
				</div>
			</div>
		</div>
		{#if showProgressBar}
			<progress class="progress is-small is-info" max="100" />
		{/if}
	</section>
</header>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/country-site-header.min.css';
	@use 'bulma/css/bulma.css';
</style>
