<script lang="ts">
	import type { CarouselContent } from '$lib/interfaces';
	import Carousel from 'svelte-carousel';

	export let contents: CarouselContent[] = [];
</script>

<section
	data-viewport="true"
	class="fluid-carousel swiper-slider-0 swiper-initialized swiper-horizontal swiper-pointer-events swiper-backface-hidden inviewport"
	dir="ltr"
>
	<div class="swiper-wrapper" id="swiper-wrapper-a216a249874be9bd" aria-live="polite">
		<Carousel>
			{#each contents as content}
				<div
					class="swiper-slide slider-slide"
					aria-roledescription="slide"
					aria-label={content.title}
					role="group"
				>
					<img class="fluid-carousel__image" src={content.imageUrl} alt="" />
					<article class="slide-content">
						<h6>{content.tag}</h6>
						<h4>{content.title}</h4>
						<p>{content.description}</p>
						<a class="cta__link cta--space" href={content.linkUrl}>
							{content.linkName}
							<i />
						</a>
					</article>
				</div>
			{/each}
		</Carousel>
	</div>
</section>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/fluid-image-size-carousel.min.css';
	@use '../css/cta-link.min.css';
	@use '../css/buttons.min.css';
	// @use '../css/swiper.min.css';
</style>
