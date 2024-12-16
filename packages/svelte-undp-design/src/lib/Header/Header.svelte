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
	export let regionUrl = '';
	export let showMobileMenu = false;
	export let actionMenu:
		| {
				title: string;
				placeholder: string;
				showLanguageIcon: boolean;
				links: HeaderLink[];
		  }
		| undefined = undefined;

	let showActionMenu = false;
	let showActionMobileMenu = false;

	const onKeyPressed = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			e.target.click();
		}
	};

	let isMobileSubMenuShown = false;
	let submenuLink: HeaderLink | undefined = undefined;

	const showMobileSubMenu = (link: HeaderLink) => {
		submenuLink = link;
		isMobileSubMenuShown = true;
	};
	const hideMobileSubMenu = () => {
		submenuLink = undefined;
		isMobileSubMenuShown = false;
	};

	const hideActionMobileMenu = () => {
		hideMobileSubMenu();
		showActionMobileMenu = false;
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
						<span>
							{#if regionUrl}
								<a href={regionUrl}>{region}</a>
							{:else}
								{region}
							{/if}
						</span>
						<span><a href={url}>{siteTitle}</a></span>
					</div>
				</div>
				{#if links.length > 0}
					<div class="cell small-1 large-auto align-content-middle top-center">
						<nav class="menu">
							<ul class="">
								{#each links as link, index}
									{@const isLast = links.length > 1 && links.length - 1 === index}
									{#if link.children && link.children.length > 0}
										<li class="has-submenu">
											{#if link.href && link.href.length > 0}
												<a tabindex="0" aria-expanded="true" href={link.href}>
													{link.title}
												</a>
											{:else}
												<!-- svelte-ignore a11y-click-events-have-key-events -->
												<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
												<!-- svelte-ignore a11y-no-static-element-interactions -->
												<!-- svelte-ignore a11y-missing-attribute -->
												<a
													tabindex="0"
													aria-expanded="true"
													on:click={(e) => {
														e.preventDefault();
													}}
												>
													{link.title}
												</a>
											{/if}
											<ul class="submenu" data-submenu="true">
												{#each link.children as child}
													{#if child.children && child.children.length > 0}
														<li class="has-submenu {isLast ? 'edge' : ''}">
															{#if child.callback}
																{@const callback = child.callback}
																<!-- svelte-ignore a11y-missing-attribute -->
																<a
																	role="button"
																	on:click={() => callback(child.id)}
																	tabindex="0"
																	on:keydown={onKeyPressed}
																>
																	{child.title}
																</a>
															{:else}
																<a href={child.href} class="" tabindex="0">
																	{child.title}
																</a>
															{/if}
															<ul class="submenu" data-submenu="true">
																{#each child.children as grandchild}
																	<li class="">
																		{#if grandchild.callback}
																			{@const callback = grandchild.callback}
																			<!-- svelte-ignore a11y-missing-attribute -->
																			<a
																				role="button"
																				on:click={() => callback(grandchild.id)}
																				tabindex="0"
																				on:keydown={onKeyPressed}
																				class={grandchild.linkType}
																			>
																				{grandchild.title}
																				{#if grandchild.linkType === 'download'}
																					<span class="download-animated"><i></i></span>
																				{:else if grandchild.linkType === 'external'}
																					<span class="external-link-animated"><i></i></span>
																				{/if}
																			</a>
																		{:else}
																			<a
																				href={grandchild.href}
																				class={grandchild.linkType}
																				tabindex="0"
																			>
																				{grandchild.title}
																				{#if grandchild.linkType === 'download'}
																					<span class="download-animated"><i></i></span>
																				{:else if grandchild.linkType === 'external'}
																					<span class="external-link-animated"><i></i></span>
																				{/if}
																			</a>
																		{/if}
																	</li>
																{/each}
															</ul>
														</li>
													{:else}
														<li class="">
															{#if child.callback}
																{@const callback = child.callback}
																<!-- svelte-ignore a11y-missing-attribute -->
																<a
																	role="button"
																	on:click={() => callback(child.id)}
																	tabindex="0"
																	on:keydown={onKeyPressed}
																	class={child.linkType}
																>
																	{child.title}
																	{#if child.linkType === 'download'}
																		<span class="download-animated"><i></i></span>
																	{:else if child.linkType === 'external'}
																		<span class="external-link-animated"><i></i></span>
																	{/if}
																</a>
															{:else}
																<a
																	role="button"
																	href={child.href}
																	tabindex="0"
																	data-sveltekit-preload-code={child.preloadCode ?? 'viewport'}
																	data-sveltekit-preload-data={child.preloadData ?? 'hover'}
																	class={child.linkType}
																>
																	{child.title}
																	{#if child.linkType === 'download'}
																		<span class="download-animated"><i></i></span>
																	{:else if child.linkType === 'external'}
																		<span class="external-link-animated"><i></i></span>
																	{/if}
																</a>
															{/if}
														</li>
													{/if}
												{/each}
											</ul>
										</li>
									{:else}
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
													data-sveltekit-preload-code={link.preloadCode ?? 'viewport'}
													data-sveltekit-preload-data={link.preloadData ?? 'hover'}
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
					{#if actionMenu}
						<div class="dropdown-language {showActionMenu ? 'active' : ''}">
							<button
								class="blue {actionMenu.showLanguageIcon === true ? '' : 'icon-hidden'}"
								aria-label={actionMenu.placeholder}
								aria-expanded="false"
								on:click={() => {
									showActionMenu = !showActionMenu;
								}}
							>
								{actionMenu.title}
							</button>
							<ul role="menu">
								{#each actionMenu.links as actionLink}
									<li role="menuitem">
										<a href={actionLink.href} tabindex="-1">{actionLink.title}</a>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
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
					<div class="custom-button"><slot name="customButton" /></div>
				</div>
				{#if links.length > 0}
					<div class="mobile-nav {showMobileMenu ? 'show' : ''}">
						<div class="grid-x">
							<div
								class="cell mobile-links {isMobileSubMenuShown || showActionMobileMenu
									? 'hide'
									: ''}"
							>
								<ul>
									{#each links as link}
										<li>
											{#if link.children && link.children.length > 0}
												<div
													role="button"
													tabindex="0"
													class="cta__link cta--space"
													on:click={() => {
														showMobileSubMenu(link);
													}}
													on:keydown={onKeyPressed}
													id={link.id}
												>
													{link.title}
													{#if link.tooltip}
														- {link.tooltip}
													{/if}
												</div>
											{:else if link.callback}
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
									{/each}
								</ul>
								{#if actionMenu}
									<div class="mobile-nav-options">
										<!-- svelte-ignore a11y-invalid-attribute -->
										<a
											href=""
											class="mob-lang-switcher"
											on:click={(e) => {
												e.preventDefault();
												showActionMobileMenu = true;
											}}
										>
											{#if actionMenu.showLanguageIcon}
												<svg
													width="25"
													height="26"
													viewBox="0 0 25 26"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<g clip-path="url(#clip0)">
														<path
															d="M16.599 23.688C17.7895 22.3987 18.4193 20.6895 18.35 18.936H0.75V0.75H23.88V15.468L23.875 15.474C23.875 15.521 23.875 15.568 23.875 15.616C23.905 20.278 17.206 24.488 16.175 24.488C15.921 24.488 16.004 24.24 16.599 23.688Z"
															stroke="#006EB5"
															stroke-width="1.5"
														/>
														<path
															d="M13.5854 13.542L16.9429 5.45215L20.2144 13.542"
															stroke="#006EB5"
															stroke-width="1.5"
															stroke-linecap="round"
															stroke-linejoin="round"
														/>
														<path
															d="M15.0576 10.6704H18.9863"
															stroke="#006EB5"
															stroke-width="1.5"
														/>
														<path
															d="M4.13086 6.76706H10.6748"
															stroke="#006EB5"
															stroke-width="1.5"
															stroke-linecap="round"
														/>
														<path
															d="M4.13086 13.1656C4.13086 13.1656 9.59778 13.6368 9.92578 6.90781"
															stroke="#006EB5"
															stroke-width="1.5"
															stroke-linecap="round"
														/>
														<path
															d="M10.8271 13.5417C10.8271 13.5417 6.38075 13.065 5.21875 9.11597"
															stroke="#006EB5"
															stroke-width="1.5"
															stroke-linecap="round"
														/>
														<path
															d="M7.40723 4.08563V6.56317"
															stroke="#006EB5"
															stroke-width="1.5"
															stroke-linecap="round"
														/>
													</g>
													<defs>
														<clipPath id="clip0">
															<rect width="24.63" height="25.239" fill="white" />
														</clipPath>
													</defs>
												</svg>
											{/if}
											{actionMenu.title}
										</a>
									</div>
								{/if}
							</div>

							<div class="cell mobile-sub-menu {isMobileSubMenuShown ? 'show' : ''}">
								<button class="back-nav" on:click={hideMobileSubMenu}>
									<svg
										width="33"
										height="17"
										viewBox="0 0 33 17"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M9.29569 1.0354L2.00009 8.17012M2.00009 8.17012L9.29569 15.3083M2.00009 8.17012L32.6416 8.17012"
											stroke="#D12800"
											stroke-width="2"
										/>
									</svg>
									Back
								</button>
								<div class="mobile-mega-wrapper">
									{#each links as link}
										{#if link.children && link.children.length > 0}
											<div
												class="mobile-mega-content {link.id === submenuLink?.id
													? 'show-content'
													: ''}"
												data-mobile-id={link.id}
											>
												<h6 class="sub-heading">{link.title}</h6>
												<ul class="sub-sub-menus">
													{#each link.children as child}
														{#if child.children && child.children.length > 0}
															<li>
																<span>{child.title}</span>
																<ul>
																	{#each child.children as grandchild}
																		<li>
																			{#if grandchild.callback}
																				{@const callback = grandchild.callback}
																				<a
																					class="cta__link cta--space"
																					role="button"
																					tabindex="0"
																					on:click={() => {
																						showMobileMenu = false;
																						hideMobileSubMenu();
																						callback(grandchild.id);
																					}}
																					on:keydown={onKeyPressed}
																					id={grandchild.id}
																				>
																					{grandchild.title}
																					{#if grandchild.tooltip}
																						- {grandchild.tooltip}
																					{/if}
																				</a>
																			{:else}
																				<a
																					class="cta__link cta--space"
																					id={grandchild.id}
																					href={grandchild.href}
																				>
																					{grandchild.title}
																					{#if grandchild.tooltip}
																						- {grandchild.tooltip}
																					{/if}
																				</a>
																			{/if}
																		</li>
																	{/each}
																</ul>
															</li>
														{:else}
															<li>
																<span>
																	{#if child.callback}
																		{@const callback = child.callback}
																		<div
																			class="cta__link cta--space"
																			role="button"
																			tabindex="0"
																			on:click={() => {
																				showMobileMenu = false;
																				hideMobileSubMenu();
																				callback(child.id);
																			}}
																			on:keydown={onKeyPressed}
																			id={child.id}
																		>
																			{child.title}
																			{#if child.tooltip}
																				- {child.tooltip}
																			{/if}
																		</div>
																	{:else}
																		<a class="cta__link cta--space" id={child.id} href={child.href}>
																			{child.title}
																			{#if child.tooltip}
																				- {child.tooltip}
																			{/if}
																		</a>
																	{/if}
																</span>
															</li>
														{/if}
													{/each}
												</ul>
											</div>
										{/if}
									{/each}
								</div>
							</div>
							{#if actionMenu}
								<div class="cell mob-sub-lang {showActionMobileMenu ? 'show' : ''}">
									<button class="back-nav" on:click={hideActionMobileMenu}>
										<svg
											width="33"
											height="17"
											viewBox="0 0 33 17"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M9.29569 1.0354L2.00009 8.17012M2.00009 8.17012L9.29569 15.3083M2.00009 8.17012L32.6416 8.17012"
												stroke="#D12800"
												stroke-width="2"
											/>
										</svg>
										Back
									</button>
									<ul class="sub-sub-lang">
										<li>
											<span>{actionMenu.title}</span>
											<ul>
												{#each actionMenu.links as link}
													<li><a href={link.href}>{link.title}</a></li>
												{/each}
											</ul>
										</li>
									</ul>
								</div>
							{/if}
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
	@use '../css/menu-multi-level.min.css';
	@use '../css/mobile-nav.min.css';
	@use '../css/cta-link.min.css';
	@use '../css/language-switcher.min.css';

	.custom-button {
		display: block;
		cursor: pointer;
		margin-left: 0.75rem !important;
	}

	.country-header .header .site-title span:first-of-type:not(:last-of-type) {
		white-space: nowrap;
	}
</style>
