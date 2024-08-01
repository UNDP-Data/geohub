<script lang="ts">
	import {
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		type StoryMapConfigStore
	} from '@undp-data/svelte-maplibre-storymap';
	import { initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { debounce } from 'lodash-es';
	import { Map, type StyleSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);

	export let isActive = false;
	export let disabled = false;

	let isHovered = false;
	let mapContainer: HTMLDivElement;

	const tippyTooltip = initTooltipTippy();

	let map: Map;
	let mapStyle: StyleSpecification;

	onMount(async () => {
		if (!mapContainer) return;
		const newStyle = await applyLayerEvent();
		map = new Map({
			container: mapContainer,
			style: newStyle,
			interactive: false,
			attributionControl: false
		});

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
		return mapStyle;
	};

	const updateMapStyle = debounce(async () => {
		if (!mapContainer) return;
		if (!map) return;
		const newStyle = await applyLayerEvent();
		map.setStyle(newStyle);
	}, 300);

	const handleSettingClicked = () => {
		dispatch('edit');
	};
</script>

<div
	class="preview {isActive ? 'is-active' : ''} {!isActive && isHovered ? 'is-hover' : ''}"
	role="menuitem"
	tabindex="-1"
	bind:this={mapContainer}
	on:mouseenter={() => {
		isHovered = true;
	}}
	on:mouseleave={() => {
		isHovered = false;
	}}
>
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
	@import 'maplibre-gl/dist/maplibre-gl.css';
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
	}
</style>
