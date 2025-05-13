<script lang="ts">
	import Tags from '$components/pages/map/layers/vector/Tags.svelte';
	import { getLayerStyle } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import {
		MAPSTORE_CONTEXT_KEY,
		Slider,
		type MapStore,
		type VectorLayerTileStatAttribute,
		type VectorTileMetadata
	} from '@undp-data/svelte-undp-components';
	import arraystat from 'arraystat';
	import type { Listener, MapMouseEvent, SymbolLayerSpecification } from 'maplibre-gl';
	import { getContext, onDestroy } from 'svelte';
	import { FILTER_INPUTTAGS_CONTEXT_KEY, type FilterInputTags } from './VectorFilter.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	const filterInputTags: FilterInputTags = getContext(FILTER_INPUTTAGS_CONTEXT_KEY);

	interface Props {
		propertySelectedValue: string;
		expressionValue: number[];
		acceptSingleTag?: boolean;
		layer: Layer;
		operator:
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
		onapply?: () => void;
		oncustomTags?: (tagsList: unknown) => void;
		onsliderStop?: (values: number[]) => void;
	}

	let {
		propertySelectedValue = $bindable(),
		expressionValue = $bindable(),
		acceptSingleTag = $bindable(true),
		layer = $bindable(),
		operator = $bindable(),
		onapply = () => {},
		oncustomTags = (tagsList) => {
			console.log(tagsList);
		},
		onsliderStop = () => {}
	}: Props = $props();

	const layerStyle = getLayerStyle($map, layer.id);
	const metadata = layer.info as VectorTileMetadata;
	const tilestatLayer = metadata.json.tilestats.layers.find(
		(l) => l.layer === layerStyle['source-layer']
	);
	const propertyProps = tilestatLayer.attributes.find(
		(e) => e['attribute'] === propertySelectedValue
	);
	const dataType = propertyProps['type'];
	let warningSingleTagEqual = $state(false);
	let badSingleTagValue = $state();

	const layerId = layer.id;

	const attrstats = tilestatLayer.attributes.filter((el: VectorLayerTileStatAttribute) => {
		return el.attribute == propertySelectedValue;
	})[0];

	if (!attrstats) {
		//this should not happen, however....it could so a recation must be set (error)
		console.log('unexpected situation');
	}

	const hasManyFeatures = attrstats.count > 250;

	let hideOptions = true;
	let uv: string[] = $state(undefined);
	let clickFuncs: Listener[] = [];
	let cursor: string;
	let mapClickButtonDisabled = $state(false);
	let sv: Array<number> = $state([]);
	let calculatedStep: number = $state();
	let min: number = $state();
	let max: number = $state();
	let svals: Array<number> = $state([]);

	let sol: string[] = $state([]);
	const nn = 5;
	let tagsList: string[] = $derived($filterInputTags);

	const fclosest = (array, goal) =>
		array.reduce((prev, curr) => (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev));

	if (hasManyFeatures) {
		const values = attrstats.values?.map((v) => (typeof v === 'string' ? Number(v) : v));
		const stats = values ? arraystat(values) : undefined;
		const _min = attrstats?.min ? Number(attrstats.min) : stats.min;
		const _max = attrstats?.max ? Number(attrstats.max) : stats.max;
		const range = _max - _min;
		calculatedStep =
			Number.isInteger(attrstats.median) && Number.isInteger(_min)
				? ~~(range * 1e-4) || 1
				: range * 1e-4;

		sv = attrstats?.median ? [attrstats.median] : [stats.median];
		min = _min;
		max = _max;
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
		const _sol = Array.from(optionsList).sort((a, b) => a - b);
		sol = _sol as unknown as string[];
		if (!['string', 'mixed'].includes(dataType)) {
			const astats = arraystat(_sol);
			const _min = astats.min;
			const _max = astats.max;
			//                                        negative               0->1
			calculatedStep = Number.isInteger(_min) ? ~~(astats.range * 1e-2) || 1 : astats.range * 1e-2;
			let closest = fclosest(_sol, astats.median);
			sv = [closest];

			const index = _sol.indexOf(closest);
			const sindex = index - nn < 0 ? 0 : index - nn;
			const eindex = index + nn > _sol.length - 1 ? _sol.length : index + nn;
			const vals = _sol.slice(sindex, eindex);
			svals = vals.sort();

			min = _min;
			max = _max;
		}
	}

	$effect(() => {
		if (!hasManyFeatures && !['string', 'mixed'].includes(dataType)) {
			const closest = fclosest(sol, sv[0]);
			const index = sol.indexOf(closest);
			const sindex = index - nn < 0 ? 0 : index - nn;
			const eindex = index + nn > sol.length - 1 ? sol.length : index + nn;
			const vals = sol.slice(sindex, eindex);
			svals = vals.sort() as unknown as number[];
		}
	});

	const onSliderStop = (values: number[]) => {
		expressionValue = values;
		if (onsliderStop) onsliderStop(values);
	};

	onDestroy(() => {
		restoreQ();
	});

	const handleTags = (tags: string[]) => {
		//console.log('CE')
		if (warningSingleTagEqual) {
			warningSingleTagEqual = !warningSingleTagEqual; //reset
			//tagsList = []
			badSingleTagValue = null;
		}

		if (acceptSingleTag) {
			const firstTag = tags[0];
			if (sol.includes(firstTag)) {
				tagsList = tags;
			} else {
				tagsList = [];
				badSingleTagValue = tags[0];
				warningSingleTagEqual = !warningSingleTagEqual; //set
			}
		} else {
			tagsList = tags;
		}
	};

	const applyTags = () => {
		const filteredTags = tagsList.filter((tag) => !sol.includes(tag));
		$filterInputTags = [...$filterInputTags, ...filteredTags];
		if (filteredTags.length > 0) {
			if (oncustomTags) {
				oncustomTags(tagsList);
			}
		} else {
			expressionValue = tagsList;
		}

		if (onapply) {
			onapply();
		}
	};

	const apply = () => {
		if (!expressionValue) expressionValue = sv[0];
		tagsList = [];
		clearClickLayer();
		if (onapply) {
			onapply();
		}
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

				const selectedValue = features[0].properties[propertySelectedValue];
				if (selectedValue) {
					if (operator.includes('in')) {
						if (Array.isArray(uv)) {
							uv = [...uv, selectedValue];
						} else {
							uv = [selectedValue];
						}
					} else {
						uv = selectedValue;
					}
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
</script>

<div class="content" style="width:100%; height:100%">
	{#if hasManyFeatures}
		{#if ['string', 'mixed'].includes(dataType)}
			<div class="columns is-centered pb-2">
				<button
					class="button is-small is-uppercase has-text-weight-bold is-link"
					onclick={getFromMap}
					disabled={mapClickButtonDisabled}
				>
					Select from map
				</button>
			</div>
			{#if uv}
				<div class="is-flex is-flex-direction-column is-align-items-center is-justify-items-center">
					<div class="notification is-size-6 has-text-centered">
						Selected value: <span class="has-text-weight-bold"> {uv} </span>
					</div>
					<div class=" ">
						<button
							class="button is-small is-uppercase has-text-weight-bold is-link"
							onclick={() => {
								expressionValue = Array.isArray(uv) ? uv : [uv];
								apply();
								restoreQ();
							}}
						>
							Apply
						</button>
					</div>
				</div>
			{/if}
		{:else}
			<!-- Numeric many values-->
			<!-- Numeric, many features few UV could be handled specially-->
			{#if ['<', '>'].includes(operator)}
				<Slider
					bind:values={sv}
					{min}
					{max}
					step={calculatedStep}
					range="min"
					first="label"
					last="label"
					rest={false}
					onchange={onSliderStop}
				/>
				<div class="columns is-centered pb-2">
					<button class="button is-small is-uppercase has-text-weight-bold is-link" onclick={apply}>
						Apply</button
					>
				</div>
			{:else}
				<div class="columns is-centered pb-2">
					<button
						class="button is-small is-uppercase has-text-weight-bold is-link"
						onclick={getFromMap}
						disabled={mapClickButtonDisabled}
					>
						Select from map
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
								class="button is-small is-uppercase has-text-weight-bold is-link"
								onclick={() => {
									expressionValue = uv;
									apply();
									restoreQ();
								}}
							>
								Apply
							</button>
						</div>
					</div>
				{/if}
			{/if}
		{/if}
	{:else}
		<!--FEW features-->

		{#if ['string', 'mixed'].includes(dataType)}
			<div>
				{#if acceptSingleTag}
					{#if warningSingleTagEqual}
						<div class="notification has-background-danger-light is-size-6 has-text-danger">
							<i class="fa-solid fa-circle-info has-text-danger"></i>
							<span class="subtitle has-text-weight-bold">{badSingleTagValue}</span>
							does not exist in
							<span class="has-text-weight-bold message is-primary p-2"
								>{propertySelectedValue}</span
							>
							property
						</div>
					{:else}
						<div class="notification has-background-danger-light is-size-6 has-text-danger">
							<i class="fa-solid fa-circle-info has-text-danger"></i>
							Only one value can be accepted when equals = or ≠ operators are used
						</div>
					{/if}
				{/if}

				<Tags
					ontags={handleTags}
					maxTags={acceptSingleTag ? 1 : 100}
					splitWith="/"
					onlyUnique={true}
					removeKeys={[27]}
					placeholder="Select a value..."
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
						<button
							disabled={tagsList.length === 0}
							class="button is-small is-uppercase has-text-weight-bold is-link"
							onclick={applyTags}
						>
							Apply
						</button>
					</div>
				</div>
			</div>
		{:else}
			<!--Numeric property-->
			{#if !['<', '>'].includes(operator)}
				<!--<> operators use slider-->

				<Slider
					bind:values={sv}
					{min}
					{max}
					step={calculatedStep}
					range="min"
					first="label"
					last="label"
					rest={false}
				/>

				<div class="buttons">
					{#each svals as v (svals.indexOf(v))}
						<button
							onclick={(e) => {
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
				<Slider
					bind:values={sv}
					{min}
					{max}
					step={calculatedStep}
					range="min"
					first="label"
					last="label"
					rest={false}
					onchange={onSliderStop}
				/>
				<div class="columns is-centered pb-2">
					<button class="button is-small is-uppercase has-text-weight-bold is-link" onclick={apply}>
						Apply
					</button>
				</div>
			{/if}
		{/if}
	{/if}
</div>
