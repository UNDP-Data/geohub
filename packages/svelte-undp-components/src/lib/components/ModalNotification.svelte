<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ModalTemplate from './ModalTemplate.svelte';
	import Notification from './Notification.svelte';

	const dispatch = createEventDispatcher();
	export let dialogOpen = false;
	export let title: string;
	export let message: string;
	export let messageType: 'warning' | 'info' | 'danger' = 'warning';
	export let target = '';
	export let continueText = 'continue';
	export let cancelText = 'cancel';
	export let showIcon = false;
	export let continueColor: 'primary' | 'link' | 'none' = 'primary';
	export let cancelColor: 'primary' | 'link' | 'none' = 'none';

	const handleCancel = () => {
		dialogOpen = false;
		dispatch('cancel');
	};

	const handleContinue = () => {
		dialogOpen = false;
		dispatch('continue');
	};
</script>

<ModalTemplate {title} bind:show={dialogOpen}>
	<div slot="content">
		<Notification type={messageType} showCloseButton={false} bind:showIcon>
			<div class="has-text-weight-medium">
				{message}
				<br />
				<p>{target ? target : ''}</p>
			</div>
		</Notification>
	</div>
	<div class="is-flex" slot="buttons">
		<div class="footer-button">
			<button
				data-testid="cancel-button"
				class="button is-uppercase has-text-weight-bold {cancelColor === 'none'
					? ''
					: `is-${cancelColor}`}"
				on:click={handleCancel}
			>
				{cancelText}
			</button>
		</div>
		<div class="footer-button px-2">
			<button
				class="button {continueColor === 'none'
					? ''
					: `is-${continueColor}`} is-uppercase has-text-weight-bold"
				on:click={handleContinue}
			>
				{continueText}
			</button>
		</div>
	</div>
</ModalTemplate>
