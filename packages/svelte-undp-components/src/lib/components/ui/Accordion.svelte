<script lang="ts">
	import { clean } from '$lib/util/clean';
	import { handleEnterKey } from '$lib/util/handleEnterKey';
	import { initTooltipTippy } from '$lib/util/initTippy';

	interface Props {
		title: string;
		isExpanded: boolean;
		isSelected?: boolean;
		showHoveredColor?: boolean;
		isUppercase?: boolean;
		removeExtension?: boolean;
		padding?: string;
		buttons?: import('svelte').Snippet;
		content?: import('svelte').Snippet;
		ontoggle?: (isExpanded: boolean) => void;
	}

	let {
		title = $bindable(),
		isExpanded = $bindable(),
		isSelected = false,
		showHoveredColor = false,
		isUppercase = true,
		removeExtension = false,
		padding = 'px-4',
		buttons,
		content,
		ontoggle = () => {}
	}: Props = $props();

	const tippyTooltip = initTooltipTippy();

	let isHovered = $state(false);

	const handleToggleChanged = () => {
		if (ontoggle) ontoggle(isExpanded);
	};
</script>

<div
	class="accordion {padding} {`${
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
	onmouseenter={() => {
		isHovered = true;
	}}
	onmouseleave={() => {
		isHovered = false;
	}}
>
	<div class="header is-flex is-align-items-center py-4">
		<span
			class="accordion-title is-size-6 mr-3"
			use:tippyTooltip={{ content: title }}
			role="button"
			tabindex="0"
			onkeydown={handleEnterKey}
			onclick={() => {
				isExpanded = !isExpanded;
				handleToggleChanged();
			}}
		>
			<span class="mr-2">
				<i
					class="fa-solid fa-chevron-down toggle-icon {isExpanded ? 'active' : ''} has-text-primary"
				></i>
			</span>
			<span class="has-text-grey-dark">{clean(title, isUppercase, removeExtension)}</span>
		</span>

		{@render buttons?.()}
	</div>

	<div class="content pb-2" hidden={!isExpanded}>
		{@render content?.()}
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
