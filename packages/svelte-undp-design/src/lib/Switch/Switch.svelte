<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	/**
	 * State of toggle
	 */
	export let toggled = false;

	/**
	 * Size of switch control
	 */
	export let size: 'default' | 'small' = 'default';

	/**
	 * Disable control
	 */
	export let disabled = false;

	/**
	 * Show icon on switch control if enabled
	 */
	export let showIcon = false;

	/**
	 * if label is provided, it is shown on the above of switch control
	 */
	export let label = '';

	/**
	 * If enabled, it shows value text on the right hand side of control
	 */
	export let showValue = false;

	/**
	 * Value label for toggled state. Default is on
	 */
	export let toggledText = 'On';

	/**
	 * Value label for untoggled state. Default is Off
	 */
	export let untoggledText = 'Off';

	const handleClicked = (e: { preventDefault: () => void }) => {
		if (disabled) {
			e.preventDefault();
			return;
		}
		toggled = !toggled;
		dispatch('change');
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (!disabled && event.key === 'Enter') {
			toggled = !toggled;
			dispatch('change');
		}
	};
</script>

<div
	class="switch switch--{size} switch--{disabled ? 'disabled' : 'default'} switch--{toggled
		? 'toggled'
		: 'untoggled'}"
>
	{#if label}
		<div class="switch__label">{label}</div>
	{/if}
	<div class="switch__wrapper">
		<button
			class="switch__track"
			tabindex="0"
			aria-label={label}
			aria-pressed={toggled ? 'true' : 'false'}
			{disabled}
			on:click={handleClicked}
		>
			{#if showIcon}
				<div class="switch__icon"></div>
			{/if}
			<div class="switch__thumb"></div>
		</button>
		{#if showValue}
			<span
				class="switch__value"
				role="button"
				tabindex="-1"
				on:click={handleClicked}
				on:keydown={handleKeyDown}
			>
				{toggled ? toggledText : untoggledText}
			</span>
		{/if}
	</div>
</div>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/switch.min.css';
</style>
