<script module lang="ts">
	/**
	 * Colormap types
	 */
	export enum ColorMapTypes {
		SEQUENTIAL = 'sequential',
		DIVERGING = 'diverging',
		QUALITATIVE = 'qualitative'
	}

	/**
	 * The list of sequential colormaps
	 */
	export const SequentialColormaps = [
		'pubu',
		'ylgn',
		'greys',
		'rdpu',
		'pubugn',
		'oranges',
		'gnbu',
		'purples',
		'blues',
		'bugn',
		'reds',
		'ylorbr',
		'ylgnbu',
		'viridis',
		'orrd',
		'greens',
		'bupu'
	];

	/**
	 * The list of diverging colormaps
	 */
	export const DivergingColorMaps = [
		'rdgy',
		'spectral',
		'puor',
		'piyg',
		'brbg',
		'prgn',
		'rdbu',
		'rdylbu',
		'rdylgn'
	];

	/**
	 * The list of qualitative colormaps
	 */
	export const QualitativeColorMaps = [
		'accent',
		'set1',
		'set2',
		'set3',
		'pastel2',
		'pastel1',
		'dark2',
		'paired'
	];

	/**
	 * Returns an style based on a color map name
	 * @param colorMapType Color map type (e.x.:  sequential, diverging, qualitative)
	 * @param colorMapName Color map name (e.x.: viridis)
	 * @param isCardStyle Card style (card or list)
	 * @returns string
	 */
	export const colorMapStyle = (
		colorMapType: ColorMapTypes,
		colorMapName: string,
		isCardStyle: boolean,
		isReverseColors = false
	) => {
		let colorMap = [];
		let style = '';
		const numberOfClasses = 5;
		if (colorMapType === ColorMapTypes.SEQUENTIAL) {
			colorMap = chroma
				.scale(colorMapName)
				.mode('lrgb')
				.padding([0.25, 0]) // this is necessary to create better looking color ramps graphics
				.colors(numberOfClasses, 'rgba');
		} else {
			colorMap = chroma.scale(colorMapName).mode('lrgb').colors(numberOfClasses, 'rgba');
		}

		if (isReverseColors) {
			colorMap = colorMap.reverse();
		}

		if (isCardStyle) {
			style = `height: calc(1px * 30); width: 100%; background: linear-gradient(90deg, ${colorMap});`;
		} else {
			style = `height: 15px; width:250px; background: linear-gradient(90deg, ${colorMap}); cursor: default !important;`;
		}

		return style;
	};
</script>

<script lang="ts">
	import chroma from 'chroma-js';

	interface Props {
		colorMapName: string;
		colorMapType: ColorMapTypes;
		isCardStyle?: boolean;
		isSelected: boolean;
		isReverseColors?: boolean;
	}

	let {
		colorMapName = $bindable(),
		colorMapType = $bindable(),
		isCardStyle = $bindable(true),
		isSelected = $bindable(),
		isReverseColors = $bindable(false)
	}: Props = $props();

	let cardStyle: string = $state('');

	const setCardStyle = () => {
		cardStyle = colorMapStyle(colorMapType, colorMapName, isCardStyle, isReverseColors);
	};
	$effect(() => {
		if (colorMapName) setCardStyle();
	});
</script>

<div class="card" data-testid="color-map-picker-card-container">
	<div class="card-content">
		<div class="media">
			<div
				class={isSelected ? '' : 'is-clickable'}
				style={cardStyle}
				data-testid="color-map-figure"
				aria-label="color-map-card"
			></div>
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
