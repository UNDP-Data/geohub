<script lang="ts">
	import type { Layer, RangeSliderConfig } from '$lib/types';
	import { Loader } from '@undp-data/svelte-undp-design';
	import RangeSlider from 'svelte-range-slider-pips';

	import {
		getLayerSourceUrl,
		getLayerStyle,
		loadArgumentsInDynamicLayers,
		loadMap,
		updateLayerURL
	} from '$lib/helper';
	import { layerList, map } from '$stores';
	/*EXPORTS*/
	export let layerId;

	/*STATE*/
	let args = {};
	let defaultArgs = {};
	let selectedArgs = {};
	let currentSelectedArg;
	let sliderConfig: RangeSliderConfig;

	//let showSlider = Object.keys(selectedArgs).length > 0
	/*REACTIVE STATE*/
	$: layer = $layerList.find((l) => l.id == layerId) as Layer;
	$: url = layer?.dataset?.properties?.url;
	$: layerUrl = getLayerSourceUrl($map, layerId) as string;
	$: layerURL = url ? new URL(url) : undefined;
	$: showSlider = !!currentSelectedArg;

	/* FUNCTIONS*/
	const getArgumentsInURL = () => {
		const llayerURL = new URL(layerUrl);
		return JSON.parse(llayerURL.searchParams.get('params'));
	};

	const init = async () => {
		const isLoaded = await loadMap($map);
		args = await loadArgumentsInDynamicLayers(layerUrl);
		for (const [k, v] of Object.entries(args)) {
			defaultArgs[k] = { value: Number(v.value) };
		}
		selectedArgs = getArgumentsInURL() || selectedArgs;
		if (selectedArgs) currentSelectedArg = Object.keys(selectedArgs).at(-1);
		return isLoaded;
	};

	const deleteArgument = async (argId: string) => {
		currentSelectedArg = argId;
		selectedArgs = { ...(delete selectedArgs[argId] && selectedArgs) };
		await applyParams();
	};

	const reset = async () => {
		selectedArgs = {};
		currentSelectedArg = undefined;
		await applyParams();
	};

	const setSliderValue = async (e) => {
		if (currentSelectedArg) {
			if (!(currentSelectedArg in selectedArgs)) {
				selectedArgs[currentSelectedArg] = { ...defaultArgs[currentSelectedArg] };
			}
			selectedArgs[currentSelectedArg].value = e.detail.value;
			await applyParams();
		}
	};

	const applyParams = async () => {
		const layerStyle = getLayerStyle($map, layer.id);
		const params = {
			params: JSON.stringify(selectedArgs)
		};
		await updateLayerURL(layerStyle, layerURL, params);
	};

	$: {
		if (currentSelectedArg) {
			const currentArgDef = args[currentSelectedArg];
			const {
				limits: { min, max },
				value
			} = currentArgDef;
			const step = (max - min) * 1e-2;
			const v = currentSelectedArg in selectedArgs ? selectedArgs[currentSelectedArg].value : value;

			sliderConfig = { min: min, max: max, step: step, values: [v] };
		}
	}

	//$: console.log(JSON.stringify(selectedArgs, null, 2))
</script>

{#await init()}
	<div>
		<div class="loader-container">
			<Loader size="small" />
		</div>
	</div>
{:then}
	<div class="grid-wrapper pb-5">
		{#each Object.entries(args) as [argId, arg]}
			{@const { icon: icon, value: value, units: units, label: label } = arg}

			<!-- svelte-ignore a11y-click-events-have-key-events -->

			<div class="card {currentSelectedArg && currentSelectedArg == argId ? 'bbp' : 'bbw'}">
				<header
					class={argId in selectedArgs
						? 'card-header has-background-success'
						: 'card-header has-background-info'}
				>
					<p class="card-header-title">&NonBreakingSpace;</p>

					{#if argId in selectedArgs}
						<button
							class="card-header-icon"
							aria-label="more options"
							on:click={() => deleteArgument(argId)}
						>
							<span class="icon has-text-white">
								<i
									class="fas fa-circle-xmark fa-2x"
									title="Remove parameter from simulation"
									aria-hidden="true"
								/>
							</span>
						</button>
					{/if}
				</header>
				<div
					class="card-content is-clickable p-0"
					role="button"
					tabindex="0"
					on:click={() => {
						currentSelectedArg = argId;
					}}
				>
					<div
						class="is-flex is-flex-direction-row is-flex-wrap-nowrap is-justify-content-space-evenly"
						style="height:80px"
					>
						<div class="has-text-primary">
							<i class="fas fa-3x {icon} p-2" aria-hidden="false" />
						</div>
						<div class="is-size-6 has-text-weight-bold p-2">{label}</div>
					</div>
				</div>
				<footer class="card-footer">
					<div class="content m-auto has-text-primary has-text-weight-bold">
						{argId in selectedArgs ? selectedArgs[argId].value : value}
						{units}
					</div>
				</footer>
			</div>
		{/each}
	</div>
	<div class=" range-slider m-auto">
		{#if showSlider}
			<RangeSlider
				min={sliderConfig.min}
				max={sliderConfig.max}
				step={0.1}
				pipstep={Math.round(sliderConfig.step * 200)}
				rest={true}
				float
				first="label"
				last="label"
				values={sliderConfig.values}
				on:stop={setSliderValue}
				springValues={{
					stiffness: 1,
					damping: 1
				}}
				pips="true"
				all="label"
			/>
		{/if}
	</div>
	<div class="columns p-3 mt-1">
		<button disabled={!showSlider} on:click={reset} class="button m-auto is-info">Reset</button>
	</div>
{:catch error}
	Failed to load parameters for {layerId}
	<p style="color: red">{error.message}</p>
{/await}

<style lang="scss">
	@import '@undp-data/undp-bulma/bulma.scss';
	.bbp {
		border-bottom: 3px solid $primary;
	}
	.bbw {
		border-bottom: 3px solid $white;
	}

	.grid-wrapper {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 5px;
	}
	.grid-item {
		//display: inline-block;
		//text-overflow: ellipsis;
		white-space: pre-wrap;
		//overflow: hidden;
	}
	.range-slider {
		--range-handle-focus: #2196f3;
		--range-handle-inactive: #2196f3;
		--range-handle: #2196f3;
		--range-range-inactive: #2196f3;
		margin: 0;
	}
	.remove-arg-button:hover {
		font-color: #1bbbf5;
	}
	.multiline {
		white-space: pre-wrap;
	}
	.loader-container {
		display: flex;
		align-items: center;
		width: fit-content;
		margin: 0 auto;
	}
</style>
