<script lang="ts">
	import Tags from '$components/pages/map/layers/vector/Tags.svelte';
	import { filterInputTags, MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import arraystat from 'arraystat';
	import { createEventDispatcher, getContext, onDestroy } from 'svelte';
	import RangeSlider from 'svelte-range-slider-pips';
	import { getLayerStyle } from '$lib/helper';
	import type { Layer, VectorLayerTileStatAttribute, VectorTileMetadata } from '$lib/types';
	import type { Listener, MapMouseEvent, SymbolLayerSpecification } from 'maplibre-gl';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let propertySelectedValue: string;
	export let expressionValue: number[];
	export let acceptSingleTag = true;
	export let layer: Layer;
	export let operator:
		| '>'
		| '<'
		| '>='
		| '<='
		| '=='
		| '!='
		| 'in'
		| '!in'
		| 'has'
		| '!has'
		| 'all'
		| 'none'
		| 'any';

	const layerStyle = getLayerStyle($map, layer.id);
	const metadata = layer.info as VectorTileMetadata;
	const tilestatLayer = metadata.json.tilestats.layers.find(
		(l) => l.layer === layerStyle['source-layer']
	);
	const propertyProps = tilestatLayer.attributes.find(
		(e) => e['attribute'] === propertySelectedValue
	);
	const dataType = propertyProps['type'];
	let warningSingleTagEqual = false;
	let badSingleTagValue;
	//console.log(propertySelectedValue, dataType)

	const layerId = layer.id;

	const attrstats = tilestatLayer.attributes.filter((el: VectorLayerTileStatAttribute) => {
		return el.attribute == propertySelectedValue;
	})[0];

	if (!attrstats) {
		//this should not happen, however....it could so a recation must be set (error)
		console.log('unexpected situation');
	}

	//console.log(JSON.stringify(attrstats))

	const hasManyFeatures = attrstats.count > 250;
	//console.log(`${propertySelectedValue} has many features ${hasManyFeatures} ${attrstats.count}`)

	const dispatch = createEventDispatcher();

	//console.log(layer)
	let hideOptions = true;
	let uv: string[] = undefined;
	let clickFuncs: Listener[] = [];
	let cursor: string;
	let mapClickButtonDisabled = false;
	let sv: Array<number> = [];
	let calculatedStep: number;
	let min: number;
	let max: number;
	let vals: Array<number> = [];
	let svals: Array<number> = [];

	let sindex: number;
	let eindex: number;
	let closest: number;
	let index: number;
	let sol: [];
	const nn = 5;
	$: tagsList = $filterInputTags;

	const fclosest = (array, goal) =>
		array.reduce((prev, curr) => (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev));

	if (hasManyFeatures) {
		// console.log(`stats for ${propertySelectedValue} =>  ${JSON.stringify(attrstats, null, '\t')}`)
		min = Number(attrstats.min);
		max = Number(attrstats.max);
		const range = max - min;
		calculatedStep =
			Number.isInteger(attrstats.median) && Number.isInteger(min)
				? ~~(range * 1e-4) || 1
				: range * 1e-4;

		sv = [attrstats.median];
		//console.log(`calculatedStep is ${calculatedStep} ${min}-${max} ${attrstats.median}`)
	} else {
		let features = $map.querySourceFeatures({ layers: [layerId] });

		if (features.length == 0) {
			const layerStyle = getLayerStyle($map, layer.id);
			features = $map.querySourceFeatures(layerStyle.source, {
				sourceLayer: layerStyle['source-layer'],
				filter: undefined
			});
		}

		// get the values of the property for each feature
		const values = features
			.filter((f) => f.properties[propertySelectedValue] != undefined)
			.map((feature) => feature.properties[propertySelectedValue]);

		let optionsList: number[] = [...new Set(values.flat())];
		sol = Array.from(optionsList).sort((a, b) => a - b);

		if (dataType != 'string') {
			const astats = arraystat(sol);
			min = astats.min;
			max = astats.max;
			//                                        negative               0->1
			calculatedStep = Number.isInteger(min) ? ~~(astats.range * 1e-2) || 1 : astats.range * 1e-2;
			let closest = fclosest(sol, astats.median);
			sv = [closest];

			index = sol.indexOf(closest);
			//console.log(` value: ${sv}, index: ${index}, closest ${closest}`)
			sindex = index - nn < 0 ? 0 : index - nn;
			eindex = index + nn > sol.length - 1 ? sol.length : index + nn;
			vals = sol.slice(sindex, eindex);
			svals = vals.sort();
		}
	}

	$: {
		if (!hasManyFeatures && dataType != 'string') {
			closest = fclosest(sol, sv[0]);
			index = sol.indexOf(closest);
			//console.log(` value: ${sv}, index: ${index}, closest ${closest}`)
			sindex = index - nn < 0 ? 0 : index - nn;
			eindex = index + nn > sol.length - 1 ? sol.length : index + nn;
			vals = sol.slice(sindex, eindex);
			svals = vals.sort();
		}
	}

	const onSliderStop = (event: CustomEvent) => {
		expressionValue = event.detail.value;
		dispatch('sliderStop', event.detail);
	};

	onDestroy(() => {
		restoreQ();
	});

	const handleTags = (event: CustomEvent) => {
		//console.log('CE')
		if (warningSingleTagEqual) {
			warningSingleTagEqual = !warningSingleTagEqual; //reset
			//tagsList = []
			badSingleTagValue = null;
		}
		//console.log(event.detail.tags, acceptSingleTag, sol.includes(event.detail.tags[0]))

		if (acceptSingleTag) {
			if (sol.includes(event.detail.tags[0])) {
				tagsList = event.detail.tags;
			} else {
				tagsList = [];
				badSingleTagValue = event.detail.tags[0];
				warningSingleTagEqual = !warningSingleTagEqual; //set
			}
		} else {
			tagsList = event.detail.tags;
			// tagsList = []
			// badSingleTagValue = event.detail.tags[0]
			// warningSingleTagEqual = !warningSingleTagEqual //set
		}
	};

	const applyTags = () => {
		const filteredTags = tagsList.filter((tag) => !sol.includes(tag));
		$filterInputTags = [...$filterInputTags, ...filteredTags];
		if (filteredTags.length > 0) {
			dispatch('customTags', tagsList);
		} else {
			expressionValue = tagsList;
		}

		dispatch('apply');
	};

	const apply = () => {
		if (!expressionValue) expressionValue = sv[0];
		tagsList = [];
		clearClickLayer();
		dispatch('apply');
	};

	const clearClickLayer = () => {
		if (layer.children?.length > 0) {
			const child = layer.children.find((l) => l.id === `${layerId}-select`);
			if (child) {
				if ($map.getLayer(child.id)) {
					$map.removeLayer(child.id);
				}
				layer.children.splice(layer.children.indexOf(child), 1);
			}
		}
	};

	const handleMapClick = async (e: MapMouseEvent) => {
		try {
			if (e.features) {
				const features = e.features;
				// console.log(`operator: ${operator} ${operator.includes('in')} ${uv}`)
				if (operator.includes('in')) {
					if (Array.isArray(uv)) {
						uv = [...uv, features[0].properties[propertySelectedValue]];
					} else {
						uv = [features[0].properties[propertySelectedValue]];
					}
				} else {
					uv = features[0].properties[propertySelectedValue];
				}
			}
		} catch (error) {
			console.log(`got err ${error}`);
		}
	};

	const getFromMap = async () => {
		mapClickButtonDisabled = !mapClickButtonDisabled;
		cursor = $map.getCanvas().style.cursor;
		$map.getCanvas().style.cursor = 'cell';
		if (clickFuncs.length == 0) {
			clickFuncs = [...$map._listeners.click];
		}
		for (var func of clickFuncs) {
			$map.off('click', func);
		}

		const layerStyle = getLayerStyle($map, layerId);
		if (layerStyle.type === 'heatmap') {
			const clickLayerId = `${layerId}-select`;
			const clickLayer: SymbolLayerSpecification = {
				id: clickLayerId,
				type: 'symbol',
				source: layerStyle.source,
				'source-layer': layerStyle['source-layer'],
				layout: {
					visibility: 'visible',
					'icon-image': 'circle',
					'icon-size': 1
				},
				paint: {
					'icon-color': '#000000'
				}
			};
			if (!$map.getLayer(clickLayerId)) {
				$map.addLayer(clickLayer);
				if (!layer.children) {
					layer.children = [];
				}
				layer.children = [
					...layer.children,
					{
						id: clickLayerId,
						name: 'select-feature',
						info: layer.info,
						parentId: layerId,
						dataset: undefined
					}
				];
			}
			$map.on('click', clickLayerId, handleMapClick);
		} else {
			$map.on('click', layerId, handleMapClick);
		}
	};

	const restoreQ = () => {
		mapClickButtonDisabled = !mapClickButtonDisabled;
		$map.off('click', layerId, handleMapClick);
		for (var func of clickFuncs) {
			$map.on('click', func);
		}
		$map.getCanvas().style.cursor = cursor;
	};

	const formatter = (v: number) => {
		//console.log('formatting')

		return v;
	};
</script>

<div class="content" style="width:100%; height:100%">
	{#if hasManyFeatures}
		{#if dataType === 'string'}
			<div class="columns is-centered pb-2">
				<button
					class="button is-small primary-button"
					on:click={getFromMap}
					disabled={mapClickButtonDisabled}
				>
					<i title="Select a value from the map" class="fa fa-map-location-dot" /> &nbsp; Select from
					map
				</button>
			</div>
			{#if uv}
				<div class="is-flex is-flex-direction-column is-align-items-center is-justify-items-center">
					<div class="notification is-size-6 has-text-centered">
						Selected value: <span class="has-text-weight-bold"> {uv} </span>
					</div>
					<div class=" ">
						<button
							class="button is-small primary-button"
							on:click={() => {
								expressionValue = Array.isArray(uv) ? uv : [uv];
								apply();
								restoreQ();
							}}
						>
							<i class="fa fa-hammer" />&nbsp; Apply
						</button>
					</div>
				</div>
			{/if}
		{:else}
			<!-- Numeric many values-->
			<!-- Numeric, many features few UV could be handled specially-->
			<!-- {#if attrstats.values.length < 25 && !['<', '>'].includes(operator) }

                    <div class="buttons">
                        {#each attrstats.values as v}
                            <button
                                on:click={(e) => {
                                    expressionValue = v
                                    apply(e)
                                }}
                                class="button has-background-info-light">
                                {v}
                            </button>
                        {/each}
                    </div>
                {:else}
                    
                    DADA

                {/if} -->

			{#if ['<', '>'].includes(operator)}
				<div class="range-slider">
					<RangeSlider
						bind:values={sv}
						float
						pips={calculatedStep}
						{min}
						{max}
						step={calculatedStep}
						range="min"
						first="label"
						last="label"
						rest={false}
						on:stop={onSliderStop}
					/>
				</div>
				<div class="columns is-centered pb-2">
					<button class="button is-small primary-button" on:click={apply}
						><i class="fa fa-hammer" />&nbsp; Apply</button
					>
				</div>
			{:else}
				<div class="columns is-centered pb-2">
					<button
						class="button is-small primary-button"
						on:click={getFromMap}
						disabled={mapClickButtonDisabled}
					>
						<i title="Select a value from the map" class="fa fa-map-location-dot" /> &nbsp; Select from
						map
					</button>
				</div>
				{#if uv}
					<div
						class="is-flex is-flex-direction-column is-align-items-center is-justify-items-center"
					>
						<div class="notification is-size-6 has-text-centered">
							{#if typeof uv === 'number'}
								Selected value: <span class="has-text-weight-bold">
									{new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(uv)}
								</span>
							{:else}
								Selected value: <span class="has-text-weight-bold"> {uv} </span>
							{/if}
						</div>
						<div class=" ">
							<button
								class="button is-small primary-button"
								on:click={() => {
									expressionValue = uv;
									apply();
									restoreQ();
								}}
							>
								<i class="fa fa-hammer" />&nbsp; Apply
							</button>
						</div>
					</div>
				{/if}
			{/if}
		{/if}
	{:else}
		<!--FEW features-->

		{#if dataType === 'string'}
			<div>
				{#if acceptSingleTag}
					{#if warningSingleTagEqual}
						<div class="notification has-background-danger-light is-size-6 has-text-danger">
							<i class="fa-solid fa-circle-info has-text-danger" />
							<span class="subtitle has-text-weight-bold">{badSingleTagValue}</span>
							does not exist in
							<span class="has-text-weight-bold message is-primary p-2"
								>{propertySelectedValue}</span
							>
							property
						</div>
					{:else}
						<div class="notification has-background-danger-light is-size-6 has-text-danger">
							<i class="fa-solid fa-circle-info has-text-danger" /> Only one value can be accepted when
							equals = or ≠ operators are used
						</div>
					{/if}
				{/if}

				<Tags
					on:tags={handleTags}
					maxTags={acceptSingleTag ? 1 : 100}
					addKeys={[9, 13]}
					splitWith={'/'}
					onlyUnique={true}
					removeKeys={[27]}
					placeholder={'Select a value...'}
					autoComplete={sol}
					tags={tagsList}
					allowBlur={true}
					disable={acceptSingleTag && tagsList.length > 0}
					minChars={0}
					onlyAutocomplete={false}
					labelShow={false}
					{hideOptions}
				/>
				<div
					class="pt-4 is-flex flex-wrap is-flex-direction-columns is-justify-content-space-between is-rounded"
				>
					<div>
						<button class="button is-rounded is-small is-info">
							<i class="fa-solid fa-circle-info" />
						</button>
					</div>
					<div>
						<button
							disabled={tagsList.length === 0}
							class="button is-small primary-button"
							on:click={applyTags}
							><i class="fa fa-hammer" />&nbsp; Apply
						</button>
					</div>
				</div>
			</div>
		{:else}
			<!--Numeric property-->
			{#if !['<', '>'].includes(operator)}
				<!--<> operators use slider-->

				<div class="range-slider">
					<RangeSlider
						bind:values={sv}
						float
						pips={calculatedStep}
						{min}
						{max}
						step={calculatedStep}
						range="min"
						first="label"
						last="label"
						rest={false}
					/>
				</div>

				<div class="buttons">
					{#each svals as v}
						<button
							on:click={(e) => {
								expressionValue = v;
								apply(e);
							}}
							class="button has-background-info-light"
						>
							{v}
						</button>
					{/each}
				</div>
			{:else}
				<div class="range-slider">
					<RangeSlider
						bind:values={sv}
						float
						pips={calculatedStep}
						{min}
						{max}
						step={calculatedStep}
						range="min"
						first="label"
						last="label"
						springValues={{ stiffness: 0.15, damping: 0.4 }}
						rest={false}
						{formatter}
						on:stop={onSliderStop}
					/>
				</div>
				<div class="columns is-centered pb-2">
					<button class="button is-small primary-button" on:click={apply}
						><i class="fa fa-hammer" />&nbsp; Apply</button
					>
				</div>
			{/if}
		{/if}
	{/if}
</div>

<style lang="scss">
	// .grid {
	//   display: grid;
	//   grid-template-columns: repeat(5, 1fr);
	//   grid-gap: 1px;
	// }

	// .grid-item {
	//   width: 100% !important;
	//   height: 100% !important;
	// }

	// .input {
	//   margin-top: 5%;
	//   margin-left: auto;
	//   margin-right: auto;
	// }

	// .unique-values-card {
	//   height: 50px;
	//   width: 50px;
	//   background-color: #fff;
	//   border: 1px solid #ccc;
	//   border-radius: 5px;
	//   margin: 5px;
	//   display: flex;
	//   justify-content: center;
	//   align-items: center;
	//   cursor: pointer;
	// }

	// .unique-values-card:hover {
	//   background-color: #f5f5f5;
	// }

	// .disable {
	//   pointer-events: none;
	//   cursor: not-allowed;
	// }
	.range-slider {
		--range-handle-focus: #2196f3;
		--range-handle-inactive: #2196f3;
		--range-handle: #2196f3;
		--range-range-inactive: #2196f3;
		margin: 0;
	}
</style>
