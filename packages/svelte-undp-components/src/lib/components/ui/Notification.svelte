<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	interface Props {
		type?: 'info' | 'warning' | 'danger' | '';
		showCloseButton?: boolean;
		showIcon?: boolean;
		children?: import('svelte').Snippet;
	}

	let {
		type = $bindable('info'),
		showCloseButton = $bindable(true),
		showIcon = $bindable(true),
		children
	}: Props = $props();

	const dispatch = createEventDispatcher();

	let color = $state('dodgerblue');
	let icon = $state('fa-solid fa-circle-info');
	if (type === 'warning') {
		icon = 'fa-solid fa-triangle-exclamation';
		color = '#ffcc00';
	} else if (type === 'danger') {
		icon = 'fa-solid fa-skull-crossbones';
		color = '#cc3300';
	}

	let nodeRef: HTMLElement | undefined = $state();

	const close = () => {
		if (!nodeRef) return;
		nodeRef.parentNode?.removeChild(nodeRef);
		dispatch('close');
	};
</script>

<div
	data-testid="notification-div"
	bind:this={nodeRef}
	class="notification {`${type !== '' ? `is-${type} is-light` : ''}`} message"
>
	{#if showCloseButton}
		<button class="delete" onclick={close} aria-label="close"></button>
	{/if}
	{#if showIcon}
		<div class="icon">
			<i class="fa-solid {icon} fa-lg" style="color:{color}"></i>
		</div>
	{/if}
	<div class="text">{@render children?.()}</div>
</div>

<style lang="scss">
	.message {
		display: flex;
		justify-content: left;
		align-items: center;
		padding: 10px;
		margin: 0;

		.icon {
			padding-right: 15px;
		}
	}
</style>
