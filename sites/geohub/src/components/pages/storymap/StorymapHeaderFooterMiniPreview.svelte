<script lang="ts">
	import { page } from '$app/stores';
	import { getMapImageFromStyle } from '$lib/helper';
	import type { StoryMapConfig } from '$lib/types';
	import {
		layerTypes,
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		StoryMapFooter,
		StoryMapHeader,
		type StoryMapConfigStore,
		type StoryMapTemplate
	} from '@undp-data/svelte-maplibre-storymap';
	import { initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { type StyleSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);
	let template_id: StoryMapTemplate;

	export let isActive = false;
	export let disabled = false;
	export let isHeader = true;

	let isHovered = false;

	const tippyTooltip = initTooltipTippy();

	let mapStyle: StyleSpecification;

	let mapImageData: string;

	onMount(async () => {
		updateMapStyle();
		configStore.subscribe(updateMapStyle);
	});

	const applyLayerEvent = async () => {
		if (!mapStyle) {
			if (typeof $configStore.style === 'string') {
				const res = await fetch($configStore.style);
				mapStyle = await res.json();
			} else {
				mapStyle = $configStore.style;
			}
		}

		if (!isHeader) {
			if ($configStore.chapters?.length > 0) {
				const lastChapter = $configStore.chapters[$configStore.chapters.length - 1];
				const res = await fetch(lastChapter.style as string);
				const chapterStyle: StyleSpecification = await res.json();

				lastChapter.onChapterEnter?.forEach((layer) => {
					const index = chapterStyle.layers.findIndex((l) => l.id === layer.layer);
					if (index === -1) return;
					const l = chapterStyle.layers[index];
					const props = layerTypes[l.type];
					if (!(props && props.length > 0)) return;
					props.forEach((prop) => {
						chapterStyle.layers[index].paint[prop] = layer.opacity;
					});
					mapStyle = chapterStyle;
				});

				mapStyle.bearing = lastChapter.location.bearing;
				mapStyle.pitch = lastChapter.location.pitch;
				mapStyle.zoom = lastChapter.location.zoom;
				mapStyle.center = lastChapter.location.center;
			}
		}

		return mapStyle;
	};

	const updateMapStyle = debounce(async () => {
		template_id = ($configStore as StoryMapConfig).template_id as StoryMapTemplate;
		const newStyle = await applyLayerEvent();
		mapImageData = await getMapImageFromStyle(newStyle, 212, 124, $page.data.staticApiUrl);
	}, 300);

	const handleSettingClicked = () => {
		dispatch('edit');
	};
</script>

<div
	class="preview {isActive ? 'is-active' : ''} {!isActive && isHovered ? 'is-hover' : ''}"
	role="menuitem"
	tabindex="-1"
	on:mouseenter={() => {
		isHovered = true;
	}}
	on:mouseleave={() => {
		isHovered = false;
	}}
>
	{#if mapImageData}
		<div class="image-preview">
			<img src={mapImageData} alt="map preview" loading="lazy" width={212} height={124} />

			<div
				class="card-overlay {isHeader
					? 'is-flex is-align-items-center is-justify-content-center'
					: 'is-flex is-align-items-end card-footer'}"
			>
				{#key template_id}
					{#if isHeader}
						<StoryMapHeader bind:template={template_id} size="small" />
					{:else}
						<StoryMapFooter bind:template={template_id} size="small" />
					{/if}
				{/key}
			</div>
		</div>
	{:else if $configStore.style}
		<div class="is-flex is-justify-content-center mt-6">
			<Loader size="small" />
		</div>
	{:else}
		<div class="is-flex is-justify-content-center mt-6">
			<span class="material-symbols-outlined"> sync_problem </span>
		</div>
	{/if}
	{#if isActive || isHovered}
		<div class="is-flex ope-buttons">
			<button
				class="ope-button mr-1 is-flex is-align-items-center is-justify-content-center"
				on:click={handleSettingClicked}
				{disabled}
				use:tippyTooltip={{ content: 'Change the setting of this slide' }}
			>
				<span class="material-symbols-outlined small-icon"> settings </span>
			</button>
		</div>
	{/if}
</div>

<style lang="scss">
	.preview {
		position: relative;
		width: 100%;
		height: 128px;

		&.is-active {
			border: 2px solid #4f95dd;
		}

		&.is-hover {
			border: 2px solid #55606e;
		}

		.ope-buttons {
			position: absolute;
			bottom: 4px;
			left: 8px;
			z-index: 10;
		}

		.ope-button {
			width: 24px;
			height: 24px;
			border-radius: 50%;
			background-color: white;
			border: none;
			color: #55606e;

			.small-icon {
				font-size: 16px !important;
			}

			&:hover {
				background-color: #f7f7f7;
				color: gray;
			}
		}

		.image-preview {
			position: relative;

			.card-overlay {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				-webkit-transform: translate(-50%, -50%);
				-ms-transform: translate(-50%, -50%);
				width: 100%;

				&.card-footer {
					bottom: 0%;
					left: 50%;
					transform: translate(-50%, 0%);
					-webkit-transform: translate(-50%, 0%);
					-ms-transform: translate(-50%, 0%);
				}
			}
		}
	}
</style>
