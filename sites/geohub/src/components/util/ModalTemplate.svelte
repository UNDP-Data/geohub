<script lang="ts">
	import { handleEnterKey } from '@undp-data/svelte-geohub-static-image-controls';
	import { fade } from 'svelte/transition';

	export let title: string;
	export let show = false;

	const close = () => {
		show = false;
	};
</script>

<div class="modal {show ? 'is-active' : ''}" transition:fade|global>
	<div class="modal-background" role="none" on:click={close} on:keydown={handleEnterKey} />

	<div class="modal-card">
		<section class="modal-card-body">
			<button class="delete is-large" aria-label="close" title="Close" on:click={close} />
			<p class="title is-5">{title}</p>

			<slot name="content" />

			<div class="mt-4">
				<slot name="buttons" />
			</div>
		</section>
	</div>
</div>

<style lang="scss">
	.modal-card {
		.modal-card-body {
			.delete {
				position: absolute;
				top: 1rem;
				right: 1rem;
			}
		}
	}
</style>
