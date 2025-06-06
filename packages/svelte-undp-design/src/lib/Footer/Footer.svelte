<!-- https://design.undp.org/?path=/docs/components-ui-components-footer--footer -->
<script lang="ts">
	import type { FooterItem } from '$lib/interfaces';

	interface Props {
		logoUrl: string;
		footerItems?: {
			[key: string]: FooterItem[];
		};
		isSimple?: boolean;
		isInverted?: boolean;
	}

	let {
		logoUrl,
		footerItems = $bindable({}),
		isSimple = false,
		isInverted = false
	}: Props = $props();

	const currentYear = new Date().getFullYear();
	let panelExpanded: { [key: string]: boolean } = $state({});
	let innerWidth: number = $state(0);
	let isMobile = $derived(innerWidth < 768 ? true : false);

	const onKeyPressed = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			e.target.click();
		}
	};
</script>

<svelte:window bind:innerWidth />

<footer class="footer {isInverted ? 'inverted' : ''}">
	<div class="grid-x">
		<div class="cell medium-10 medium-offset-1">
			<div class="grid-x {isSimple ? 'footer-top' : 'footer-head'}">
				<div class="cell medium-5">
					<div class="footer-logo {isInverted ? 'inverted' : ''}">
						<a href="https://www.undp.org">
							<img src={logoUrl} alt="UNDP Logo" />
						</a>
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<h5 class="" tabindex="0" data-viewport="false">
							United Nations
							<br />
							Development Programme
						</h5>
					</div>
				</div>
				{#if isSimple}
					<div class="cell medium-5 show-large">
						<ul class="footer-icons {isInverted ? 'inverted' : ''}">
							<li>
								<a href="https://www.undp.org/facebook-redirect" class="facebook" title="Facebook"
									>facebook</a
								>
							</li>
							<li>
								<a href="https://www.linkedin.com/company/undp/" class="linkedin" title="LinkedIn"
									>linkedIn</a
								>
							</li>
							<li>
								<a href="https://www.instagram.com/UNDP/" class="instagram" title="Instagram"
									>instagram</a
								>
							</li>
							<li>
								<a href="https://www.undp.org/twitter-redirect" class="twitter-x" title="X"
									>twitter</a
								>
							</li>
							<li>
								<a href="https://www.youtube.com/UNDP/" class="youtube" title="Youtube">youtube</a>
							</li>
						</ul>
					</div>
				{/if}
			</div>
			{#if isSimple}
				<div class="grid-x footer-bottom">
					<div class="cell medium-5">
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<p tabindex="0">© {currentYear} United Nations Development Programme</p>
					</div>
					<div class="cell medium-6">
						<ul class="footer-lists {isInverted ? 'inverted' : ''}">
							<li><a href="https://www.undp.org/copyright-terms-use">Terms Of Use</a></li>
						</ul>
						<div class="show-small">
							<ul class="footer-icons {isInverted ? 'inverted' : ''}">
								<li>
									<a href="https://www.undp.org/facebook-redirect" class="facebook" title="Facebook"
										>facebook</a
									>
								</li>
								<li>
									<a href="https://www.linkedin.com/company/undp/" class="linkedin" title="LinkedIn"
										>linkedIn</a
									>
								</li>
								<li>
									<a href="https://www.instagram.com/UNDP/" class="instagram" title="Instagram"
										>instagram</a
									>
								</li>
								<li>
									<a href="https://www.undp.org/twitter-redirect" class="twitter-x" title="X"
										>twitter</a
									>
								</li>
								<li>
									<a href="https://www.youtube.com/UNDP/" class="youtube" title="Youtube">youtube</a
									>
								</li>
							</ul>
						</div>
					</div>
				</div>
			{:else}
				<div class="grid-x grid-margin-x" data-accordion="mobile">
					<div class="cell medium-8">
						<div class="grid-x grid-margin-x footer-items">
							{#each Object.keys(footerItems) as pageTitle, index (pageTitle)}
								{@const itemId = `footer-item-${index}`}
								{@const panelId = `footer-panel-${index}`}
								<div class="cell footer-item {isInverted ? 'inverted' : ''}">
									<button
										type="button"
										id={itemId}
										class="footer-heading desktop-event-none {panelExpanded[itemId] &&
										panelExpanded[itemId] === true
											? 'active'
											: ''}"
										tabindex="0"
										aria-controls={panelId}
										aria-expanded={panelExpanded[itemId] && panelExpanded[itemId] === true}
										onclick={() => {
											if (!panelExpanded[itemId]) {
												panelExpanded[itemId] = true;
											} else {
												panelExpanded[itemId] = !panelExpanded[itemId];
											}
										}}
									>
										{pageTitle}
									</button>
									<div
										id={panelId}
										class="footer-panel desktop-visible"
										aria-label={itemId}
										role="region"
										style="display: {!isMobile
											? 'block'
											: panelExpanded[itemId] && panelExpanded[itemId] === true
												? 'block'
												: 'none'}"
									>
										{#each footerItems[pageTitle] as item (footerItems[pageTitle].indexOf(item))}
											{#if item.callback}
												<!-- svelte-ignore a11y_missing_attribute -->
												<a
													role="button"
													tabindex="0"
													onclick={item.callback}
													onkeydown={onKeyPressed}
													title={item.title}
												>
													{item.title}
												</a>
											{:else}
												<a
													href={item.url}
													title={item.title}
													data-sveltekit-preload-code={item.preloadCode ?? 'off'}
													data-sveltekit-preload-data={item.preloadData ?? 'off'}
												>
													{item.title}
												</a>
											{/if}
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
					<div class="cell medium-4">
						<ul class="footer-links {isInverted ? 'inverted' : ''}">
							<li>
								<a href="https://www.undp.org/accountability/audit/investigations"
									>Report Fraud, Abuse, Misconduct</a
								>
							</li>
							<li>
								<a
									href="https://www.undp.org/accountability/audit/social-and-environmental-compliance-review-and-stakeholder-response-mechanism"
									>Submit Social Or Environmental Complaint</a
								>
							</li>
							<li><a href="https://www.undp.org/scam-alert#">Scam Alert</a></li>
							<li><a href="https://www.undp.org/copyright-terms-use">Terms Of Use</a></li>
						</ul>
						<ul class="footer-icons {isInverted ? 'inverted' : ''}">
							<li>
								<a href="https://www.undp.org/facebook-redirect" class="facebook" title="Facebook"
									>facebook</a
								>
							</li>
							<li>
								<a href="https://www.linkedin.com/company/undp/" class="linkedin" title="LinkedIn"
									>linkedIn</a
								>
							</li>
							<li>
								<a href="https://www.instagram.com/UNDP/" class="instagram" title="Instagram"
									>instagram</a
								>
							</li>
							<li>
								<a href="https://www.undp.org/twitter-redirect" class="twitter-x" title="X"
									>twitter</a
								>
							</li>

							<li>
								<a href="https://www.youtube.com/UNDP/" class="youtube" title="Youtube">youtube</a>
							</li>
						</ul>
					</div>
				</div>
				<div class="footer-copyright">
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<p tabindex="0">© {currentYear} United Nations Development Programme</p>
				</div>
			{/if}
		</div>
	</div>
</footer>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/footer.min.css';
	@use '../css/buttons.min.css';
	@use '../css/accordion.min.css';

	.social-links {
		margin-left: auto !important;
	}
</style>
