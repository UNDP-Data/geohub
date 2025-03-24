<script lang="ts">
	import FieldControl from '$lib/components/ui/FieldControl.svelte';
	import PropertyEditor from '$lib/components/ui/PropertyEditor.svelte';
	import type { RasterAlgorithm } from '$lib/interfaces/RasterAlgorithm';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores';
	import { getLayerSourceUrl } from '$lib/util/getLayerSourceUrl';
	import { getValueFromRasterTileUrl } from '$lib/util/getValueFromRasterTileUrl';
	import { loadMap } from '$lib/util/loadMap';
	import { updateParamsInURL } from '$lib/util/updateParamsInUrl';
	import { Loader } from '@undp-data/svelte-undp-design';
	import type { RasterLayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		/**
		 * maplibre layer ID
		 */
		layerId: string;
		/**
		 * Titiler Algorithm ID
		 */
		algorithmId?: string;
		/**
		 * Titiler alrgorithms endpoint URL
		 */
		algorithmsApi?: string;

		onchange?: () => void;
	}

	let {
		layerId = $bindable(),
		algorithmId = $bindable(''),
		algorithmsApi = $bindable(''),
		onchange = () => {}
	}: Props = $props();

	let algorithms: { [key: string]: RasterAlgorithm } = $state();

	let parameters: { [key: string]: number } = $state({});

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

	const getAlgorithms = async () => {
		const res = await fetch(algorithmsApi);
		algorithms = await res.json();
	};

	const setDefaultParameters = () => {
		parameters = {};

		const params = algorithms[algorithmId]?.parameters ?? {};

		if (algorithmId) {
			let algorithm_params_str =
				(getValueFromRasterTileUrl($map, layerId, 'algorithm_params') as string) ?? '';
			if (algorithm_params_str === 'undefined') {
				algorithm_params_str = '';
			}
			if (algorithm_params_str) {
				const algorithm_params = JSON.parse(algorithm_params_str);
				if (Object.keys(algorithm_params).length > 0) {
					Object.keys(algorithm_params).forEach((key) => {
						if (!params[key]) return;
						parameters[key] = algorithm_params[key];
					});
				}
			}
		}

		Object.keys(params).forEach((key) => {
			if (key in parameters) return;
			parameters[key] = params[key].default;
		});
	};

	const updateAlgoParams = (url: URL) => {
		const dumpedParams =
			Object.keys(parameters).length > 0 ? JSON.stringify(parameters) : undefined;

		const params = {
			algorithm: algorithmId
		};
		if (dumpedParams) {
			params['algorithm_params'] = dumpedParams;
		}
		const style = $map.getStyle();
		const layerStyle = style?.layers?.find((l) => l.id === layerId) as RasterLayerSpecification;
		updateParamsInURL(layerStyle, url, params, $map);
	};

	const handleParameterValueChanged = () => {
		if (!algorithmId) return;
		const layerUrl = getLayerSourceUrl($map, layerId) as string;
		if (!(layerUrl && layerUrl.length > 0)) return;
		const layerURL = new URL(layerUrl);
		updateAlgoParams(layerURL);
		if (onchange) onchange();
	};

	const initialized = async () => {
		await loadMap($map);
		algorithmId = (getValueFromRasterTileUrl($map, layerId, 'algorithm') as string) ?? undefined;

		getAlgorithms().then(() => {
			if (algorithmId) {
				setDefaultParameters();
			}
		});
	};

	onMount(() => {
		initialized();
	});
</script>

{#if algorithms && Object.keys(algorithms)?.length > 0}
	{#if algorithmId}
		{@const params = algorithms[algorithmId]?.parameters ?? undefined}
		{#if params && Object.keys(params).length > 0}
			<FieldControl
				title="Customize parameter{Object.keys(params).length > 1 ? 's' : ''}"
				showHelp={false}
			>
				{#snippet control()}
					<div>
						{#each Object.keys(params) as key (key)}
							{@const args = params[key]}
							<PropertyEditor
								id={key}
								type={args.type}
								title={args.title}
								description={args.description}
								bind:value={parameters[key]}
								defaultValue={args.default}
								unit={args.unit}
								minimum={args.minimum}
								exclusiveMinimum={args.exclusiveMinimum}
								maximum={args.maximum}
								exclusiveMaximum={args.exclusiveMaximum}
								onchange={handleParameterValueChanged}
								bind:isExpanded={expanded[key]}
								showRestPip={args.options_descriptions ? true : false}
								showAll={args.options_descriptions ? 'pip' : false}
								formatter={(value) => {
									const options = args.options_descriptions;
									if (options && options.length > 0) {
										return options[value];
									} else {
										return value;
									}
								}}
							/>
						{/each}
					</div>
				{/snippet}
			</FieldControl>
		{/if}
	{/if}
{:else}
	<div class="is-flex is-justify-content-center"><Loader size="small" /></div>
{/if}
