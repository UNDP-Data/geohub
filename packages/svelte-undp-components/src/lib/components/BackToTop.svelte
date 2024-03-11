<script lang="ts">
	import { BROWSER } from 'esm-env';

	export let top = '0px';
	export let showOnPx = 150;
	export let hidden = true;
	export let timeToHidden = 5000;
	let isHover = false;
	let timeoutId: number | undefined;

	function goTop() {
		if (BROWSER) {
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
			}, timeToHidden);
		} else {
			hidden = true;
		}
	}
</script>

<svelte:window on:scrollend={handleOnScrollEnd} />

<button
	class="button is-rounded {isHover ? 'is-link' : ''} back-to-top"
	style="top: {top};"
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
		left: 50%;
		transform: translateX(-50%);
	}

	.back-to-top.hidden {
		opacity: 0;
		visibility: hidden;
	}
</style>
