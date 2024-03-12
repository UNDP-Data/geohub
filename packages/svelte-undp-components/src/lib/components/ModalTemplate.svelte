<script lang="ts">
	import { handleEnterKey } from '$lib/util/handleEnterKey.js';
	import { fade } from 'svelte/transition';

	export let title: string;
	export let show = false;
	export let showClose = true;
	export let hiddenButtons = false;

	const close = () => {
		show = false;
	};
</script>

<div class="modal {show ? 'is-active' : ''}" transition:fade|global>
	<div class="modal-background" role="none" on:click={close} on:keydown={handleEnterKey} />

	<div class="modal-card">
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
			cursor: pointer;
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
