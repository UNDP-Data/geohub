<!-- https://design.undp.org/?path=/docs/components-ui-components-cards-content-card-with-image--with-image -->
<script lang="ts">
	export let linkName = 'READ MORE';
	export let url = '#';
	export let tag: string;
	export let title: string;
	export let image: string;
	export let accent: 'global' | 'yellow' | 'red' | 'green' | 'blue';
</script>

<div class="grid-x grid-margin-x content-card-wrapper">
	<div class="cell medium-4">
		<div class="content-card {accent === 'global' ? '' : `accent-${accent}`}">
			<a href={url}>
				<h6 class="" data-viewport="false">{tag}</h6>
				<div class="image">
					<img src={image} alt={image} />
				</div>
				<div class="content-caption">
					<h5 class="" data-viewport="false">
						{title}
					</h5>
					<span class="cta__link cta--space">
						{linkName}
						<i></i>
					</span>
				</div>
			</a>
		</div>
	</div>
</div>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/cta-link.min.css';
	@use '../css/content-card.min.css';
	@use '../css/buttons.min.css';
</style>
