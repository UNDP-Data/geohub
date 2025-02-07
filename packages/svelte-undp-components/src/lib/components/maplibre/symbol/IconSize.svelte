<script lang="ts" module>
	import type { IconImageType } from '$lib/components/ui/IconImageSelector.svelte';

	let icons: { [key: string]: IconImageType } = {};
</script>

<script lang="ts">
	import VectorValueClassification from '$lib/components/maplibre/util/VectorValueClassification.svelte';
	import { ClassificationMethodTypes } from '$lib/constants/ClassificationMethod';
	import type { VectorTileMetadata } from '$lib/interfaces/VectorTileMetadata';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import chroma from 'chroma-js';
	import { hexToCSSFilter } from 'hex-to-css-filter';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount, untrack } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
		metadata: VectorTileMetadata;
		defaultIcon?: string;
		defaultIconSize?: number;
		defaultColor: string;
		numberOfClasses: number;
		numberOfClassesMinimum?: number;
		numberOfClassesMaximum?: number;
		defaultNumberOfClasses?: number;
		classificationMethod?: ClassificationMethodTypes;
		numberOfRandomSamplingPoints?: number;
		apiOrigin?: string;
	}

	let {
		layerId = $bindable(),
		metadata = $bindable(),
		defaultIcon = $bindable('circle'),
		defaultIconSize = $bindable(1),
		defaultColor = $bindable(),
		numberOfClasses = $bindable(),
		numberOfClassesMinimum = $bindable(2),
		numberOfClassesMaximum = $bindable(25),
		defaultNumberOfClasses = $bindable(5),
		classificationMethod = $bindable(ClassificationMethodTypes.NATURAL_BREAK),
		numberOfRandomSamplingPoints = $bindable(1000),
		apiOrigin = $bindable('')
	}: Props = $props();

	let maxValue = 5;
	let minValue = 0;
	let propertyName = 'icon-size';
	let stepValue = 0.25;

	let cssIconFilter = $state('');
	let icon: IconImageType | undefined = $state();

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

	$effect(() => {
		if (defaultColor) {
			untrack(() => {
				setCssIconFilter();
			});
		}
	});

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
