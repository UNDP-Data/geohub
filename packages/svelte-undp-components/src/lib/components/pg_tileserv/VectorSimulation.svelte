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

	export const loadArgumentsInDynamicLayers = async (url: string) => {
		const metaUrl = url.replace('/{z}/{x}/{y}.pbf', '.json');
		const res = await fetch(metaUrl);
		const json = await res.json();
		if (!('arguments' in json && Array.isArray(json.arguments))) return {};
		return JSON.parse(json.arguments[0].default) as { [key: string]: SimulationArgument };
	};
</script>

<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';
	import { getLayerSourceUrl } from '$lib/util/getLayerSourceUrl.js';
	import { updateParamsInURL } from '$lib/util/updateParamsInUrl.js';
	import { Loader } from '@undp-data/svelte-undp-design';
	import type { FillLayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';
	import PropertyEditor from '../ui/PropertyEditor.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	/*EXPORTS*/
	export let layerId: string;
	export let datasetUrl: string;

	/*STATE*/
	let isInitialized = false;
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
		isInitialized = false;
		args = await loadArgumentsInDynamicLayers(decodeURI(datasetUrl));
		selectedArgs = getArgumentsInURL() || selectedArgs;
		isInitialized = true;
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
		const style = $map.getStyle();
		const layerStyle = style?.layers?.find((l) => l.id === layerId) as FillLayerSpecification;
		const params = {
			params: JSON.stringify(selectedArgs)
		};
		updateParamsInURL(layerStyle, new URL(decodeURI(datasetUrl)), params, $map);
	};

	onMount(() => {
		init();
	});
</script>

{#if !isInitialized}
	<div>
		<div class="is-flex is-justify-content-center">
			<Loader size="small" />
		</div>
	</div>
{:else}
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
{/if}
