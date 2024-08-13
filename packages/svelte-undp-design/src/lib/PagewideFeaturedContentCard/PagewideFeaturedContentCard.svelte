<script lang="ts">
	/**
	 * URL for the card
	 */
	export let href: string;

	/**
	 * Title of the card
	 */
	export let title: string;

	/**
	 * Description of the card
	 */
	export let description: string;

	/**
	 * Image URL of the card
	 */
	export let image: string;

	/**
	 * Button text. Default is `READ MORE`
	 */
	export let buttonText = 'READ MORE';

	/**
	 * Hover accent color
	 */
	export let accent: 'global' | 'yellow' | 'red' | 'green' | 'blue' = 'global';
</script>

<div class="wide-card">
	<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
	<h6 class="inviewport" tabindex="0" data-viewport="true">CONTENT TAG</h6>
	<div class="grid-x wide-card__wrapper">
		<div class="cell medium-6 wide-card__description inviewport" data-viewport="true">
			<div class="card-summary">
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<h4 class="" tabindex="0" data-viewport="false">
					<a {href}>{title}</a>
				</h4>
				<p>
					<a {href}>
						{description}
					</a>
				</p>
			</div>
			<a class="button button-primary button-arrow" role="button" {href}>{buttonText}</a>
		</div>
		<div class="cell medium-6 wide-card__image {accent === 'global' ? '' : `accent-${accent}`}">
			<a {href}>
				<img src={image} alt={title} />
			</a>
		</div>
	</div>
</div>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/page-wide-card.min.css';
	@use '../css/buttons.min.css';
</style>
