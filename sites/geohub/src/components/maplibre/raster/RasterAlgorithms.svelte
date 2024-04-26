<script lang="ts">
	import {
		getLayerSourceUrl,
		getLayerStyle,
		getValueFromRasterTileUrl,
		updateParamsInURL
	} from '$lib/helper';
	import type { Link, RasterAlgorithm } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { FieldControl, PropertyEditor } from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let links: Link[] = [];
	export let algorithmId = '';

	let algorithmsLink = links.find((l) => l.rel === 'algorithms')?.href;

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
		const layerStyle = getLayerStyle($map, layerId);
		updateParamsInURL(layerStyle, url, params, map);
	};

	const handleParameterValueChanged = () => {
		if (!algorithmId) return;
		const layerUrl = getLayerSourceUrl($map, layerId) as string;
		if (!(layerUrl && layerUrl.length > 0)) return;
		const layerURL = new URL(layerUrl);
		updateAlgoParams(layerURL);
	};

	onMount(() => {
		algorithmId = (getValueFromRasterTileUrl($map, layerId, 'algorithm') as string) ?? undefined;

		getAlgorithms().then(() => {
			if (algorithmId) {
				setDefaultParameters();
			}
		});
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
				<div slot="control">
					{#each Object.keys(params) as key}
						{@const args = params[key]}
						<PropertyEditor
							bind:id={key}
							type={args.type}
							title={args.title}
							description={args.description}
							bind:value={parameters[key]}
							defaultValue={args.default}
							minimum={args.minimum}
							exclusiveMinimum={args.exclusiveMinimum}
							maximum={args.maximum}
							exclusiveMaximum={args.exclusiveMaximum}
							on:change={handleParameterValueChanged}
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
			</FieldControl>
		{/if}
	{/if}
{:else}
	<div class="is-flex is-justify-content-center"><Loader size="small" /></div>
{/if}
