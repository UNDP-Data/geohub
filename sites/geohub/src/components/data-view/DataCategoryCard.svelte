<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	import { handleEnterKey } from '$lib/helper';
	import type { Breadcrumb } from '@undp-data/svelte-undp-design';

	export let category: Breadcrumb;
	export let size: 'small' | 'medium' = 'medium';

	const handleClick = () => {
		dispatch('clicked');
	};
</script>

{#if category}
	<div
		class="container p-2 is-flex is-flex-direction-column is-justify-content-center"
		role="button"
		tabindex="0"
		on:click={handleClick}
		on:keydown={handleEnterKey}
	>
		<figure class="category image center {size === 'medium' ? 'is-64x64' : 'is-48x48'}">
			{#if category.icon.startsWith('fa')}
				<i class="{category.icon} fa-4x" />
			{:else if category.icon.startsWith('fi')}
				<span class={category.icon} />
			{:else}
				<img class="logo-image" src={category.icon} alt="{category.name}_image" />
			{/if}
		</figure>
		{#if category.name}
			<p
				class="category {`${
					size === 'medium' ? 'title is-5' : 'subtitle is-6 '
				}`} center pt-2 has-text-weight-bold"
			>
				{category.name}
			</p>
		{/if}
	</div>
{/if}

<style lang="scss">
	.container {
		.category {
			cursor: pointer;

			.logo-image {
				max-height: 64px !important;
			}

			.fi {
				width: 64px !important;
				height: 64px !important;
				line-height: 2em !important;
			}
		}

		.center {
			text-align: center;
			display: block;
			margin: 0 auto;
		}
	}
</style>
