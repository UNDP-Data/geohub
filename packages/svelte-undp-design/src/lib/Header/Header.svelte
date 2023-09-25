<script lang="ts">
	import type { HeaderLink } from '$lib/interfaces';

	export let region: string;
	export let siteTitle: string;
	export let url = 'https://undp.org';
	export let logoUrl: string;
	export let height = 75;
	export let showProgressBar = false;
	export let isPositionFixed = true;
	export let links: HeaderLink[] = [];
	export let progressBarSize: 'xsmall' | 'small' | 'medium' | 'large' = 'xsmall';

	export let showMobileMenu = false;

	const onKeyPressed = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			e.target.click();
		}
	};
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
				<div class="cell small-8 large-2 shrink align-self-middle top-left">
					<a href={url} rel="noreferrer" class="logo" tabindex="0">
						<img src={logoUrl} alt="logoUrl" />
					</a>
					<div class="site-title">
						<span>{region}</span>
						<span>{siteTitle}</span>
					</div>
				</div>
				{#if links.length > 0}
					<div class="cell small-1 large-auto align-content-middle top-center">
						<nav class="menu">
							<ul class="">
								{#each links as link}
									{#if window && window.location.pathname !== link.href}
										<li data-menu-id={link.id}>
											{#if link.callback}
												{@const callback = link.callback}
												<!-- svelte-ignore a11y-missing-attribute -->
												<a
													role="button"
													on:click={() => callback(link.id)}
													tabindex="0"
													on:keydown={onKeyPressed}
												>
													{link.title}
												</a>
											{:else}
												<a
													role="button"
													href={link.href}
													tabindex="0"
													data-sveltekit-preload-code={link.preloadCode ?? 'off'}
													data-sveltekit-preload-data={link.preloadData ?? 'off'}
												>
													{link.title}
												</a>
											{/if}
										</li>
									{/if}
								{/each}
							</ul>
						</nav>
					</div>
				{/if}
				<div class="cell small-3 large-auto top-right">
					<button
						class="menu-hamburger {showMobileMenu ? 'is-active' : ''}"
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
										{#if window && window.location.pathname !== link.href}
											<li>
												{#if link.callback}
													{@const callback = link.callback}
													<div
														role="button"
														tabindex="0"
														class="cta__link cta--space"
														on:click={() => {
															showMobileMenu = false;
															callback(link.id);
														}}
														on:keydown={onKeyPressed}
														id={link.id}
													>
														{link.title}
														{#if link.tooltip}
															- {link.tooltip}
														{/if}
													</div>
												{:else}
													<a
														class="cta__link cta--space"
														role="button"
														id={link.id}
														href={link.href}
														tabindex="0"
														data-sveltekit-preload-code={link.preloadCode ?? 'off'}
														data-sveltekit-preload-data={link.preloadData ?? 'off'}
													>
														{link.title}
														{#if link.tooltip}
															- {link.tooltip}
														{/if}
													</a>
												{/if}
											</li>
										{/if}
									{/each}
								</ul>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
		{#if showProgressBar}
			<progress
				style="height:0.2rem!important;"
				class="progress is-{progressBarSize} is-info"
				max="100"
			/>
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

	.custom-button {
		display: block;
		cursor: pointer;
		margin-left: 0.75rem !important;
	}

	@media (max-width: 48em) {
		:global(.country-header .header .site-title span:first-of-type:not(:last-of-type)) {
			max-width: 140px;
		}
	}
</style>
