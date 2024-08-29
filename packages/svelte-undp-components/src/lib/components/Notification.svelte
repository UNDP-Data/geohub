<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let type: 'info' | 'warning' | 'danger' | '' = 'info';
	export let showCloseButton = true;
	export let showIcon = true;

	const dispatch = createEventDispatcher();

	let color = 'dodgerblue';
	let icon = 'fa-solid fa-circle-info';
	if (type === 'warning') {
		icon = 'fa-solid fa-triangle-exclamation';
		color = '#ffcc00';
	} else if (type === 'danger') {
		icon = 'fa-solid fa-skull-crossbones';
		color = '#cc3300';
	}

	let nodeRef: HTMLElement;

	const close = () => {
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
		<button class="delete" on:click={close} />
	{/if}
	{#if showIcon}
		<div class="icon">
			<i class="fa-solid {icon} fa-lg" style="color:{color}" />
		</div>
	{/if}
	<div class="text"><slot /></div>
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
