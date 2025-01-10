<script lang="ts">
	import { handleEnterKey } from '@undp-data/svelte-undp-components';
	import type { Breadcrumb } from '@undp-data/svelte-undp-design';

	interface Props {
		category: Breadcrumb;
		onclick?: () => void;
	}

	let { category, onclick = () => {} }: Props = $props();

	const handleClick = () => {
		if (onclick) onclick();
	};
</script>

{#if category}
	<div
		class="container p-2 is-flex is-flex-direction-column is-justify-content-center"
		role="button"
		tabindex="0"
		onclick={handleClick}
		onkeydown={handleEnterKey}
	>
		<figure class="category image center is-64x64">
			{#if category.icon.startsWith('fa')}
				<i class="{category.icon} fa-4x"></i>
			{:else if category.icon.startsWith('fi')}
				<span class={category.icon}></span>
			{:else if category.icon.startsWith('sdg')}
				<span class="icon is-large sdg-icon">
					<i class={category.icon}></i>
				</span>
			{:else}
				<img class="logo-image" src={category.icon} alt="{category.name}_image" />
			{/if}
		</figure>
		{#if category.name}
			<p class="category title is-6 center pt-2 has-text-weight-semibold">
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

			.sdg-icon {
				width: 64px;
				height: 64px;
			}
		}

		.center {
			text-align: center;
			display: block;
			margin: 0 auto;
		}
	}
</style>
