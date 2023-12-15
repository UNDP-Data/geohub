<script lang="ts">
	import { clean } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import VisibilityButton from './header/VisibilityButton.svelte';

	export let layer: Layer;
</script>

<article class="layer is-flex is-flex-direction-column border is-small">
	<div class="header is-flex pl-2 py-4">
		<div class="layer-header is-flex is-align-items-center pr-2">
			<slot name="legend" />
			<span class="layer-name has-text-weight-bold is-size-6 pl-1">
				{clean(layer.name)}
			</span>
		</div>

		<div class="is-flex is-align-items-center">
			<VisibilityButton {layer} />
		</div>
	</div>
	<div class="has-text-dark pb-2">
		<slot name="content" />
	</div>
</article>

<style lang="scss">
	.layer {
		width: 300px;

		&.border {
			border-bottom: 1px #7a7a7a solid;
		}

		.header {
			max-height: 60px;
			.layer-header {
				width: 100%;

				.layer-name {
					align-items: center;

					overflow: hidden;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
				}
			}
		}
	}
</style>
