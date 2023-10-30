<script lang="ts">
	import { browser } from '$app/environment';

	export let showOnPx = 150;
	let hidden = true;

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

	function handleOnScroll() {
		if (!scrollContainer()) {
			return;
		}

		if (scrollContainer().scrollTop > showOnPx) {
			hidden = false;
		} else {
			hidden = true;
		}
	}
</script>

<svelte:window on:scroll={handleOnScroll} />

<button class="button is-medium back-to-top" on:click={goTop} class:hidden>
	<span class="icon">
		<i class="fas fa-angle-up"></i>
	</span>
</button>

<style lang="scss">
	.back-to-top {
		opacity: 1;
		transition:
			opacity 0.5s,
			visibility 0.5s;
		position: fixed;
		z-index: 999;
		right: 20px;
		user-select: none;
		bottom: 20px;
		border-radius: 45px;
		border-width: 2px;
	}

	.back-to-top.hidden {
		opacity: 0;
		visibility: hidden;
	}
</style>
