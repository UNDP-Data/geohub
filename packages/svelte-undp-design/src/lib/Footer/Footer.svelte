<!-- https://design.undp.org/?path=/docs/components-ui-components-footer--footer -->
<script lang="ts">
	export let logoUrl: string;

	export let footerItems: { [key: string]: { title: string; url: string }[] } = {};

	const currentYear = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="grid-x">
		<div class="cell medium-10 medium-offset-1">
			<div class="grid-x footer-head">
				<div class="cell medium-5">
					<div class="footer-logo">
						<a href="https://www.undp.org">
							<img src={logoUrl} alt="UNDP Logo" />
						</a>
						<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
						<h5 tabindex="0">
							United Nations
							<br />
							Development Programme
						</h5>
					</div>
				</div>
			</div>
			<div class="grid-x grid-margin-x" data-accordion="mobile">
				{#each Object.keys(footerItems) as pageTitle}
					<div class="cell medium-2 footer-item">
						<button
							type="button"
							id="footer-item-1"
							class="footer-heading desktop-event-none"
							tabindex="0"
							aria-controls="footer-panel-1"
							aria-expanded="false"
						>
							{pageTitle}
						</button>
						<div
							id="footer-panel-1"
							class="footer-panel desktop-visible"
							aria-label="footer-item-1"
							aria-hidden="false"
							role="region"
						>
							{#each footerItems[pageTitle] as item}
								<a href={item.url} title="Page title">{item.title}</a>
							{/each}
						</div>
					</div>
				{/each}
				<div class="cell medium-4 social-links">
					<ul class="footer-links">
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
					<ul class="footer-icons">
						<li>
							<a href="https://www.undp.org/twitter-redirect" class="twitter" title="Twitter"
								>twitter</a
							>
						</li>

						<li>
							<a href="https://www.undp.org/facebook-redirect" class="facebook" title="Facebook"
								>facebook</a
							>
						</li>
						<li>
							<a href="https://www.youtube.com/UNDP/" class="youtube" title="Youtube">youtube</a>
						</li>

						<li>
							<a href="https://www.instagram.com/UNDP/" class="instagram" title="Instagram"
								>instagram</a
							>
						</li>
						<li>
							<a href="https://www.linkedin.com/company/undp/" class="linkedin" title="LinkedIn"
								>linkedIn</a
							>
						</li>
					</ul>
				</div>
			</div>
			<div class="footer-copyright">
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<p tabindex="0">© {currentYear} United Nations Development Programme</p>
			</div>
		</div>
	</div>
</footer>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/footer.min.css';
	@use '../css/buttons.min.css';

	.social-links {
		margin-left: auto !important;
	}
</style>
