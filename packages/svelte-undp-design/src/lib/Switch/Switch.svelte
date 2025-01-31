<script lang="ts">
	interface Props {
		/**
		 * State of toggle
		 */
		toggled?: boolean;
		/**
		 * Size of switch control
		 */
		size?: 'default' | 'small';
		/**
		 * Disable control
		 */
		disabled?: boolean;
		/**
		 * Show icon on switch control if enabled
		 */
		showIcon?: boolean;
		/**
		 * if label is provided, it is shown on the above of switch control
		 */
		label?: string;
		/**
		 * If enabled, it shows value text on the right hand side of control
		 */
		showValue?: boolean;
		/**
		 * Value label for toggled state. Default is on
		 */
		toggledText?: string;
		/**
		 * Value label for untoggled state. Default is Off
		 */
		untoggledText?: string;

		onchange?: (toggled: boolean) => void;
	}

	let {
		toggled = $bindable(false),
		size = 'default',
		disabled = false,
		showIcon = false,
		label = '',
		showValue = false,
		toggledText = 'On',
		untoggledText = 'Off',
		onchange = () => {}
	}: Props = $props();

	const handleClicked = (e: { preventDefault: () => void }) => {
		if (disabled) {
			e.preventDefault();
			return;
		}
		toggled = !toggled;
		if (onchange) onchange(toggled);
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (!disabled && event.key === 'Enter') {
			toggled = !toggled;
			if (onchange) onchange(toggled);
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
			type="button"
			tabindex="0"
			aria-label={label}
			aria-pressed={toggled ? 'true' : 'false'}
			{disabled}
			onclick={handleClicked}
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
				onclick={handleClicked}
				onkeydown={handleKeyDown}
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
