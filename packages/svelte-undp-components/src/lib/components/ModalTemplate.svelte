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
		<section class="modal-card-body p-6">
			{#if showClose}
				<button class="delete is-large" aria-label="close" title="Close" on:click={close} />
			{/if}
			<div class="mx-4">
				<h5 class="title is-5 mb-0">{title}</h5>

				<div class="my-5">
					<slot name="content" />
				</div>

				<div class="pt-4" hidden={hiddenButtons}>
					<slot name="buttons" />
				</div>
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
			cursor: default;

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
