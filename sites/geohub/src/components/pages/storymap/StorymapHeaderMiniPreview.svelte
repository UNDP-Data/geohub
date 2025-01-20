<script lang="ts">
	import { page } from '$app/state';
	import { getMapImageFromStyle } from '$lib/helper';
	import type { StoryMapConfig } from '$lib/types';
	import {
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		StoryMapHeader,
		type StoryMapConfigStore,
		type StoryMapTemplate
	} from '@undp-data/svelte-maplibre-storymap';
	import { initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { type StyleSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);
	let template_id: StoryMapTemplate = $state('light');

	interface Props {
		isActive?: boolean;
		disabled?: boolean;
		onedit?: () => void;
	}

	let {
		isActive = $bindable(false),
		disabled = $bindable(false),
		onedit = () => {}
	}: Props = $props();

	let isHovered = $state(false);

	const tippyTooltip = initTooltipTippy();

	let mapStyle: StyleSpecification;

	let mapImageData: string = $state('');

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

		if ($configStore.location?.center && $configStore.location.center[0] !== null) {
			// if center is not undefined, use location from config
			mapStyle.bearing = $configStore.location.bearing ?? 0;
			mapStyle.pitch = $configStore.location.pitch ?? 0;
			mapStyle.center = $configStore.location.center;
			mapStyle.zoom = $configStore.location.zoom;
		}

		return mapStyle;
	};

	const updateMapStyle = debounce(async () => {
		template_id = ($configStore as StoryMapConfig).template_id as StoryMapTemplate;
		const newStyle = await applyLayerEvent();
		mapImageData = await getMapImageFromStyle(newStyle, 212, 124, page.data.staticApiUrl);
	}, 300);

	const handleSettingClicked = () => {
		if (onedit) onedit();
	};
</script>

<div
	class="preview {isActive ? 'is-active' : ''} {!isActive && isHovered ? 'is-hover' : ''}"
	role="menuitem"
	tabindex="-1"
	onmouseenter={() => {
		isHovered = true;
	}}
	onmouseleave={() => {
		isHovered = false;
	}}
>
	{#if mapImageData}
		<div class="image-preview">
			<img src={mapImageData} alt="map preview" loading="lazy" width={212} height={124} />

			<div class="card-overlay is-flex is-align-items-center is-justify-content-center">
				{#key template_id}
					<StoryMapHeader bind:template={template_id} size="small" />
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
				onclick={handleSettingClicked}
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
			bottom: 6px;
			left: 6px;
			z-index: 10;
		}

		.ope-button {
			width: 24px;
			height: 24px;
			border-radius: 50%;
			background-color: white;
			border: none;
			color: #55606e;
			box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.1);

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
			}
		}
	}
</style>
