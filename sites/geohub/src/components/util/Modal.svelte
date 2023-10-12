<script lang="ts">
	import Notification from '$components/util/Notification.svelte';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

	const dispatch = createEventDispatcher();
	export let dialogOpen = false;
	export let title: string;
	export let message: string;
	export let messageType: 'warning' | 'info' = 'warning';
	export let target = '';
	export let continueText: string;
	export let cancelText: string;
	const handleCancel = () => {
		dispatch('cancel');
	};
	const handleKeyDown = (e) => {
		if (e.key === 'Escape') {
			handleCancel();
		}
	};
	const handleContinue = () => {
		dialogOpen = false;
		dispatch('continue');
	};
</script>

<div class="modal {dialogOpen ? 'is-active' : ''}" data-testid="modal-dialog" transition:fade>
	<div
		class="modal-background"
		role="button"
		tabindex="-1"
		on:click={handleCancel}
		on:keydown={handleKeyDown}
	/>
	<div class="modal-card">
		<header class="modal-card-head">
			<span class="modal-card-title">{title}</span>
			<button
				class="delete"
				aria-label="close"
				title="Close Delete Layer Button"
				on:click={handleCancel}
			/>
		</header>
		<section class="modal-card-body has-text-weight-normal">
			<Notification type={messageType} showCloseButton={false}>
				<div class="has-text-weight-medium">
					{message}
					<br />
					<p>{target ? target : ''}</p>
				</div>
			</Notification>
		</section>
		<footer class="modal-card-foot is-flex is-flex-direction-row is-justify-content-flex-end">
			<div class="footer-button px-2">
				<button data-testid="cancel-button" class="button is-link" on:click={handleCancel}>
					{cancelText}
				</button>
			</div>
			<div class="footer-button px-2">
				<button class="button is-primary" on:click={handleContinue}>
					{continueText}
				</button>
			</div>
		</footer>
	</div>
</div>

<style lang="scss">
</style>
