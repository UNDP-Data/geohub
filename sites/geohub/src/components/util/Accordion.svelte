<script lang="ts">
	import { handleEnterKey } from '$lib/helper';

	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let isExpanded = true;

	const getIconSize = () => {
		if (size === 'small') {
			return 'fa-lg';
		} else if (size === 'medium') {
			return 'fa-xl';
		} else if (size === 'large') {
			return 'fa-2xl';
		} else {
			return '';
		}
	};
</script>

<article class="is-flex is-flex-direction-column border">
	<div class="header is-flex pl-2 py-4">
		<div
			class="layer-header is-flex is-align-items-center pr-2"
			role="button"
			tabindex="0"
			on:keydown={handleEnterKey}
			on:click={() => {
				isExpanded = !isExpanded;
			}}
		>
			<div class="toggle-button icon has-text-primary mr-3">
				<i class="fa-solid fa-chevron-{isExpanded ? 'up' : 'down'} {getIconSize()}"></i>
			</div>

			<slot name="header" />
		</div>

		<slot name="header-menu" />
	</div>
	<div class="has-text-dark pb-2" hidden={!isExpanded}>
		<slot name="content" />
	</div>
</article>

<style lang="scss">
	.border {
		border-bottom: 1px #7a7a7a solid;
	}

	.toggle-button {
		border: none;
		background: transparent;
	}

	.header {
		max-height: 60px;
		.layer-header {
			cursor: pointer;
			width: 100%;
		}
	}
</style>
