<!-- https://design.undp.org/?path=/docs/components-ui-components-cards-content-card-with-image--with-image -->
<script lang="ts">
	export let linkName = 'READ MORE';
	export let url = '#';
</script>

<div class="grid-x grid-margin-x content-card-wrapper">
	<div class="cell medium-4">
		<div class="content-card">
			<a href={url} target="_blank">
				<slot name="title" />
				<div class="image">
					<slot name="image" />
				</div>
				<div class="content-caption">
					<slot name="description" />
					<!-- <h5>Title of the post goes here and it’s two lines</h5> -->
					<span class="cta__link cta--space">
						{linkName}
						<i />
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

	.content-caption {
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		padding-top: 0;
		padding-bottom: 0;
	}
</style>
