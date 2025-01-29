<script lang="ts">
	import { BROWSER } from 'esm-env';

	interface Props {
		top?: string;
		showOnPx?: number;
		hidden?: boolean;
		timeToHidden?: number;
	}

	let {
		top = $bindable('0px'),
		showOnPx = $bindable(150),
		hidden = $bindable(true),
		timeToHidden = $bindable(5000)
	}: Props = $props();
	let isHover = $state(false);
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

<svelte:window onscrollend={handleOnScrollEnd} />

<button
	class="button is-rounded {isHover ? 'is-link' : ''} back-to-top"
	style="top: {top};"
	onclick={goTop}
	onmouseenter={() => {
		isHover = true;
	}}
	onmouseleave={() => {
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

		&.is-rounded {
			border-radius: 30px;
		}
	}

	.back-to-top.hidden {
		opacity: 0;
		visibility: hidden;
	}
</style>
