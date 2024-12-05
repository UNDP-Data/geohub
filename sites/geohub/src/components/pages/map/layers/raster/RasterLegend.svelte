<script lang="ts">
	import RasterAlgorithms from '$components/maplibre/raster/RasterAlgorithms.svelte';
	import {
		NumberOfClassesMaximum,
		NumberOfClassesMinimum,
		NumberOfRandomSamplingPoints
	} from '$lib/config/AppConfig';
	import { getLayerStyle, isRgbRaster } from '$lib/helper';
	import type { Link, RasterAlgorithm, Tag } from '$lib/types';
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
		isUniqueValueRaster,
		MAPSTORE_CONTEXT_KEY,
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
		type RasterTileMetadata
	} from '@undp-data/svelte-undp-components';
	import { debounce } from 'lodash-es';
	import { type LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	enum LegendType {
		LINEAR = 'Linear',
		CATEGORISED = 'Categorised'
	}

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const numberOfClassesStore: NumberOfClassesStore = getContext(NUMBER_OF_CLASSES_CONTEXT_KEY);
	const classificationMethodStore: ClassificationMethodStore = getContext(
		CLASSIFICATION_METHOD_CONTEXT_KEY
	);
	const rescaleStore: RasterRescaleStore = getContext(RASTERRESCALE_CONTEXT_KEY);
	const colorMapNameStore: ColorMapNameStore = getContext(COLORMAP_NAME_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: RasterTileMetadata;
	export let tags: Tag[] = [];
	export let links: Link[] = [];
	let algorithmId: string | undefined = undefined;
	let algorithm: RasterAlgorithm;
	let layerStyle: LayerSpecification | undefined;
	let classifyComponent: RasterClassifyLegend;

	const isRgbTile = metadata.colorinterp ? isRgbRaster(metadata.colorinterp) : false;
	let layerHasUniqueValues = isRgbTile ? false : isUniqueValueRaster(metadata);
	let legendType: LegendType | undefined = undefined;
	let unit: string = tags?.find((t) => t.key === 'unit')?.value as string;

	const handleSelectAlgorithm = () => {
		layerStyle = $map.getStyle().layers.find((l: LayerSpecification) => l.id === layerId);
	};

	const handleClassificationChanged = () => {
		handleColorMapChanged();
	};

	const handleColorMapChanged = () => {
		if (layerHasUniqueValues) return;
		if (legendType !== LegendType.LINEAR) return;
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

	const handleRescaleChanged = debounce(() => {
		if (layerHasUniqueValues) return;
		if (!$rescaleStore) return;
		if (algorithmId && !hasRescaleProperty()) return;

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
			legendType = LegendType.CATEGORISED;
		} else {
			legendType = LegendType.LINEAR;
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

	let expanded: { [key: string]: boolean } = {};
	// to allow only an accordion to be expanded
	let expandedDatasetId: string;
	$: {
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
	}

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
				<div slot="content">
					<RasterAlgorithms
						bind:layerId
						bind:links
						on:change={handleSelectAlgorithm}
						bind:algorithmId
					/>
				</div>
				<div slot="buttons">
					<Help>
						Customize parameters for {title} algorithm
						{#if algorithm.description}
							- {algorithm.description}
						{/if}
					</Help>
				</div>
			</Accordion>
		{/if}
	{/if}

	{#if layerStyle && layerStyle.type === 'hillshade'}
		<Accordion title="Hillshade accent color" bind:isExpanded={expanded['hillshade-accent-color']}>
			<div class="pb-2" slot="content">
				<HillshadeAccentColor {layerId} />
			</div>
			<div slot="buttons">
				<Help>
					Change the shading color used to accentuate rugged terrain like sharp cliffs and gorges.
				</Help>
			</div>
		</Accordion>
		<Accordion title="Hillshade exaggeration" bind:isExpanded={expanded['hillshade-exaggeration']}>
			<div class="pb-2" slot="content">
				<HillshadeExaggeration {layerId} />
			</div>
			<div slot="buttons">
				<Help>Change the Intensity of the hillshade.</Help>
			</div>
		</Accordion>
		<Accordion
			title="Hillshade highlight color"
			bind:isExpanded={expanded['hillshade-highlight-color']}
		>
			<div class="pb-2" slot="content">
				<HillshadeHighlightColor {layerId} />
			</div>
			<div slot="buttons">
				<Help>Change the shading color of areas that faces towards the light source.</Help>
			</div>
		</Accordion>
		<Accordion
			title="Hillshade illumination direction"
			bind:isExpanded={expanded['hillshade-illumination-direction']}
		>
			<div class="pb-2" slot="content">
				<HillshadeIlluminationDirection {layerId} />
			</div>
			<div slot="buttons">
				<Help>
					The direction of the light source used to generate the hillshading with 0 as the top of
					the viewport
				</Help>
			</div>
		</Accordion>
		<Accordion title="Hillshade shadow color" bind:isExpanded={expanded['hillshade-shadow-color']}>
			<div class="pb-2" slot="content">
				<HillshadeShadowColor {layerId} />
			</div>
			<div slot="buttons">
				<Help>Change the shading color of areas that face away from the light source.</Help>
			</div>
		</Accordion>
	{:else if layerStyle?.type === 'raster'}
		{#if !(algorithmId && !hasColormapProperty()) && !isRgbTile}
			<Accordion title="Color" bind:isExpanded={expanded['color']}>
				<div slot="content">
					{#if !layerHasUniqueValues}
						<FieldControl title="Type">
							<div slot="help">
								Switch classification type either a simple linear colormap or categorized
								classification.
							</div>
							<div slot="control">
								<div class="select is-fullwidth">
									<select bind:value={legendType} on:change={handleClassificationChanged}>
										<option value={LegendType.LINEAR}>Simple</option>
										<option value={LegendType.CATEGORISED}>Categories</option>
									</select>
								</div>
							</div>
						</FieldControl>
					{/if}

					{#if legendType === LegendType.LINEAR}
						<div class="field">
							<div class="control">
								{#if unit}
									<span class="unit is-size-6">{unit}</span>
								{/if}
								<div class="is-flex">
									<div style="width: 100%;">
										<ColorMapPicker
											bind:colorMapName={$colorMapNameStore}
											on:change={handleColorMapChanged}
										/>
									</div>
								</div>
								{#if $rescaleStore?.length > 1}
									<div class="is-flex">
										<span class="is-size-6">{Number($rescaleStore[0]).toFixed(2)}</span>
										<span class="align-right is-size-6">{Number($rescaleStore[1]).toFixed(2)}</span>
									</div>
								{/if}
							</div>
						</div>
					{:else if legendType === LegendType.CATEGORISED}
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
				<div slot="buttons">
					<Help>Apply a colormap to visualise the raster dataset</Help>
				</div>
			</Accordion>
		{/if}

		{#if (!layerHasUniqueValues && !isRgbTile && !algorithmId) || (algorithmId && hasRescaleProperty())}
			<Accordion title="Rescale min/max values" bind:isExpanded={expanded['rescale']}>
				<div class="pb-2" slot="content">
					<RasterRescale
						bind:layerId
						bind:metadata
						bind:unit
						bind:rescale={$rescaleStore}
						on:change={handleRescaleChanged}
					/>
				</div>
				<div slot="buttons">
					<Help>Rescale minimum/maximum values to filter</Help>
				</div>
			</Accordion>
		{/if}

		<Accordion title="Resampling" bind:isExpanded={expanded['resampling']}>
			<div class="pb-2" slot="content">
				<RasterResampling bind:layerId />
			</div>
			<div slot="buttons">
				<Help>
					The resampling/interpolation method to use for overscaling, also known as texture
					magnification filter
					<br />
					<b>Bi-linear</b>: (Bi)linear filtering interpolates pixel values using the weighted
					average of the four closest original source pixels creating a smooth but blurry look when
					overscaled
					<br />
					<b>Nearest neighbor</b>: Nearest neighbor filtering interpolates pixel values using the
					nearest original source pixel creating a sharp but pixelated look when overscaled
				</Help>
			</div>
		</Accordion>

		<Accordion title="Brightness max" bind:isExpanded={expanded['brightness-max']}>
			<div class="pb-2" slot="content">
				<RasterBrightnessMax bind:layerId />
			</div>
			<div slot="buttons">
				<Help>
					Increase or reduce the brightness of the image. The value is the maximum brightness.
				</Help>
			</div>
		</Accordion>

		<Accordion title="Brightness min" bind:isExpanded={expanded['brightness-min']}>
			<div class="pb-2" slot="content">
				<RasterBrightnessMin bind:layerId />
			</div>
			<div slot="buttons">
				<Help>
					Increase or reduce the brightness of the image. The value is the minimum brightness.
				</Help>
			</div>
		</Accordion>

		<Accordion title="Contrast" bind:isExpanded={expanded['contrast']}>
			<div class="pb-2" slot="content">
				<RasterContrast bind:layerId />
			</div>
			<div slot="buttons">
				<Help>Increase or reduce the contrast of the image.</Help>
			</div>
		</Accordion>

		<Accordion title="Hue rotate" bind:isExpanded={expanded['hue-rotate']}>
			<div class="pb-2" slot="content">
				<RasterHueRotate bind:layerId />
			</div>
			<div slot="buttons">
				<Help>Rotates hues around the color wheel.</Help>
			</div>
		</Accordion>

		<Accordion title="Saturation" bind:isExpanded={expanded['saturation']}>
			<div class="pb-2" slot="content">
				<RasterSaturation bind:layerId />
			</div>
			<div slot="buttons">
				<Help>Increase or reduce the saturation of the image.</Help>
			</div>
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
