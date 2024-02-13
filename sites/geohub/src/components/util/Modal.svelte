<script lang="ts">
	import Notification from '$components/util/Notification.svelte';
	import { createEventDispatcher } from 'svelte';
	import ModalTemplate from './ModalTemplate.svelte';

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

	const handleContinue = () => {
		dialogOpen = false;
		dispatch('continue');
	};
</script>

<ModalTemplate {title} bind:show={dialogOpen}>
	<div slot="content">
		<Notification type={messageType} showCloseButton={false}>
			<div class="has-text-weight-medium">
				{message}
				<br />
				<p>{target ? target : ''}</p>
			</div>
		</Notification>
	</div>
	<div class="is-flex" slot="buttons">
		<div class="footer-button px-2">
			<button
				data-testid="cancel-button"
				class="button is-link is-light has-text-weight-bold is-uppercase"
				on:click={handleCancel}
			>
				{cancelText}
			</button>
		</div>
		<div class="footer-button px-2">
			<button class="button is-link has-text-weight-bold is-uppercase" on:click={handleContinue}>
				{continueText}
			</button>
		</div>
	</div>
</ModalTemplate>
