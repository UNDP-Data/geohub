<script lang="ts">
	import { clean, handleEnterKey, initTooltipTippy } from '$lib/helper';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let title: string;
	export let isExpanded: boolean;

	const tippyTooltip = initTooltipTippy();

	$: isExpanded, handleToggleChanged();
	const handleToggleChanged = () => {
		dispatch('toggled', {
			isExpanded: isExpanded
		});
	};
</script>

<div class="header is-flex py-4 {isExpanded ? '' : 'border'}">
	<span
		class="accordion-title is-size-6 has-text-grey-dark mr-3"
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
		{clean(title)}
	</span>

	<slot name="buttons" />
</div>

<div class="border pb-2" hidden={!isExpanded}>
	<slot name="content" />
</div>

<style lang="scss">
	.border {
		border-bottom: 1px #d4d6d8 solid;
	}

	.header {
		max-height: 60px;

		.accordion-title {
			cursor: pointer;
			width: 100%;
			overflow: hidden;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 1;
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
</style>
