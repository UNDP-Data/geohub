<script module lang="ts">
	export interface MenuButtonType {
		title: string;
		href: string;
		tooltip: string;
	}

	export interface MenuSubButtonType {
		title: string;
		href: string;
		tooltip: string;
		callback?: (button: MenuSubButtonType) => void;
	}
</script>

<script lang="ts">
	import { handleEnterKey } from '$lib/util/handleEnterKey';

	import { initTooltipTippy } from '$lib/util/initTippy';

	interface Props {
		button: MenuButtonType;
		subButtons?: MenuSubButtonType[] | undefined;
		color?: 'primary' | 'link' | 'info' | 'warning' | 'danger' | 'success' | '';
	}

	let { button = $bindable(), subButtons = $bindable(), color = 'primary' }: Props = $props();

	let isButtonHovered = $state(false);

	const tippyTooltip = initTooltipTippy();
</script>

{#if subButtons && subButtons.length > 0}
	<div
		role="menu"
		tabindex="-1"
		class="dropdown is-right {isButtonHovered ? 'is-active' : ''}"
		onmouseleave={() => (isButtonHovered = false)}
	>
		<div class="dropdown-trigger">
			<a
				class="button {color ? `is-${color}` : ''} is-uppercase has-text-weight-bold"
				aria-haspopup="true"
				aria-controls="hero-header-dropdown-menu"
				href={button.href}
				use:tippyTooltip={{ content: button.tooltip }}
				onmouseenter={() => (isButtonHovered = true)}
			>
				<span>{button.title}</span>
				<span class="icon is-small">
					<i class="fas fa-angle-down" aria-hidden="true"></i>
				</span>
			</a>
		</div>
		<div
			tabindex="-1"
			class="dropdown-menu"
			id="hero-header-dropdown-menu"
			role="menu"
			onmouseleave={() => (isButtonHovered = false)}
		>
			<div class="dropdown-content">
				{#each subButtons as btn}
					{#if btn.callback}
						<!-- svelte-ignore a11y_missing_attribute -->
						<a
							class="dropdown-item"
							role="menuitem"
							tabindex="0"
							use:tippyTooltip={{ content: btn.tooltip }}
							onclick={() => {
								if (btn.callback) {
									btn.callback(btn);
								}
							}}
							onkeydown={handleEnterKey}
						>
							{btn.title}
						</a>
					{:else}
						<a href={btn.href} class="dropdown-item" use:tippyTooltip={{ content: btn.tooltip }}>
							{btn.title}
						</a>
					{/if}
				{/each}
			</div>
		</div>
	</div>
{:else}
	<a
		class="button is-primary is-uppercase has-text-weight-bold"
		href={button.href}
		use:tippyTooltip={{ content: button.tooltip }}
	>
		{button.title}
	</a>
{/if}
