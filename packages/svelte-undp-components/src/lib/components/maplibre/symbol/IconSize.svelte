<script lang="ts" context="module">
	import type { IconImageType } from '$lib/components/ui/IconImageSelector.svelte';

	let icons: { [key: string]: IconImageType } = {};
</script>

<script lang="ts">
	import VectorValueClassification from '$lib/components/maplibre/util/VectorValueClassification.svelte';
	import { ClassificationMethodTypes } from '$lib/constants/ClassificationMethod.js';
	import type { VectorTileMetadata } from '$lib/interfaces/VectorTileMetadata.js';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';
	import { Loader } from '@undp-data/svelte-undp-design';
	import chroma from 'chroma-js';
	import { hexToCSSFilter } from 'hex-to-css-filter';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let defaultIcon = 'circle';
	export let defaultIconSize = 1;
	export let defaultColor: string;
	export let numberOfClasses: number;
	export let numberOfClassesMinimum = 2;
	export let numberOfClassesMaximum = 25;
	export let defaultNumberOfClasses = 5;
	export let classificationMethod: ClassificationMethodTypes =
		ClassificationMethodTypes.NATURAL_BREAK;
	export let numberOfRandomSamplingPoints = 1000;
	export let apiOrigin = '';

	let maxValue = 5;
	let minValue = 0;
	let propertyName = 'icon-size';
	let stepValue = 0.25;

	let cssIconFilter = '';
	let icon: IconImageType | undefined;

	const setCssIconFilter = () => {
		if (!defaultColor) return;
		const rgba = chroma(defaultColor).rgba();
		cssIconFilter = hexToCSSFilter(chroma([rgba[0], rgba[1], rgba[2]]).hex()).filter;
	};

	const getIconImageName = () => {
		const propertyName = 'icon-image';
		const style = $map
			.getStyle()
			.layers.filter((mapLayer: LayerSpecification) => mapLayer.id === layerId)[0];
		if (!style) return defaultIcon;
		if (!style.layout) {
			style.layout = {};
		}
		return style.layout && style.layout[propertyName] ? style.layout[propertyName] : defaultIcon;
	};

	$: defaultColor, setCssIconFilter();

	onMount(() => {
		loadIconImage();
		setCssIconFilter();

		$map.on('styledata', () => {
			loadIconImage();
		});
	});

	const loadIconImage = async () => {
		const name = getIconImageName();
		if (!icons[name]) {
			const res = await fetch(`${apiOrigin}/api/mapstyle/sprite/images/${name}`);
			if (res.ok) {
				const icon = await res.json();
				icons[name] = icon;
			}
		}

		icon = icons[name] ?? undefined;
	};
</script>

{#if icon}
	<VectorValueClassification
		{layerId}
		{metadata}
		bind:defaultValue={defaultIconSize}
		{minValue}
		{maxValue}
		{stepValue}
		{propertyName}
		styleType="layout"
		legendCssTemplate={`margin-left: auto; margin-right: auto; width: calc(1em * {value}); height: calc(1em * {value}); filter: ${cssIconFilter}; background-image: url("${icon.src}"); background-repeat: no-repeat; background-size: contain;`}
		dataLabel="Icon size"
		bind:numberOfClasses
		{numberOfClassesMinimum}
		{numberOfClassesMaximum}
		{defaultNumberOfClasses}
		bind:classificationMethod
		{numberOfRandomSamplingPoints}
	/>
{:else}
	<div class="is-flex is-justify-content-center">
		<Loader size="small" />
	</div>
{/if}
