<script lang="ts" context="module">
	let icons: { [key: string]: IconImageType } = {};
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import VectorValueClassification from '$components/maplibre/vector/VectorValueClassification.svelte';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY_2,
		DEFAULTCOLOR_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY_2,
		type ClassificationMethodStore,
		type DefaultColorStore,
		type NumberOfClassesStore
	} from '$stores';
	import {
		MAPSTORE_CONTEXT_KEY,
		Notification,
		type IconImageType,
		type MapStore,
		type VectorTileMetadata
	} from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import chroma from 'chroma-js';
	import { hexToCSSFilter } from 'hex-to-css-filter';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const defaultColorStore: DefaultColorStore = getContext(DEFAULTCOLOR_CONTEXT_KEY);
	const numberOfClassesStore: NumberOfClassesStore = getContext(NUMBER_OF_CLASSES_CONTEXT_KEY_2);
	const classificationMethodStore: ClassificationMethodStore = getContext(
		CLASSIFICATION_METHOD_CONTEXT_KEY_2
	);

	export let layerId: string;
	export let metadata: VectorTileMetadata;

	let config: UserConfig = $page.data.config;

	let defaultIconSize = config.IconSize;
	let maxValue = 5;
	let minValue = 0;
	let propertyName = 'icon-size';
	let stepValue = 0.25;

	let cssIconFilter = '';
	let isUpaded = false;

	const setCssIconFilter = () => {
		const rgba = chroma($defaultColorStore).rgba();
		cssIconFilter = hexToCSSFilter(chroma([rgba[0], rgba[1], rgba[2]]).hex()).filter;
	};

	const getIconImageName = () => {
		const propertyName = 'icon-image';
		const style = $map
			.getStyle()
			.layers.filter((mapLayer: LayerSpecification) => mapLayer.id === layerId)[0];
		return style.layout && style.layout[propertyName] ? style.layout[propertyName] : 'circle';
	};

	onMount(() => {
		setCssIconFilter();

		defaultColorStore.subscribe(() => {
			setCssIconFilter();
		});

		$map?.on('styledata', () => {
			isUpaded = !isUpaded;
		});
	});

	const loadIconImage = async () => {
		const name = getIconImageName();
		if (!icons[name]) {
			const res = await fetch(`/api/mapstyle/sprite/images/${name}`);
			if (res.ok) {
				const icon = await res.json();
				icons[name] = icon;
			}
		}

		return icons[name] ?? undefined;
	};
</script>

{#key isUpaded}
	{#await loadIconImage()}
		<div class="is-flex is-justify-content-center">
			<Loader size="small" />
		</div>
	{:then icon}
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
				bind:numberOfClasses={$numberOfClassesStore}
				defaultNumberOfClasses={$page.data.config.NumberOfClasses}
				bind:classificationMethod={$classificationMethodStore}
			/>
		{:else}
			<Notification type="danger" showCloseButton={false} showIcon={false}>
				Failed to load icon image.
			</Notification>
		{/if}
	{/await}
{/key}
