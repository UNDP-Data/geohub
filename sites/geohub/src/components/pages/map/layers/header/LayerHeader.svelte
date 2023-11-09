<script lang="ts">
	import { AccessLevel } from '$lib/config/AppConfig';
	import { clean, getAccessLevelIcon } from '$lib/helper';
	import type { Layer } from '$lib/types';

	export let layer: Layer;
	export let isVisible = true;

	const accessIcon = getAccessLevelIcon(
		layer.dataset.properties.access_level ?? AccessLevel.PUBLIC,
		true
	);
</script>

<div class="layer-header is-flex is-align-items-center">
	<button
		class="button toggle-button mr-1"
		on:click={() => {
			isVisible = !isVisible;
		}}
	>
		<span class="icon has-text-primary">
			<i class="fa-solid fa-chevron-{isVisible ? 'up' : 'down'} fa-xl"></i>
		</span>
	</button>

	{#if accessIcon}
		<i class="{accessIcon} fa-2xl px-2" />
	{/if}

	<span class="layer-name is-size-6">
		{clean(layer.name)}
	</span>
</div>

<style lang="scss">
	.layer-header {
		.layer-name {
			align-items: center;

			overflow: hidden;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
		}

		.toggle-button {
			border: none;
			background: transparent;
		}
	}
</style>
