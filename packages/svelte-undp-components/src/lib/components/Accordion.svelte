<script lang="ts">
	import { clean } from '$lib/util/clean.js';
	import { handleEnterKey } from '$lib/util/handleEnterKey.js';
	import { initTooltipTippy } from '$lib/util/initTippy.js';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let title: string;
	export let isExpanded: boolean;
	export let isSelected = false;
	export let showHoveredColor = false;

	const tippyTooltip = initTooltipTippy();

	let isHovered = false;

	$: isExpanded, handleToggleChanged();
	const handleToggleChanged = () => {
		dispatch('toggled', {
			isExpanded: isExpanded
		});
	};
</script>

<div
	class="accordion px-4 {`${
		showHoveredColor
			? `${
					isSelected
						? 'has-background-light border-transparent'
						: `${isHovered ? 'has-background-white-bis border-transparent' : 'border'}`
				}`
			: 'border'
	}`}"
	role="menuitem"
	tabindex="-1"
	on:mouseenter={() => {
		isHovered = true;
	}}
	on:mouseleave={() => {
		isHovered = false;
	}}
>
	<div class="header is-flex is-align-items-center py-4">
		<span
			class="accordion-title is-size-6 mr-3"
			use:tippyTooltip={{ content: title }}
			role="button"
			tabindex="0"
			on:keydown={handleEnterKey}
			on:click={() => {
				isExpanded = !isExpanded;
			}}
		>
			<span class="mr-2">
				<i
					class="fa-solid fa-chevron-down toggle-icon {isExpanded ? 'active' : ''} has-text-primary"
				/>
			</span>
			<span class="has-text-grey-dark">{clean(title)}</span>
		</span>

		<slot name="buttons" />
	</div>

	<div class="content pb-2" hidden={!isExpanded}>
		<slot name="content" />
	</div>
</div>

<style lang="scss">
	$primary: #d12800;

	.accordion {
		.header {
			max-height: 60px;

			.accordion-title {
				cursor: pointer;
				width: 100%;

				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
				word-break: break-all;
			}

			.toggle-icon {
				-webkit-transition: all 0.3s ease;
				-moz-transition: all 0.3s ease;
				-ms-transition: all 0.3s ease;
				-o-transition: all 0.3s ease;
				transition: all 0.3s ease;

				&.active {
					transform: rotate(-180deg);
					-webkit-transform: rotate(-180deg);
					-moz-transform: rotate(-180deg);
					-ms-transform: rotate(-180deg);
					-o-transform: rotate(-180deg);
					transition: rotateZ(-180deg);
				}
			}
		}

		&.border {
			// border-right: 1px rgba(255, 255, 255, 0) solid;
			// border-left: 1px rgba(255, 255, 255, 0) solid;
			// border-bottom: 1px rgba(255, 255, 255, 0) solid;
			border-bottom: 1px #d4d6d8 solid;
		}
		&.border-transparent {
			border-bottom: 1px rgba(255, 255, 255, 0) solid;
		}
		// &.border-primary {
		// 	border-right: 1px $primary solid;
		// 	border-left: 1px $primary solid;
		// 	border-bottom: 1px $primary solid;
		// 	border-top: 1px $primary solid;
		// }
	}
</style>
