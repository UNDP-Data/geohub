<script lang="ts">
	import { clean } from '$lib/util/clean.js';
	import { handleEnterKey } from '$lib/util/handleEnterKey.js';
	import { initTooltipTippy } from '$lib/util/initTippy.js';

	interface Props {
		title: string;
		isExpanded?: boolean;
		showExpand?: boolean;
		headerHeight?: number;
		showClose?: boolean;
		children?: import('svelte').Snippet;
		onclose?: () => void;
	}

	let {
		title = $bindable(),
		isExpanded = $bindable(true),
		showExpand = $bindable(true),
		headerHeight = $bindable(48),
		showClose = $bindable(true),
		children
	}: Props = $props();

	const tippyTooltip = initTooltipTippy();
</script>

<div class="floating-panel">
	<div
		class="header {showExpand
			? 'cursor'
			: ''} has-background-light is-flex is-align-items-center px-3"
		bind:clientHeight={headerHeight}
	>
		<div
			class="header-title is-size-6 my-4 pr-2"
			role="button"
			tabindex="0"
			onclick={() => {
				if (!showExpand) return;
				isExpanded = !isExpanded;
			}}
			onkeydown={handleEnterKey}
		>
			{clean(title)}
		</div>
		{#if showExpand || showClose}
			<div class="header-buttons is-flex is-align-items-center ml-auto">
				{#if showExpand}
					<button
						class="button chevron-button {isExpanded ? 'is-expanded' : ''} px-2"
						onclick={() => {
							isExpanded = !isExpanded;
						}}
						use:tippyTooltip={{ content: isExpanded ? 'Collapse' : 'Expand' }}
						aria-label="expand"
					>
						<span class="icon is-small">
							<i class="fa-solid fa-chevron-down"></i>
						</span>
					</button>
				{/if}
				{#if showClose}
					<button
						class="button pr-2"
						onclick={onclose}
						use:tippyTooltip={{ content: 'Close' }}
						aria-label="close"
					>
						<span class="icon is-small">
							<i class="fas fa-xmark"></i>
						</span>
					</button>
				{/if}
			</div>
		{/if}
	</div>
	<div class="contents" hidden={!isExpanded}>
		{@render children?.()}
	</div>
</div>

<style lang="scss">
	.floating-panel {
		background-color: white;

		.header {
			&.cursor {
				cursor: pointer;
			}

			.header-title {
				width: 100%;
				overflow: hidden;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 1;
				word-break: break-all;
				line-height: 1;
			}

			.header-buttons {
				.chevron-button {
					-webkit-transition: all 0.3s ease;
					-moz-transition: all 0.3s ease;
					-ms-transition: all 0.3s ease;
					-o-transition: all 0.3s ease;
					transition: all 0.3s ease;

					&.is-expanded {
						transform: rotate(-180deg);
						-webkit-transform: rotate(-180deg);
						-moz-transform: rotate(-180deg);
						-ms-transform: rotate(-180deg);
						-o-transform: rotate(-180deg);
						transition: rotateZ(-180deg);
					}
				}
				.button {
					border: none;
					background: transparent;
					box-shadow: none;
				}
			}
		}
	}
</style>
