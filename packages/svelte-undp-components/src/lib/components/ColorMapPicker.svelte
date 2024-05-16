<script lang="ts">
	import { handleEnterKey } from '$lib/util/handleEnterKey.js';
	import { initTippy } from '$lib/util/initTippy.js';
	import chroma from 'chroma-js';
	import { createEventDispatcher } from 'svelte';
	import ColorMapPickerCard, {
		ColorMapTypes,
		DivergingColorMaps,
		QualitativeColorMaps,
		SequentialColormaps
	} from './ColorMapPickerCard.svelte';
	import Tabs, { type Tab } from './Tabs.svelte';

	/**
	 * ColorMap name
	 */
	export let colorMapName: string;

	let isShow = false;

	const tippy = initTippy({
		appendTo: document.body,
		onShow(instance) {
			isShow = true;
			instance.popper.querySelector('.close')?.addEventListener('click', () => {
				instance.hide();
			});
		},
		onHide(instance) {
			isShow = false;
			instance.popper.querySelector('.close')?.removeEventListener('click', () => {
				instance.hide();
			});
		}
	});
	let tooltipContent: HTMLElement;

	let isReverseColors = colorMapName.indexOf('_r') !== -1;

	const dispatch = createEventDispatcher();
	const colorMapTypes = [
		{ name: ColorMapTypes.SEQUENTIAL, codes: SequentialColormaps },
		{ name: ColorMapTypes.DIVERGING, codes: DivergingColorMaps },
		{ name: ColorMapTypes.QUALITATIVE, codes: QualitativeColorMaps }
	];

	let activeColorMapType: string =
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

		dispatch('change', { colorMapName: cmName });
	};

	let colorMapStyle = '';
	const getColorMapStyle = () => {
		const isReverse = colorMapName.indexOf('_r') !== -1;
		let colorMap = chroma.scale(colorMapName.replace('_r', '')).mode('lrgb').colors(5, 'rgba');
		if (isReverse) {
			colorMap = colorMap.reverse();
		}
		colorMapStyle = `height: 40px; width: 100%; background: linear-gradient(90deg, ${colorMap});`;
	};
	$: colorMapName, getColorMapStyle();

	const handleReverseColorsChanged = () => {
		const isReverse = colorMapName.indexOf('_r') !== -1;
		if (isReverse) {
			colorMapName = colorMapName.replace('_r', '');
		} else {
			colorMapName = `${colorMapName}_r`;
		}
		dispatch('change', { colorMapName: colorMapName });
	};
</script>

<div class="colormap-button is-flex" use:tippy={{ content: tooltipContent }}>
	{#key isReverseColors}
		<div style={colorMapStyle} data-testid="color-map-figure" />
	{/key}
	<button class="button is-small">
		<span class="icon is-small">
			<i class="fa-solid fa-chevron-down toggle-icon {isShow ? 'show' : ''}"></i>
		</span>
	</button>
</div>

<div bind:this={tooltipContent} data-testid="color-map-picker" class="tooltip p-2">
	<Tabs
		bind:tabs
		bind:activeTab={activeColorMapType}
		size="is-small"
		fontWeight="semibold"
		isCapitalized={true}
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
		<label class="checkbox is-flex is-align-items-center reverse-check">
			<input
				type="checkbox"
				bind:checked={isReverseColors}
				on:change={handleReverseColorsChanged}
			/>
			<span class="ml-1">Reverse colors</span>
		</label>
	</div>
</div>

<style lang="scss">
	.colormap-button {
		cursor: pointer;

		.button {
			height: 40px;
			border: 1px solid black;
		}

		.toggle-icon {
			-webkit-transition: all 0.3s ease;
			-moz-transition: all 0.3s ease;
			-ms-transition: all 0.3s ease;
			-o-transition: all 0.3s ease;
			transition: all 0.3s ease;

			&.show {
				transform: rotate(-180deg);
				-webkit-transform: rotate(-180deg);
				-moz-transform: rotate(-180deg);
				-ms-transform: rotate(-180deg);
				-o-transform: rotate(-180deg);
				transition: rotateZ(-180deg);
			}
		}
	}

	.tooltip {
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
			margin-bottom: 0;
			border-radius: 0;

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

	.reverse-check {
		input[type='checkbox'] {
			-moz-appearance: none;
			-webkit-appearance: none;
			-o-appearance: none;
			outline: none;
			content: none;
		}

		input[type='checkbox']:before {
			font-family: 'FontAwesome';
			content: '\f00c';
			font-size: 12px;
			color: transparent !important;
			display: block;
			width: 16px;
			height: 16px;
			border: 2px solid #d12800;
		}

		input[type='checkbox']:checked:before {
			color: #d12800 !important;
		}
	}
</style>
