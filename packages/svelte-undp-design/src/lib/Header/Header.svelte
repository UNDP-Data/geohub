<script lang="ts">
	import type { HeaderLink } from '$lib/interfaces';
	import { onMount } from 'svelte';

	export let region: string;
	export let siteTitle: string;
	export let url = 'https://undp.org';
	export let logoUrl: string;
	export let height = 75;
	export let showProgressBar = false;
	export let isPositionFixed = true;
	export let links: HeaderLink[] = [];

	onMount(() => {
		window.matchMedia('(prefers-color-scheme: light)');
	});

	let showMobileMenu = false;
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
				{#if links.length > 0}
					<nav class="menu">
						<ul>
							{#each links as link}
								<li class="menu-item" data-menu-id={link.id}>
									{#if link.callback}
										{@const callback = link.callback}
										<a on:click={() => callback(link.id)} tabindex="0">
											{#if link.icon}
												<i class={link.icon} style="color:#006eb5" />
											{/if}
											{link.title}
										</a>
									{:else}
										<a href={link.href} tabindex="0">
											{#if link.icon}
												<i class={link.icon} style="color:#006eb5" />
											{/if}
											{link.title}
										</a>
									{/if}
								</li>
							{/each}
							<li data-menu-id="header-link-custom" class="custom-button-mega menu-item">
								<slot name="custom-button" />
							</li>
						</ul>
					</nav>
				{/if}
				<div class="cell large-3 small-3 top-right menu-buttons">
					<button
						class="menu-hamburger"
						aria-label="menu-icon"
						on:click={() => (showMobileMenu = !showMobileMenu)}
					>
						<span class="hamburger-line line-top" />
						<span class="hamburger-line line-middle" />
						<span class="hamburger-line line-bottom" />
						Nav toggle
					</button>
					<div class="custom-button"><slot name="custom-button" /></div>
				</div>
				{#if links.length > 0}
					<div class="mobile-nav {showMobileMenu ? 'show' : ''}">
						<div class="grid-x">
							<div class="cell mobile-links">
								<ul>
									{#each links as link}
										<li>
											{#if link.callback}
												{@const callback = link.callback}
												<a
													class="cta__link cta--space"
													on:click={() => callback(link.id)}
													id={link.id}
												>
													{#if link.icon}
														<i class={link.icon} style="color:#006eb5" />
													{/if}
													{link.title}
												</a>
											{:else}
												<a class="cta__link cta--space" href={link.href} id={link.id}>
													{#if link.icon}
														<i class={link.icon} style="color:#006eb5" />
													{/if}
													{link.title}
												</a>
											{/if}
										</li>
									{/each}
								</ul>
							</div>
						</div>
					</div>
				{/if}
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
	@use '../css/menu.min.css';
	@use '../css/mega-menu.min.css';
	@use '../css/mobile-nav.min.css';
	@use '../css/cta-link.min.css';
	// @import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';

	:global(.menu-buttons) {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.custom-button-mega {
		display: block;

		@media (max-width: 89.9375em) {
			display: none;
		}
	}

	.custom-button {
		display: none;

		@media (max-width: 89.9375em) {
			display: block;
		}
	}

	:global(.menu) {
		display: flex;
		align-items: center !important;
	}
</style>
