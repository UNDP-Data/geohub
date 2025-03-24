<script lang="ts">
	import type { CarouselContent } from '$lib/interfaces';
	import Carousel from 'svelte-carousel';

	interface Props {
		contents?: CarouselContent[];
	}

	let { contents = $bindable([]) }: Props = $props();

	let innerWidth: number = $state(0);

	let initialPageIndex = $state(0);
	let clientWidth = $state(0);
	let pageProgress = $state(0);

	let carousel: Carousel | undefined = $state();

	const handlePageChanged = (e) => {
		const pageIndex: number = e.detail;
		const maxLength = contents.length;
		const equalDistance = clientWidth / maxLength;

		if (pageIndex === 0) {
			pageProgress = 0;
		} else if (pageIndex === contents.length - 1) {
			pageProgress = clientWidth - equalDistance;
		} else {
			pageProgress = equalDistance * pageIndex;
		}
	};
</script>

<svelte:window bind:innerWidth />

<section
	data-viewport="true"
	class="fluid-carousel swiper-slider-0 swiper-initialized swiper-horizontal swiper-pointer-events swiper-backface-hidden inviewport"
	dir="ltr"
	bind:clientWidth
>
	<div class="swiper-scrollbar swiper-scrollbar-horizontal">
		<div
			class="swiper-scrollbar-drag"
			style="width: {innerWidth /
				contents.length}px; transform: translate3d({pageProgress}px, 0px, 0px);"
		></div>
	</div>
	<div class="swiper-wrapper" id="swiper-wrapper-a216a249874be9bd" aria-live="polite">
		<Carousel
			bind:this={carousel}
			arrows={false}
			dots={false}
			bind:initialPageIndex
			on:pageChange={handlePageChanged}
		>
			{#each contents as content (contents.indexOf(content))}
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
							<i></i>
						</a>
						<div class="slider-arrows">
							<button
								class="swiper-button-prev"
								tabindex={0}
								aria-label="Previous slide"
								aria-controls="swiper-wrapper-b4b2bff5b29a5cd7"
								aria-disabled="false"
								onclick={() => {
									carousel?.goToPrev();
								}}
							>
								<svg
									width="45"
									height="44"
									viewBox="0 0 45 44"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<g clip-path="url(#clip0)">
										<path
											d="M22.276 3.8147e-06C9.97388 3.8147e-06 0.00102615 9.84795 0.00102615 21.996C0.00102615 34.1441 9.97388 43.992 22.276 43.992C34.5782 43.992 44.551 34.1441 44.551 21.996C44.551 9.84795 34.5782 3.8147e-06 22.276 3.8147e-06Z"
											fill="#232E3D"
										/>
										<path
											d="M26.0505 30.4917L16.4998 22.4976L26.0505 14.4976"
											stroke="white"
											stroke-width="2"
										/>
									</g>
									<defs>
										<clipPath id="clip0">
											<rect width="44.551" height="43.992" fill="white" />
										</clipPath>
									</defs>
								</svg>
							</button>

							<button
								class="swiper-button-next"
								tabindex={0}
								aria-label="Next slide"
								aria-controls="swiper-wrapper-b4b2bff5b29a5cd7"
								aria-disabled="false"
								onclick={() => {
									carousel?.goToNext();
								}}
							>
								<svg
									width="45"
									height="44"
									viewBox="0 0 45 44"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<g clip-path="url(#clip0)">
										<path
											d="M22.275 43.992C34.5771 43.992 44.55 34.1441 44.55 21.996C44.55 9.84795 34.5771 0 22.275 0C9.97286 0 0 9.84795 0 21.996C0 34.1441 9.97286 43.992 22.275 43.992Z"
											fill="#232E3D"
										/>
										<path
											d="M18.4995 14.5L28.0503 22.4941L18.4995 30.4941"
											stroke="white"
											stroke-width="2"
										/>
									</g>
									<defs>
										<clipPath id="clip0">
											<rect width="44.551" height="43.992" fill="white" />
										</clipPath>
									</defs>
								</svg>
							</button>
						</div>
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
	@use '../css/swiper.min.css';

	.fluid-carousel {
		padding-right: 0px !important;

		&.swiper-initialized {
			@media (max-width: 48em) {
				padding-left: 16px !important;
				padding-right: 16px !important;
			}
		}

		.fluid-carousel__image {
			user-drag: none;
			-webkit-user-drag: none;
			-moz-user-select: none;
			width: 65%;
			height: auto;

			@media (max-width: 48em) {
				width: 100%;
			}
		}
	}
</style>
