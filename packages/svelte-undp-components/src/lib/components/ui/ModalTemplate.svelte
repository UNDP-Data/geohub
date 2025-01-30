<script lang="ts">
	import { handleEnterKey } from '$lib/util/handleEnterKey.js';
	import { fade } from 'svelte/transition';

	interface Props {
		title: string;
		show?: boolean;
		showClose?: boolean;
		hiddenButtons?: boolean;
		width?: string;
		content?: import('svelte').Snippet;
		buttons?: import('svelte').Snippet;
	}

	let {
		title = $bindable(),
		show = $bindable(),
		showClose = true,
		hiddenButtons = false,
		width = $bindable(),
		content,
		buttons
	}: Props = $props();

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

<svelte:window onkeydown={handleEnterEscape} />

<div class="modal {show === true ? 'is-active' : ''}" transition:fade|global>
	<div
		class="modal-background {showClose ? 'close' : ''}"
		role="none"
		onclick={close}
		onkeydown={handleEnterKey}
	></div>

	<div class="modal-card" style={width ? `width: ${width};` : ''}>
		<section class="modal-card-body">
			{#if showClose}
				<button class="delete is-large" aria-label="close" title="Close" onclick={close}></button>
			{/if}
			<div class="mx-4">
				<h5 class="title is-5 mb-0">{title}</h5>

				<div class="my-5">
					{@render content?.()}
				</div>

				<div class="pt-4" hidden={hiddenButtons}>
					{@render buttons?.()}
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
				padding: 3rem;

				@media (max-width: 48em) {
					padding: 1rem 0.5rem !important;
				}

				.delete {
					position: absolute;
					top: 1rem;
					right: 1rem;

					@media (max-width: 48em) {
						top: 0.5rem;
						right: 0.5rem;
					}
				}
			}
		}
	}
</style>
