<script lang="ts">
	import { colorMapStyle } from '$lib/colormaps';
	import type { ColorMapTypes } from '$lib/config/AppConfig';

	export let colorMapName: string;
	export let colorMapType: ColorMapTypes;
	export let isCardStyle = true;
	export let isSelected: boolean;

	let cardStyle: string;

	$: {
		if (colorMapName) setCardStyle();
	}

	const setCardStyle = () => {
		cardStyle = colorMapStyle(colorMapType, colorMapName, isCardStyle);
	};
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div class="card" data-testid="color-map-picker-card-container" tabindex="0">
	<div class="card-content">
		<div class="media">
			<figure
				class={`image ${isCardStyle ? 'is-2by1' : ''} ${isSelected ? '' : 'is-clickable'}`}
				style={cardStyle}
				data-testid="color-map-figure"
			/>
		</div>
	</div>
</div>

<style lang="scss">
	.card-content {
		padding: 5px;
		border: 1px solid transparent;

		.media {
			margin: 0;
			cursor: default;
		}

		.is-clickable {
			cursor: pointer;
		}
	}
</style>
