<script context="module" lang="ts">
	export interface SimulationArgument {
		id: string;
		icon: string;
		value: number;
		units: string;
		label: string;
		abs_limits: {
			min: number;
			max: number;
		};
		limits: {
			min: number;
			max: number;
		};
		param_name: string;
		type: 'numeric';
		widget_type?: 'slider';
	}
</script>

<script lang="ts">
	import {
		getLayerSourceUrl,
		getLayerStyle,
		loadArgumentsInDynamicLayers,
		loadMap,
		updateLayerURL
	} from '$lib/helper';
	import type { VectorLayerSpecification } from '$lib/types';
	import {
		MAPSTORE_CONTEXT_KEY,
		PropertyEditor,
		type MapStore
	} from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	/*EXPORTS*/
	export let layerId: string;
	export let datasetUrl: string;

	/*STATE*/
	let args: { [key: string]: SimulationArgument };
	let selectedArgs: { [key: string]: SimulationArgument } = {};
	$: isParameterChanged = Object.keys(selectedArgs).length > 0;

	let expanded: { [key: string]: boolean } = { icon: true };
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

	/* FUNCTIONS*/
	const getArgumentsInURL = () => {
		const layerUrl = getLayerSourceUrl($map, layerId) as string;
		const llayerURL = new URL(layerUrl);
		const params = llayerURL.searchParams.get('params');
		return params ? JSON.parse(params) : undefined;
	};

	const init = async () => {
		const isLoaded = await loadMap($map);
		const layerUrl = getLayerSourceUrl($map, layerId) as string;
		args = await loadArgumentsInDynamicLayers(layerUrl);
		selectedArgs = getArgumentsInURL() || selectedArgs;
		return isLoaded;
	};

	const handleArgumentChanged = async (e: { detail: { id: string; value: number } }) => {
		const id = e.detail.id;
		const value = e.detail.value;

		if (value === args[id].value) {
			delete selectedArgs[id];
		} else {
			const updatedArg = JSON.parse(JSON.stringify(args[id]));
			updatedArg.value = value;
			selectedArgs[id] = updatedArg;
		}
		isParameterChanged = Object.keys(selectedArgs).length > 0;
		await applyParams();
	};

	const reset = async () => {
		selectedArgs = {};
		Object.keys(expanded).forEach((key) => {
			expanded[key] = false;
		});
		await applyParams();
	};

	const applyParams = async () => {
		const layerStyle = getLayerStyle($map, layerId) as VectorLayerSpecification;
		const params = {
			params: JSON.stringify(selectedArgs)
		};
		await updateLayerURL(layerStyle, new URL(datasetUrl), params, map);
	};
</script>

{#await init()}
	<div>
		<div class="is-flex is-justify-content-center">
			<Loader size="small" />
		</div>
	</div>
{:then}
	{#each Object.entries(args) as [argId, arg]}
		{@const value = selectedArgs[argId]?.value ?? 0}

		<PropertyEditor
			bind:id={argId}
			{value}
			defaultValue={arg.value}
			type="number"
			title={arg.label}
			icon="{arg.icon} fas fa-lg"
			minimum={arg.limits.min}
			maximum={arg.limits.max}
			showPrefix={true}
			unit={arg.units}
			on:change={handleArgumentChanged}
			bind:isExpanded={expanded[argId]}
		/>
	{/each}
	{#if isParameterChanged}
		<button on:click={reset} class="button is-light is-small is-uppercase mt-2">Reset all</button>
	{/if}
{:catch error}
	Failed to load parameters for {layerId}
	<p class="has-text-danger">{error.message}</p>
{/await}
