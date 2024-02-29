<script lang="ts">
	import { browser } from '$app/environment';

	export let showOnPx = 150;
	let hidden = true;
	let isHover = false;
	let timeoutId;

	function goTop() {
		if (browser) {
			window.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		}
	}

	function scrollContainer() {
		return document.documentElement || document.body;
	}

	function handleOnScrollEnd() {
		if (!scrollContainer()) {
			return;
		}

		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = undefined;
		}

		if (scrollContainer().scrollTop > showOnPx) {
			hidden = false;
			timeoutId = setTimeout(() => {
				hidden = true;
			}, 5000);
		} else {
			hidden = true;
		}
	}
</script>

<svelte:window on:scrollend={handleOnScrollEnd} />

<button
	class="button is-rounded {isHover ? 'is-link' : ''} back-to-top"
	on:click={goTop}
	on:mouseenter={() => {
		isHover = true;
	}}
	on:mouseleave={() => {
		isHover = false;
	}}
	class:hidden
>
	<span class="icon">
		<i class="fas fa-arrow-up"></i>
	</span>
	<span>Back to top</span>
</button>

<style lang="scss">
	.back-to-top {
		transition:
			opacity 0.5s,
			visibility 0.5s;
		position: fixed;
		z-index: 999;
		top: 130px;
		left: 50%;
		transform: translateX(-50%);

		@media (max-width: 63.9375em) {
			top: 90px;
		}
	}

	.back-to-top.hidden {
		opacity: 0;
		visibility: hidden;
	}
</style>
