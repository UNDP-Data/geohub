<script lang="ts">
	import { clean } from '$lib/util/clean.js';
	import { handleEnterKey } from '$lib/util/handleEnterKey.js';
	import { initTooltipTippy } from '$lib/util/initTippy.js';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let title: string;
	export let isExpanded = true;
	export let showExpand = true;
	export let headerHeight = 48;
	export let showClose = true;

	const tippyTooltip = initTooltipTippy();

	const handleClose = () => {
		dispatch('close');
	};
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
			on:click={() => {
				if (!showExpand) return;
				isExpanded = !isExpanded;
			}}
			on:keydown={handleEnterKey}
		>
			{clean(title)}
		</div>
		{#if showExpand || showClose}
			<div class="header-buttons is-flex is-align-items-center ml-auto">
				{#if showExpand}
					<button
						class="button chevron-button {isExpanded ? 'is-expanded' : ''} px-2"
						on:click={() => {
							isExpanded = !isExpanded;
						}}
						use:tippyTooltip={{ content: isExpanded ? 'Collapse' : 'Expand' }}
					>
						<span class="icon is-small">
							<i class="fa-solid fa-chevron-down"></i>
						</span>
					</button>
				{/if}
				{#if showClose}
					<button
						class="button pr-2"
						on:click={handleClose}
						use:tippyTooltip={{ content: 'Close' }}
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
		<slot />
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
