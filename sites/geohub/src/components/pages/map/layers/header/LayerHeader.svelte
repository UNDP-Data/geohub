<script lang="ts">
	import { AccessLevel } from '$lib/config/AppConfig';
	import { clean, getAccessLevelIcon, handleEnterKey } from '$lib/helper';
	import type { Layer } from '$lib/types';

	export let layer: Layer;
	export let isVisible = true;

	const accessIcon = getAccessLevelIcon(
		layer.dataset.properties.access_level ?? AccessLevel.PUBLIC,
		true
	);
</script>

<div
	class="layer-header is-flex is-align-items-center"
	role="button"
	tabindex="0"
	on:keydown={handleEnterKey}
	on:click={() => {
		isVisible = !isVisible;
	}}
>
	<div class="toggle-button icon has-text-primary mr-2">
		<i class="fa-solid fa-chevron-{isVisible ? 'up' : 'down'} fa-2xl"></i>
	</div>

	{#if accessIcon}
		<i class="{accessIcon} fa-2xl px-2" />
	{/if}

	<span class="layer-name is-size-6 mr-1">
		{clean(layer.name)}
	</span>
</div>

<style lang="scss">
	.layer-header {
		cursor: pointer;

		.layer-name {
			align-items: center;

			overflow: hidden;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
		}
	}
</style>
