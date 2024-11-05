<script context="module" lang="ts">
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
	import { handleEnterKey } from '$lib/util/handleEnterKey.js';

	import { initTooltipTippy } from '$lib/util/initTippy.js';

	export let button: MenuButtonType;
	export let subButtons: MenuSubButtonType[] | undefined = undefined;
	export let color: 'primary' | 'link' | 'info' | 'warning' | 'danger' | 'success' | '' = 'primary';

	let isButtonHovered = false;

	const tippyTooltip = initTooltipTippy();
</script>

{#if subButtons && subButtons.length > 0}
	<div
		role="menu"
		tabindex="-1"
		class="dropdown is-right {isButtonHovered ? 'is-active' : ''}"
		on:mouseleave={() => (isButtonHovered = false)}
	>
		<div class="dropdown-trigger">
			<a
				class="button {color ? `is-${color}` : ''} is-uppercase has-text-weight-bold"
				aria-haspopup="true"
				aria-controls="hero-header-dropdown-menu"
				href={button.href}
				use:tippyTooltip={{ content: button.tooltip }}
				on:mouseenter={() => (isButtonHovered = true)}
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
			on:mouseleave={() => (isButtonHovered = false)}
		>
			<div class="dropdown-content">
				{#each subButtons as btn}
					{#if btn.callback}
						<!-- svelte-ignore a11y-missing-attribute -->
						<a
							class="dropdown-item"
							role="menuitem"
							tabindex="0"
							use:tippyTooltip={{ content: btn.tooltip }}
							on:click={() => {
								if (btn.callback) {
									btn.callback(btn);
								}
							}}
							on:keydown={handleEnterKey}
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
