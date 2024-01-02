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

<article class="is-flex is-flex-direction-column border">
	<div class="header is-flex py-4">
		<div
			class="is-flex is-align-items-center toggle"
			role="button"
			tabindex="0"
			on:keydown={handleEnterKey}
			on:click={() => {
				isExpanded = !isExpanded;
			}}
		>
			<div class="mr-3">
				<i class="fa-solid fa-chevron-{isExpanded ? 'up' : 'down'} has-text-primary"></i>
			</div>

			<span
				class="accordion-title is-size-6 has-text-grey-dark mr-3"
				use:tippyTooltip={{ content: title }}
			>
				{clean(title)}
			</span>
		</div>

		<slot name="buttons" />
	</div>
	<div class="pb-2" hidden={!isExpanded}>
		<slot name="content" />
	</div>
</article>

<style lang="scss">
	.border {
		border-bottom: 1px #d4d6d8 solid;
	}

	.header {
		max-height: 60px;

		.toggle {
			cursor: pointer;
			width: 100%;
		}
	}

	.accordion-title {
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		word-break: break-all;
	}
</style>
