<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ModalTemplate from './ModalTemplate.svelte';
	import Notification from './Notification.svelte';

	const dispatch = createEventDispatcher();
	interface Props {
		dialogOpen?: boolean;
		title: string;
		message: string;
		messageType?: 'warning' | 'info' | 'danger';
		target?: string;
		continueText?: string;
		cancelText?: string;
		showIcon?: boolean;
		continueColor?: 'primary' | 'link' | 'none';
		cancelColor?: 'primary' | 'link' | 'none';
	}

	let {
		dialogOpen = $bindable(false),
		title = $bindable(),
		message = $bindable(),
		messageType = $bindable('warning'),
		target = $bindable(''),
		continueText = $bindable('continue'),
		cancelText = $bindable('cancel'),
		showIcon = $bindable(false),
		continueColor = $bindable('primary'),
		cancelColor = $bindable('none')
	}: Props = $props();

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
	{#snippet content()}
		<div>
			<Notification type={messageType} showCloseButton={false} bind:showIcon>
				<div class="has-text-weight-medium">
					{message}
					<br />
					<p>{target ? target : ''}</p>
				</div>
			</Notification>
		</div>
	{/snippet}
	{#snippet buttons()}
		<div class="is-flex">
			<div class="footer-button mr-2">
				<button
					class="button {continueColor === 'none'
						? ''
						: `is-${continueColor}`} is-uppercase has-text-weight-bold"
					onclick={handleContinue}
				>
					{continueText}
				</button>
			</div>
			<div class="footer-button">
				<button
					data-testid="cancel-button"
					class="cancel-button button is-uppercase has-text-weight-bold {cancelColor === 'none'
						? 'is-light'
						: `is-${cancelColor}`}"
					onclick={handleCancel}
				>
					{cancelText}
				</button>
			</div>
		</div>
	{/snippet}
</ModalTemplate>

<style lang="scss">
	.cancel-button {
		box-shadow: none !important;
		&.is-light {
			background-color: #edeff0 !important;
		}
	}
</style>
