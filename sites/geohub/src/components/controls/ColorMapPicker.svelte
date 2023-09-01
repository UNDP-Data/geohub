<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import ColorMapPickerCard from '$components/controls/ColorMapPickerCard.svelte';
	import { DivergingColorMaps, QualitativeColorMaps, SequentialColormaps } from '$lib/colormaps';
	import { ColorMapTypes } from '$lib/config/AppConfig';
	import { handleEnterKey, initTippy } from '$lib/helper';
	import { Tabs, type Tab } from '@undp-data/svelte-undp-design';
	import chroma from 'chroma-js';

	const tippy = initTippy();
	let tooltipContent: HTMLElement;

	export let colorMapName: string;

	export let buttonWidth = 40;

	const dispatch = createEventDispatcher();
	const colorMapTypes = [
		{ name: ColorMapTypes.SEQUENTIAL, codes: SequentialColormaps },
		{ name: ColorMapTypes.DIVERGING, codes: DivergingColorMaps },
		{ name: ColorMapTypes.QUALITATIVE, codes: QualitativeColorMaps }
	];

	export let activeColorMapType =
		colorMapTypes
			.map((type) => (type.codes.find((code) => code === colorMapName) ? type.name : null))
			.find((name) => name !== null) || colorMapTypes[0].name;

	let tabs: Tab[] = colorMapTypes.map((type) => {
		return { label: type.name };
	});

	const handleColorMapClick = (cmName: string) => {
		//the lines below if removed will break  all the components that use this component and bind
		// two ways the colormap
		// i recommend using the evend instead and bind the colormap one way only
		if (cmName !== colorMapName) {
			colorMapName = cmName;
		}

		dispatch('colorMapChanged', { colorMapName: cmName });
	};

	let colorMapStyle = '';
	const getColorMapStyle = () => {
		const colorMap = chroma.scale(colorMapName).mode('lrgb').colors(5, 'rgba');
		colorMapStyle = `height: 20px; width:${buttonWidth}px; background: linear-gradient(90deg, ${colorMap});`;
	};
	$: colorMapName, getColorMapStyle();
	$: buttonWidth, getColorMapStyle();
</script>

<div
	role="button"
	class="colormap-button box m-0 py-1 px-2 is-flex is-flex-direction-column is-align-items-center"
	aria-label="Open Color Scheme Picker"
	tabindex="0"
	use:tippy={{ content: tooltipContent }}
	data-testid="colormap-toggle-container"
>
	<div class="media">
		<figure class={`image`} style={colorMapStyle} data-testid="color-map-figure" />
	</div>
	<p class="subtitle is-6">{colorMapName}</p>
</div>

<div bind:this={tooltipContent} data-testid="color-map-picker" class="tooltip p-2">
	<div class="columns is-vcentered is-mobile">
		<div class="column is-11">
			<Tabs bind:tabs bind:activeTab={activeColorMapType} />
		</div>
		<div
			role="button"
			tabindex="0"
			class="column is-1 close"
			title="Close Colormap Picker"
			on:keydown={handleEnterKey}
		>
			<i class="fa-solid fa-xmark" />
		</div>
	</div>
	<div class="columns">
		<div class="column card-color">
			<ul class="is-size-6">
				{#each colorMapTypes as colorMapType}
					{#if activeColorMapType === colorMapType.name}
						{#each colorMapType.codes.sort((a, b) => a.localeCompare(b)) as cmName}
							<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
							<li on:click={() => handleColorMapClick(cmName)} on:keydown={handleEnterKey}>
								<ColorMapPickerCard
									colorMapName={cmName}
									colorMapType={ColorMapTypes.SEQUENTIAL}
									isSelected={colorMapName === cmName}
								/>
							</li>
						{/each}
					{/if}
				{/each}
			</ul>
		</div>
	</div>
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

	.colormap-button {
		cursor: pointer;
	}

	.tooltip {
		font-size: 13px;
		z-index: 10;
		width: 260px;
	}

	.close {
		cursor: pointer;
	}

	.card-color {
		max-height: 200px;
		overflow-y: auto;

		ul {
			display: flex;
			flex-flow: row wrap;
			gap: 15px;

			li {
				cursor: pointer;
				padding: 1px;

				&:hover {
					padding: 0;
					border: 1px solid hsl(204, 86%, 53%);
				}
			}
		}
	}
</style>
