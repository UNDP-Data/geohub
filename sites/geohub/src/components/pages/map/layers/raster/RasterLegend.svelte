<script lang="ts">
	import {
		NumberOfClassesMaximum,
		NumberOfClassesMinimum,
		NumberOfRandomSamplingPoints
	} from '$lib/config/AppConfig';
	import { getLayerStyle, isRgbRaster } from '$lib/helper';
	import type { Link, Tag } from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		COLORMAP_NAME_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY,
		RASTERRESCALE_CONTEXT_KEY,
		type ClassificationMethodStore,
		type ColorMapNameStore,
		type NumberOfClassesStore,
		type RasterRescaleStore
	} from '$stores';
	import {
		Accordion,
		ColorMapPicker,
		FieldControl,
		getLayerSourceUrl,
		getValueFromRasterTileUrl,
		Help,
		HillshadeAccentColor,
		HillshadeExaggeration,
		HillshadeHighlightColor,
		HillshadeIlluminationDirection,
		HillshadeShadowColor,
		HillshadeMethod,
		isUniqueValueRaster,
		MAPSTORE_CONTEXT_KEY,
		RasterAlgorithms,
		RasterBrightnessMax,
		RasterBrightnessMin,
		RasterClassifyLegend,
		RasterContrast,
		RasterHueRotate,
		RasterResampling,
		RasterRescale,
		RasterSaturation,
		updateParamsInURL,
		type MapStore,
		type RasterAlgorithm,
		type RasterTileMetadata
	} from '@undp-data/svelte-undp-components';
	import { debounce } from 'lodash-es';
	import { type LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const numberOfClassesStore: NumberOfClassesStore = getContext(NUMBER_OF_CLASSES_CONTEXT_KEY);
	const classificationMethodStore: ClassificationMethodStore = getContext(
		CLASSIFICATION_METHOD_CONTEXT_KEY
	);
	const rescaleStore: RasterRescaleStore = getContext(RASTERRESCALE_CONTEXT_KEY);
	const colorMapNameStore: ColorMapNameStore = getContext(COLORMAP_NAME_CONTEXT_KEY);

	interface Props {
		layerId: string;
		metadata: RasterTileMetadata;
		tags?: Tag[];
		links?: Link[];
	}

	let {
		layerId = $bindable(),
		metadata = $bindable(),
		tags = $bindable([]),
		links = $bindable([])
	}: Props = $props();
	let algorithmId: string | undefined = $state(undefined);
	let algorithm: RasterAlgorithm | undefined = $state();
	let layerStyle: LayerSpecification | undefined = $state();
	let classifyComponent: RasterClassifyLegend | undefined = $state();

	const isRgbTile = metadata.colorinterp ? isRgbRaster(metadata.colorinterp) : false;
	let layerHasUniqueValues = isRgbTile ? false : isUniqueValueRaster(metadata);
	let legendType: 'Linear' | 'Categorised' | undefined = $state(undefined);
	let unit: string = $state(tags?.find((t) => t.key === 'unit')?.value as string);
	let algorithmsApi = $state(links.find((l) => l.rel === 'algorithms')?.href);

	const handleSelectAlgorithm = () => {
		layerStyle = $map.getStyle().layers.find((l: LayerSpecification) => l.id === layerId);
	};

	const handleClassificationChanged = () => {
		handleColorMapChanged();
	};

	const handleColorMapChanged = () => {
		if (layerHasUniqueValues) return;
		if (legendType !== 'Linear') return;
		if (algorithmId && !hasColormapProperty()) return;
		// linear colormap

		const currCMAP = getValueFromRasterTileUrl($map, layerId, 'colormap_name') as string;

		// invalid cases
		if (!$colorMapNameStore || currCMAP == $colorMapNameStore) {
			return;
		}

		const layerUrl = getLayerSourceUrl($map, layerId) as string;
		if (!(layerUrl && layerUrl.length > 0)) {
			return;
		}

		const layerURL = new URL(layerUrl);
		// remove colormap in case the layer was previously in
		if (layerURL.searchParams.has('colormap')) layerURL.searchParams.delete('colormap');

		// set color map and force map rerender
		layerURL.searchParams.delete('colormap_name');

		let updatedParams = { colormap_name: $colorMapNameStore };
		// preserve current rescale value
		let rescale = layerURL.searchParams.get('rescale');
		if ($rescaleStore?.length === 2) {
			// use new rescale if store is available
			rescale = $rescaleStore.join(',');
		}
		if (rescale) {
			updatedParams['rescale'] = rescale;
		}

		const layerStyle = getLayerStyle($map, layerId);
		updateParamsInURL(layerStyle, layerURL, updatedParams, $map);
	};

	const handleRescaleChanged = debounce((rescale: number[]) => {
		if (layerHasUniqueValues) return;
		if (algorithmId && !hasRescaleProperty()) return;
		$rescaleStore = [...rescale];

		const layerStyle = getLayerStyle($map, layerId);
		const layerUrl = getLayerSourceUrl($map, layerId) as string;
		if (!(layerUrl && layerUrl.length > 0)) return;

		const layerURL = new URL(layerUrl);
		layerURL.searchParams.delete('colormap');

		let updatedParams = { colormap_name: $colorMapNameStore, rescale: $rescaleStore.join(',') };

		updateParamsInURL(layerStyle, layerURL, updatedParams, $map);

		classifyComponent?.redraw();
	}, 200);

	const decideLegendType = () => {
		if (!algorithmId) {
			algorithmId = getValueFromRasterTileUrl($map, layerId, 'algorithm') as string;
		}
		if (algorithmId && !hasColormapProperty()) {
			legendType = undefined;
			return;
		}
		const colormap = getValueFromRasterTileUrl($map, layerId, 'colormap') as number[][][];
		// maintains the state of the legendType
		if (colormap || layerHasUniqueValues) {
			legendType = 'Categorised';
		} else {
			legendType = 'Linear';
		}
	};

	const hasColormapProperty = () => {
		const colormap_name = getValueFromRasterTileUrl($map, layerId, 'colormap_name');
		const colormap = getValueFromRasterTileUrl($map, layerId, 'colormap');
		return colormap_name || colormap ? true : false;
	};
	const hasRescaleProperty = () => {
		const rescale = getValueFromRasterTileUrl($map, layerId, 'rescale');
		return rescale ? true : false;
	};

	let expanded: { [key: string]: boolean } = $state({});
	// to allow only an accordion to be expanded
	let expandedDatasetId: string = $state('');
	$effect(() => {
		let expandedDatasets = Object.keys(expanded).filter(
			(key) => expanded[key] === true && key !== expandedDatasetId
		);
		if (expandedDatasets.length > 0) {
			expandedDatasetId = expandedDatasets[0];
			Object.keys(expanded)
				.filter((key) => key !== expandedDatasetId)
				.forEach((key) => {
					expanded[key] = false;
				});
			expanded[expandedDatasets[0]] = true;
		}
	});

	onMount(() => {
		algorithmId = (getValueFromRasterTileUrl($map, layerId, 'algorithm') as string) ?? undefined;
		if (algorithmId) {
			getAlgorithm(algorithmId).then((algo) => {
				algorithm = algo;
			});
		}
		layerStyle = $map.getStyle().layers.find((l: LayerSpecification) => l.id === layerId);
		const isHillShade = layerStyle && layerStyle.type === 'hillshade' ? true : false;
		if (!isHillShade) {
			expanded = { color: true };

			/**
			 * This component will only decide which legend to show based on the legendType
			 * Initially, the legendType is decided based on if the layer is unique or not
			 * if the layer is unique, the legendType is set to CLASSIFY
			 * if the layer is not unique, the legendType is set to DEFAULT
			 */
			decideLegendType();
		} else {
			expanded = { 'hillshade-accent-color': true };
		}
	});

	const getAlgorithm = async (id: string) => {
		if (!id) return;
		const algorithmsLink = links.find((l) => l.rel === 'algorithms')?.href;
		const res = await fetch(`${algorithmsLink}/${id}`);
		const algo: RasterAlgorithm = await res.json();
		return algo;
	};
</script>

<div class="legend-container">
	{#if algorithm}
		{#if algorithm.parameters && Object.keys(algorithm.parameters).length > 0}
			{@const title = algorithm.title ?? algorithmId?.toUpperCase()}
			<Accordion title="{title} customization" bind:isExpanded={expanded['algorithm']}>
				{#snippet content()}
					<div>
						<RasterAlgorithms
							bind:layerId
							bind:algorithmsApi
							onchange={handleSelectAlgorithm}
							bind:algorithmId
						/>
					</div>
				{/snippet}
				{#snippet buttons()}
					<div>
						<Help>
							Customize parameters for {title} algorithm
							{#if algorithm && algorithm.description}
								- {algorithm.description}
							{/if}
						</Help>
					</div>
				{/snippet}
			</Accordion>
		{/if}
	{/if}

	{#if layerStyle && layerStyle.type === 'hillshade'}
		<Accordion title="Hillshade method" bind:isExpanded={expanded['hillshade-method']}>
			{#snippet content()}
				<div class="pb-2">
					<HillshadeMethod {layerId} />
				</div>
			{/snippet}
			{#snippet buttons()}
				<div>
					<Help>
						The hillshade algorithm to use, one of standard, basic, combined, igor, or
						multidirectional.

						<br /><br />standard: The legacy hillshade method.

						<br />basic: Basic hillshade. Uses a simple physics model where the reflected light
						intensity is proportional to the cosine of the angle between the incident light and the
						surface normal.

						<br />combined: Hillshade algorithm whose intensity scales with slope.

						<br />igor: Hillshade algorithm which tries to minimize effects on other map features
						beneath.

						<br />multidirectional: Hillshade with multiple illumination directions. Uses the basic
						hillshade model with multiple independent light sources.
					</Help>
				</div>
			{/snippet}
		</Accordion>

		<Accordion title="Hillshade accent color" bind:isExpanded={expanded['hillshade-accent-color']}>
			{#snippet content()}
				<div class="pb-2">
					<HillshadeAccentColor {layerId} />
				</div>
			{/snippet}
			{#snippet buttons()}
				<div>
					<Help>
						Change the shading color used to accentuate rugged terrain like sharp cliffs and gorges.
					</Help>
				</div>
			{/snippet}
		</Accordion>
		<Accordion title="Hillshade exaggeration" bind:isExpanded={expanded['hillshade-exaggeration']}>
			{#snippet content()}
				<div class="pb-2">
					<HillshadeExaggeration {layerId} />
				</div>
			{/snippet}
			{#snippet buttons()}
				<div>
					<Help>Change the Intensity of the hillshade.</Help>
				</div>
			{/snippet}
		</Accordion>
		<Accordion
			title="Hillshade highlight color"
			bind:isExpanded={expanded['hillshade-highlight-color']}
		>
			{#snippet content()}
				<div class="pb-2">
					<HillshadeHighlightColor {layerId} />
				</div>
			{/snippet}
			{#snippet buttons()}
				<div>
					<Help>Change the shading color of areas that faces towards the light source.</Help>
				</div>
			{/snippet}
		</Accordion>
		<Accordion
			title="Hillshade illumination direction"
			bind:isExpanded={expanded['hillshade-illumination-direction']}
		>
			{#snippet content()}
				<div class="pb-2">
					<HillshadeIlluminationDirection {layerId} />
				</div>
			{/snippet}
			{#snippet buttons()}
				<div>
					<Help>
						The direction of the light source used to generate the hillshading with 0 as the top of
						the viewport
					</Help>
				</div>
			{/snippet}
		</Accordion>
		<Accordion title="Hillshade shadow color" bind:isExpanded={expanded['hillshade-shadow-color']}>
			{#snippet content()}
				<div class="pb-2">
					<HillshadeShadowColor {layerId} />
				</div>
			{/snippet}
			{#snippet buttons()}
				<div>
					<Help>Change the shading color of areas that face away from the light source.</Help>
				</div>
			{/snippet}
		</Accordion>
	{:else if layerStyle?.type === 'raster'}
		{#if !(algorithmId && !hasColormapProperty()) && !isRgbTile}
			<Accordion title="Color" bind:isExpanded={expanded['color']}>
				{#snippet content()}
					<div>
						{#if !layerHasUniqueValues}
							<FieldControl title="Type">
								{#snippet help()}
									<div>
										Switch classification type either a simple linear colormap or categorized
										classification.
									</div>
								{/snippet}
								{#snippet control()}
									<div>
										<div class="select is-fullwidth">
											<select bind:value={legendType} onchange={handleClassificationChanged}>
												<option value="Linear">Simple</option>
												<option value="Categorised">Categories</option>
											</select>
										</div>
									</div>
								{/snippet}
							</FieldControl>
						{/if}

						{#if legendType === 'Linear'}
							<div class="field">
								<div class="control">
									{#if unit}
										<span class="unit is-size-6">{unit}</span>
									{/if}
									<div class="is-flex">
										<div style="width: 100%;">
											<ColorMapPicker
												bind:colorMapName={$colorMapNameStore}
												onchange={handleColorMapChanged}
											/>
										</div>
									</div>
									{#if $rescaleStore?.length > 1}
										<div class="is-flex">
											<span class="is-size-6">{Number($rescaleStore[0]).toFixed(2)}</span>
											<span class="align-right is-size-6"
												>{Number($rescaleStore[1]).toFixed(2)}</span
											>
										</div>
									{/if}
								</div>
							</div>
						{:else if legendType === 'Categorised'}
							<RasterClassifyLegend
								bind:layerId
								bind:metadata
								bind:rescale={$rescaleStore}
								bind:numberOfClasses={$numberOfClassesStore}
								bind:colorMapName={$colorMapNameStore}
								bind:classificationMethod={$classificationMethodStore}
								numberOfRandomSamplingPoints={NumberOfRandomSamplingPoints}
								numberOfClassesMaximum={NumberOfClassesMaximum}
								numberOfClassesMinimum={NumberOfClassesMinimum}
								bind:this={classifyComponent}
							/>
						{/if}
					</div>
				{/snippet}
				{#snippet buttons()}
					<div>
						<Help>Apply a colormap to visualise the raster dataset</Help>
					</div>
				{/snippet}
			</Accordion>
		{/if}

		{#if (!layerHasUniqueValues && !isRgbTile && !algorithmId) || (algorithmId && hasRescaleProperty())}
			<Accordion title="Rescale min/max values" bind:isExpanded={expanded['rescale']}>
				{#snippet content()}
					<div class="pb-2">
						<RasterRescale
							{layerId}
							{metadata}
							{unit}
							bind:rescale={$rescaleStore}
							onchange={handleRescaleChanged}
						/>
					</div>
				{/snippet}
				{#snippet buttons()}
					<div>
						<Help>Rescale minimum/maximum values to filter</Help>
					</div>
				{/snippet}
			</Accordion>
		{/if}

		<Accordion title="Resampling" bind:isExpanded={expanded['resampling']}>
			{#snippet content()}
				<div class="pb-2">
					<RasterResampling bind:layerId />
				</div>
			{/snippet}
			{#snippet buttons()}
				<div>
					<Help>
						The resampling/interpolation method to use for overscaling, also known as texture
						magnification filter
						<br />
						<b>Bi-linear</b>: (Bi)linear filtering interpolates pixel values using the weighted
						average of the four closest original source pixels creating a smooth but blurry look
						when overscaled
						<br />
						<b>Nearest neighbor</b>: Nearest neighbor filtering interpolates pixel values using the
						nearest original source pixel creating a sharp but pixelated look when overscaled
					</Help>
				</div>
			{/snippet}
		</Accordion>

		<Accordion title="Brightness max" bind:isExpanded={expanded['brightness-max']}>
			{#snippet content()}
				<div class="pb-2">
					<RasterBrightnessMax bind:layerId />
				</div>
			{/snippet}
			{#snippet buttons()}
				<div>
					<Help>
						Increase or reduce the brightness of the image. The value is the maximum brightness.
					</Help>
				</div>
			{/snippet}
		</Accordion>

		<Accordion title="Brightness min" bind:isExpanded={expanded['brightness-min']}>
			{#snippet content()}
				<div class="pb-2">
					<RasterBrightnessMin bind:layerId />
				</div>
			{/snippet}
			{#snippet buttons()}
				<div>
					<Help>
						Increase or reduce the brightness of the image. The value is the minimum brightness.
					</Help>
				</div>
			{/snippet}
		</Accordion>

		<Accordion title="Contrast" bind:isExpanded={expanded['contrast']}>
			{#snippet content()}
				<div class="pb-2">
					<RasterContrast bind:layerId />
				</div>
			{/snippet}
			{#snippet buttons()}
				<div>
					<Help>Increase or reduce the contrast of the image.</Help>
				</div>
			{/snippet}
		</Accordion>

		<Accordion title="Hue rotate" bind:isExpanded={expanded['hue-rotate']}>
			{#snippet content()}
				<div class="pb-2">
					<RasterHueRotate bind:layerId />
				</div>
			{/snippet}
			{#snippet buttons()}
				<div>
					<Help>Rotates hues around the color wheel.</Help>
				</div>
			{/snippet}
		</Accordion>

		<Accordion title="Saturation" bind:isExpanded={expanded['saturation']}>
			{#snippet content()}
				<div class="pb-2">
					<RasterSaturation bind:layerId />
				</div>
			{/snippet}
			{#snippet buttons()}
				<div>
					<Help>Increase or reduce the saturation of the image.</Help>
				</div>
			{/snippet}
		</Accordion>
	{/if}
</div>

<style lang="scss">
	.legend-container {
		position: relative;
		min-height: 40px;

		.align-right {
			margin-left: auto;
		}

		.unit {
			width: 100%;
		}
	}
</style>
