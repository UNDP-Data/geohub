<script lang="ts">
	import { handleEnterKey } from '$lib/util/handleEnterKey.js';
	import { fade } from 'svelte/transition';

	export let title: string;
	export let show = false;
	export let showClose = true;
	export let hiddenButtons = false;
	export let width = '';

	const close = () => {
		if (!showClose) return;
		show = false;
	};

	const handleEnterEscape = (e: KeyboardEvent) => {
		if (!showClose) return;
		// close dialog if close button is shown
		if (e.key === 'Escape') {
			close();
		}
	};
</script>

<svelte:window on:keydown={handleEnterEscape} />

<div class="modal {show ? 'is-active' : ''}" transition:fade|global>
	<div
		class="modal-background {showClose ? 'close' : ''}"
		role="none"
		on:click={close}
		on:keydown={handleEnterKey}
	/>

	<div class="modal-card" style={width ? `width: ${width};` : ''}>
		<section class="modal-card-body">
			{#if showClose}
				<button class="delete is-large" aria-label="close" title="Close" on:click={close} />
			{/if}
			<p class="title is-5">{title}</p>

			<slot name="content" />

			<div class="pt-4" hidden={hiddenButtons}>
				<slot name="buttons" />
			</div>
		</section>
	</div>
</div>

<style lang="scss">
	.modal {
		z-index: 99;

		.modal-background {
			&.close {
				cursor: pointer;
			}
		}

		.modal-card {
			.modal-card-body {
				.delete {
					position: absolute;
					top: 1rem;
					right: 1rem;
				}
			}
		}
	}
</style>
