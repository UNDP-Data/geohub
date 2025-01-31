<script lang="ts">
	interface Props {
		/**
		 * URL for the card
		 */
		href: string;
		/**
		 * Title of the card
		 */
		title: string;
		/**
		 * Description of the card
		 */
		description: string;
		/**
		 * Image URL of the card
		 */
		image: string;
		/**
		 * Content tag (optional)
		 */
		tag?: string;
		/**
		 * Button text. Default is `READ MORE`
		 */
		buttonText?: string;
		/**
		 * Hover accent color
		 */
		accent?: 'global' | 'yellow' | 'red' | 'green' | 'blue';
	}

	let {
		href,
		title,
		description,
		image,
		tag = '',
		buttonText = 'READ MORE',
		accent = 'global'
	}: Props = $props();
</script>

<div class="wide-card">
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<h6 class="inviewport" tabindex="0" data-viewport="true">{tag}</h6>
	<div class="grid-x wide-card__wrapper">
		<div class="cell medium-6 wide-card__description inviewport" data-viewport="true">
			<div class="card-summary">
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
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
