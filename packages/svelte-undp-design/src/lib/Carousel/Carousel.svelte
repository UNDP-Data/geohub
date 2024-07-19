<script lang="ts">
	import Carousel from 'svelte-carousel';

	let carousel: Carousel;

	const handlePrevClick = () => {
		carousel.goToPrev();
	};
	const handleNextClick = () => {
		carousel.goToNext();
	};
</script>

<Carousel bind:this={carousel}>
	<div slot="prev">
		<button
			on:click={handlePrevClick}
			class="custom-arrow custom-arrow-prev is-flex is-justify-content-center is-align-items-center"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="25"
				viewBox="0 0 24 25"
				fill="none"
			>
				<rect
					width="24"
					height="24"
					transform="translate(0 0.503418)"
					fill="white"
					fill-opacity="0.01"
					style="mix-blend-mode:multiply"
				/>
				<path
					d="M7.5 12.5034L15 5.00342L16.05 6.05342L9.6 12.5034L16.05 18.9534L15 20.0034L7.5 12.5034Z"
					fill="#232E3D"
				/>
			</svg>
		</button>
	</div>
	<slot />
	<div slot="next">
		<button
			on:click={handleNextClick}
			class="custom-arrow custom-arrow-next is-flex is-justify-content-center is-align-items-center"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="25"
				viewBox="0 0 24 25"
				fill="none"
			>
				<rect
					width="24"
					height="24"
					transform="translate(0 0.503418)"
					fill="white"
					fill-opacity="0.01"
					style="mix-blend-mode:multiply"
				/>
				<path
					d="M16.4992 12.5034L8.99922 20.0034L7.94922 18.9534L14.3992 12.5034L7.94922 6.05342L8.99922 5.00342L16.4992 12.5034Z"
					fill="#232E3D"
				/>
			</svg>
		</button>
	</div>
</Carousel>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/fluid-image-size-carousel.min.css';

	.custom-arrow {
		width: 40px;
		height: 40px;
		border: 1px solid #d9d9d9;
		border-radius: 50%;
		background-color: white;
	}
</style>
