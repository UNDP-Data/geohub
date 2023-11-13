<script lang="ts">
	import ColorMapPickerCard from '$components/util/ColorMapPickerCard.svelte';
	import { DivergingColorMaps, QualitativeColorMaps, SequentialColormaps } from '$lib/colormaps';
	import { ColorMapTypes } from '$lib/config/AppConfig';
	import { handleEnterKey, initTippy } from '$lib/helper';
	import { Checkbox, type Tab } from '@undp-data/svelte-undp-design';
	import chroma from 'chroma-js';
	import { createEventDispatcher } from 'svelte';
	import Tabs from '$components/util/Tabs.svelte';

	const tippy = initTippy();
	let tooltipContent: HTMLElement;

	export let colorMapName: string;
	export let isFullWidth = true;
	export let buttonWidth = 40;

	let isReverseColors = colorMapName.indexOf('_r') !== -1;

	const dispatch = createEventDispatcher();
	const colorMapTypes = [
		{ name: ColorMapTypes.SEQUENTIAL, codes: SequentialColormaps },
		{ name: ColorMapTypes.DIVERGING, codes: DivergingColorMaps },
		{ name: ColorMapTypes.QUALITATIVE, codes: QualitativeColorMaps }
	];

	export let activeColorMapType: string =
		colorMapTypes
			.map((type) =>
				type.codes.find((code) => code === colorMapName.replace('_r', '')) ? type.name : null
			)
			.find((name) => name !== null) || colorMapTypes[0].name;

	let tabs: Tab[] = colorMapTypes.map((type) => {
		return { label: type.name, id: type.name };
	});

	const handleColorMapClick = (cmName: string) => {
		//the lines below if removed will break  all the components that use this component and bind
		// two ways the colormap
		// i recommend using the evend instead and bind the colormap one way only

		if (isReverseColors) {
			cmName = `${cmName}_r`;
		}

		if (cmName !== colorMapName) {
			colorMapName = cmName;
		}

		dispatch('colorMapChanged', { colorMapName: cmName });
	};

	let colorMapStyle = '';
	const getColorMapStyle = () => {
		let width = buttonWidth;
		if (!isFullWidth) {
			width = 40;
		}
		const isReverse = colorMapName.indexOf('_r') !== -1;
		let colorMap = chroma.scale(colorMapName.replace('_r', '')).mode('lrgb').colors(5, 'rgba');
		if (isReverse) {
			colorMap = colorMap.reverse();
		}
		colorMapStyle = `height: 32px; width:${width}px; background: linear-gradient(90deg, ${colorMap});`;
	};
	$: colorMapName, getColorMapStyle();
	$: buttonWidth, getColorMapStyle();

	const handleReverseColorsChanged = () => {
		const isReverse = colorMapName.indexOf('_r') !== -1;
		if (isReverse) {
			colorMapName = colorMapName.replace('_r', '');
		} else {
			colorMapName = `${colorMapName}_r`;
		}
		dispatch('colorMapChanged', { colorMapName: colorMapName });
	};
</script>

<button
	class="button {isFullWidth ? 'is-fullwidth' : ''}  p-0"
	use:tippy={{ content: tooltipContent }}
	bind:clientWidth={buttonWidth}
>
	<span class="media">
		{#key isReverseColors}
			<figure class="image" style={colorMapStyle} data-testid="color-map-figure" />
		{/key}
	</span>
</button>

<div bind:this={tooltipContent} data-testid="color-map-picker" class="tooltip p-2">
	<Tabs
		bind:tabs
		bind:activeTab={activeColorMapType}
		on:tabChange={(e) => (activeColorMapType = e.detail)}
	/>

	<button class="delete close is-radiusless"></button>

	<div class="card-color">
		{#key isReverseColors}
			{#each colorMapTypes as colorMapType}
				{#if activeColorMapType === colorMapType.name}
					{#each colorMapType.codes.sort((a, b) => a.localeCompare(b)) as cmName}
						<div
							class="card {colorMapName.replace('_r', '') === cmName ? 'selected' : ''}"
							role="button"
							tabindex="0"
							on:click={() => handleColorMapClick(cmName)}
							on:keydown={handleEnterKey}
						>
							<ColorMapPickerCard
								colorMapName={cmName}
								colorMapType={ColorMapTypes.SEQUENTIAL}
								isSelected={colorMapName.replace('_r', '') === cmName}
								bind:isReverseColors
							/>
						</div>
					{/each}
				{/if}
			{/each}
		{/key}
	</div>

	<div class="mt-2">
		<Checkbox
			label="Reverse colors"
			bind:checked={isReverseColors}
			on:clicked={handleReverseColorsChanged}
		/>
	</div>
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

	.button {
		border-top: none;
		border-bottom: none;
	}

	.tooltip {
		font-size: 13px;
		z-index: 10;
		width: 300px;
	}

	.close {
		position: absolute;
		top: 5px;
		right: 5px;
	}

	.card-color {
		max-height: 160px;
		overflow-y: auto;

		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 5px;

		.card {
			cursor: pointer;
			padding: 1px;

			&:hover {
				padding: 0;
				border: 1px solid hsl(204, 86%, 53%);
			}

			&.selected {
				padding: 0;
				border: 2px solid hsl(141, 53%, 53%);
			}
		}
	}
</style>
