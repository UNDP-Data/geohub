<script lang="ts">
	import ModalTemplate from './ModalTemplate.svelte';
	import Notification from './Notification.svelte';

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
		oncancel?: () => void;
		oncontinue?: () => void;
	}

	let {
		dialogOpen = $bindable(),
		title = $bindable(),
		message = $bindable(),
		messageType = 'warning',
		target = '',
		continueText = 'continue',
		cancelText = 'cancel',
		showIcon = false,
		continueColor = 'primary',
		cancelColor = 'none',
		oncancel = () => {},
		oncontinue = () => {}
	}: Props = $props();

	const handleCancel = () => {
		dialogOpen = false;
		if (oncancel) oncancel();
	};

	const handleContinue = () => {
		dialogOpen = false;
		if (oncontinue) oncontinue();
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
