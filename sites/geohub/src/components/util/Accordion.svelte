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
			<div class="toggle-button has-text-primary mr-3 {isExpanded ? 'is-expanded' : ''}">
				<i class="fa-solid fa-chevron-down"></i>
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
	<div class="has-text-dark pb-2" hidden={!isExpanded}>
		<slot name="content" />
	</div>
</article>

<style lang="scss">
	.border {
		border-bottom: 1px #d4d6d8 solid;
	}

	.toggle-button {
		border: none;
		background: transparent;
	}

	.toggle-button {
		-webkit-transition: all 0.3s ease;
		-moz-transition: all 0.3s ease;
		-ms-transition: all 0.3s ease;
		-o-transition: all 0.3s ease;
		transition: all 0.3s ease;

		&.is-expanded {
			-webkit-transform: rotate(-180deg);
			-moz-transform: rotate(-180deg);
			-ms-transform: rotate(-180deg);
			-o-transform: rotate(-180deg);
			transition: rotateZ(-180deg);
		}
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
