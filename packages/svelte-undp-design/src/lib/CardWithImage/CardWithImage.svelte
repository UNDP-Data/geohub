<!-- https://design.undp.org/?path=/docs/components-ui-components-cards-content-card-with-image--with-image -->
<script lang="ts">
	import { Loader } from '$lib';

	export let linkName = 'READ MORE';
	export let url = '#';
	export let tag: string;
	export let title: string;
	export let image: string;
	export let accent: 'global' | 'yellow' | 'red' | 'green' | 'blue' = 'global';

	export let width: number;
	export let height: number;

	let imageLoaded = false;
</script>

<div
	class="content-card {accent === 'global' ? '' : `accent-${accent}`} {tag
		? ''
		: 'hide-border-top'}"
>
	<a href={url}>
		{#if tag}
			<h6 class="" data-viewport="false">{tag}</h6>
		{/if}
		<div class="image">
			<img
				src={image}
				alt={image}
				{width}
				{height}
				loading="lazy"
				on:load={() => {
					imageLoaded = true;
				}}
				on:error={() => {
					imageLoaded = true;
				}}
			/>

			{#if !imageLoaded}
				<div class="image-loader">
					<Loader size="medium" />
				</div>
			{/if}
		</div>
		<div class="content-caption">
			<h5 class="title" data-viewport="false">
				{title}
			</h5>
			<span class="cta__link cta--space">
				{linkName}
				<i></i>
			</span>
		</div>
	</a>
</div>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/cta-link.min.css';
	@use '../css/content-card.min.css';
	@use '../css/buttons.min.css';

	.image {
		position: relative;
		border: 1px solid gray;

		.image-loader {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
	}

	.title {
		align-items: center;

		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
	}

	.content-card {
		&.hide-border-top {
			border-top: 2px solid #00000000;
		}
	}
</style>
