<script lang="ts">
	import FieldControl from '$components/util/FieldControl.svelte';
	import {
		getLayerSourceUrl,
		getLayerStyle,
		getValueFromRasterTileUrl,
		isRgbRaster,
		updateParamsInURL
	} from '$lib/helper';
	import type { Link, RasterAlgorithm, RasterTileMetadata } from '$lib/types';
	import {
		COLORMAP_NAME_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		RASTERRESCALE_CONTEXT_KEY,
		type ColorMapNameStore,
		type MapStore,
		type RasterRescaleStore
	} from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import type { RasterDEMSourceSpecification, RasterSourceSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import RasterAlgorithmParameter from './RasterAlgorithmParameter.svelte';

	const dispatch = createEventDispatcher();

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const rescaleStore: RasterRescaleStore = getContext(RASTERRESCALE_CONTEXT_KEY);
	const colorMapNameStore: ColorMapNameStore = getContext(COLORMAP_NAME_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: RasterTileMetadata;
	export let links: Link[] = [];

	const isRgbTile = isRgbRaster(metadata.colorinterp);

	let algorithmsLink = links.find((l) => l.rel === 'algorithms')?.href;

	let availableBands =
		metadata.band_metadata.length > 0
			? (metadata.band_metadata.map((meta) => meta[0]) as string[])
			: [];

	let selectedAlgorithm = '';
	let algorithms: { [key: string]: RasterAlgorithm };

	let parameters: { [key: string]: number } = {};

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

	const getAlgorithms = async () => {
		const res = await fetch(algorithmsLink);
		algorithms = await res.json();
	};

	const setDefaultParameters = () => {
		parameters = {};

		if (selectedAlgorithm) {
			let algorithm_params_str =
				(getValueFromRasterTileUrl($map, layerId, 'algorithm_params') as string) ?? '';
			if (algorithm_params_str === 'undefined') {
				algorithm_params_str = '';
			}
			if (algorithm_params_str) {
				const algorithm_params = JSON.parse(algorithm_params_str);
				if (Object.keys(algorithm_params).length > 0) {
					Object.keys(algorithm_params).forEach((key) => {
						parameters[key] = algorithm_params[key];
					});
				}
			}
		}

		const params = algorithms[selectedAlgorithm].parameters;
		Object.keys(params).forEach((key) => {
			if (key in parameters) return;
			parameters[key] = params[key].default;
		});
	};

	const handleSelectAlgorithm = () => {
		const layerUrl = getLayerSourceUrl($map, layerId) as string;
		if (!(layerUrl && layerUrl.length > 0)) return;
		const layerURL = new URL(layerUrl);

		if (selectedAlgorithm.length === 0) {
			if (isRgbTile) {
				layerURL.searchParams.delete('algorithm');
				layerURL.searchParams.delete('colormap');
				layerURL.searchParams.delete('colormap_name');
				layerURL.searchParams.delete('rescale');
				layerURL.searchParams.delete('bidx');
				layerURL.searchParams.delete('algorithm_params');

				switchRasterDemAndRaster('raster', layerURL, {});
			} else {
				let bandIndex = availableBands.findIndex((b) => b === metadata.active_band_no) + 1;

				layerURL.searchParams.delete('algorithm');
				layerURL.searchParams.delete('algorithm_params');

				switchRasterDemAndRaster('raster', layerURL, {
					rescale: $rescaleStore.join(','),
					colormap_name: $colorMapNameStore,
					bidx: `${bandIndex}`
				});
			}
			parameters = {};
		} else {
			setDefaultParameters();
			updateAlgoParams(layerURL);
		}

		dispatch('change', {
			id: selectedAlgorithm,
			algorithm: algorithms[selectedAlgorithm] ?? undefined
		});
	};

	const updateAlgoParams = (url: URL) => {
		url.searchParams.delete('algorithm');
		url.searchParams.delete('colormap');
		url.searchParams.delete('colormap_name');
		url.searchParams.delete('rescale');
		url.searchParams.delete('bidx');
		url.searchParams.delete('algorithm_params');

		const dumpedParams =
			Object.keys(parameters).length > 0 ? JSON.stringify(parameters) : undefined;

		let sourceType: 'raster' | 'raster-dem' = ['terrarium', 'terrainrgb'].includes(
			selectedAlgorithm
		)
			? 'raster-dem'
			: 'raster';

		const params = {
			algorithm: selectedAlgorithm
		};
		if (dumpedParams) {
			params['algorithm_params'] = dumpedParams;
		}

		switchRasterDemAndRaster(sourceType, url, params);
	};

	const switchRasterDemAndRaster = (
		sourceType: 'raster' | 'raster-dem',
		url: URL,
		params: Record<string, string>
	) => {
		const sourceId = $map.getLayer(layerId).source;
		const currentSource = $map.getStyle().sources[sourceId] as
			| RasterSourceSpecification
			| RasterDEMSourceSpecification;
		const layerStyle = getLayerStyle($map, layerId);

		let oldEncoding = (currentSource as RasterDEMSourceSpecification).encoding ?? '';

		let newEncoding = '';
		if (selectedAlgorithm === 'terrarium') {
			newEncoding = 'terrarium';
		} else if (selectedAlgorithm === 'terrainrgb') {
			newEncoding = 'mapbox';
		}

		if (
			currentSource.type !== sourceType ||
			(currentSource.type === sourceType && oldEncoding !== newEncoding)
		) {
			Object.keys(params).forEach((key) => {
				url.searchParams.set(key, params[key]);
			});
			currentSource.tiles = [decodeURI(url.toString())];

			if (sourceType === 'raster-dem') {
				(currentSource as RasterDEMSourceSpecification).encoding = newEncoding as
					| 'terrarium'
					| 'mapbox';

				layerStyle.type = 'hillshade';
				layerStyle.paint = {
					'hillshade-accent-color':
						($map.getPaintProperty(layerId, 'hillshade-accent-color') as string) ?? '#000000',
					'hillshade-exaggeration':
						($map.getPaintProperty(layerId, 'hillshade-exaggeration') as number) ?? 0.5,
					'hillshade-highlight-color':
						($map.getPaintProperty(layerId, 'hillshade-highlight-color') as string) ?? '#FFFFFF',
					'hillshade-illumination-anchor': 'viewport',
					'hillshade-illumination-direction':
						($map.getPaintProperty(layerId, 'hillshade-illumination-direction') as number) ?? 335,
					'hillshade-shadow-color':
						($map.getPaintProperty(layerId, 'hillshade-shadow-color') as string) ?? '#000000'
				};
			} else {
				delete currentSource['encoding'];
				layerStyle.type = 'raster';
				layerStyle.paint = {
					'raster-resampling': 'nearest',
					'raster-opacity': 1
				};
			}
			currentSource.type = sourceType;

			const style = $map.getStyle();
			style.sources[sourceId] = currentSource;
			const layerIndex = style.layers.findIndex((l) => l.id === layerId);
			style.layers[layerIndex] = layerStyle;

			$map.setStyle(style);
		} else {
			updateParamsInURL(layerStyle, url, params, map);
		}
	};

	const handleParameterValueChanged = () => {
		if (!selectedAlgorithm) return;
		const layerUrl = getLayerSourceUrl($map, layerId) as string;
		if (!(layerUrl && layerUrl.length > 0)) return;
		const layerURL = new URL(layerUrl);
		updateAlgoParams(layerURL);
	};

	onMount(() => {
		selectedAlgorithm = (getValueFromRasterTileUrl($map, layerId, 'algorithm') as string) ?? '';

		getAlgorithms().then(() => {
			if (selectedAlgorithm) {
				setDefaultParameters();
			}
		});
	});
</script>

{#if algorithms && Object.keys(algorithms)?.length > 0}
	<FieldControl title="Algorithm">
		<div slot="help">
			You can apply for an algorithm to switch default layer style to different layer type.
		</div>
		<div slot="control">
			<div class="select is-fullwidth">
				<select bind:value={selectedAlgorithm} on:change={handleSelectAlgorithm}>
					<option value="">Use default</option>
					{#each Object.keys(algorithms) as name}
						{@const algo = algorithms[name]}
						{#if algo.inputs.nbands <= availableBands.length}
							<option value={name}>{name}</option>
						{/if}
					{/each}
				</select>
			</div>
		</div>
	</FieldControl>

	{#if selectedAlgorithm}
		{@const params = algorithms[selectedAlgorithm].parameters}
		{#each Object.keys(params) as key}
			<RasterAlgorithmParameter
				bind:id={key}
				parameter={params[key]}
				bind:value={parameters[key]}
				on:change={handleParameterValueChanged}
				bind:isExpanded={expanded[key]}
			/>
		{/each}
	{/if}
{:else}
	<div class="is-flex is-justify-content-center"><Loader size="small" /></div>
{/if}