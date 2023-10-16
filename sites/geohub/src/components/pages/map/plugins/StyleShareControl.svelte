<script lang="ts">
	import { page } from '$app/stores';
	import { LAYERLIST_STORE_CONTEXT_KEY, type LayerListStore } from '$stores';
	import type { Map } from 'maplibre-gl';
	import { getContext, onDestroy, onMount } from 'svelte';
	import StyleShare from './StyleShare.svelte';

	const layerList: LayerListStore = getContext(LAYERLIST_STORE_CONTEXT_KEY);

	export let map: Map;
	export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';

	$: disabled = !($page.data.session && $layerList.length > 0);

	let isStyleShareVisible = false;

	const handleClick = () => {
		isStyleShareVisible = true;
	};

	let visiblilityButton: HTMLButtonElement;

	// eslint-disable-next-line
	function StyleShareControl() {}

	StyleShareControl.prototype.onAdd = function (map: Map) {
		this.map = map;

		this.controlContainer = document.createElement('div');
		this.controlContainer.className = 'maplibregl-ctrl maplibregl-ctrl-group';
		visiblilityButton.addEventListener('click', handleClick);
		this.controlContainer.appendChild(visiblilityButton);
		return this.controlContainer;
	};

	StyleShareControl.prototype.onRemove = function () {
		if (!this.container || !this.container.parentNode) {
			return;
		}
		this.container.parentNode.removeChild(this.container);
		this.map = undefined;
	};

	/*global StyleShareControl */
	/*eslint no-undef: "error"*/
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	let styleShareControl: StyleShareControl;

	onMount(() => {
		if (map) {
			if (!(styleShareControl && map.hasControl(styleShareControl))) {
				styleShareControl = new StyleShareControl();
				map.addControl(styleShareControl, position);
			}
		}
	});

	onDestroy(() => {
		if (map) {
			if (styleShareControl && map.hasControl(styleShareControl)) {
				map.removeControl(styleShareControl);
			}
		}
	});
</script>

<button
	class="maplibregl-ctrl-styleshare maplibre-ctrl-icon is-flex is-align-items-center has-tooltip-left has-tooltip-arrow"
	bind:this={visiblilityButton}
	data-tooltip={disabled ? 'Please sign in to save your map' : 'Save your map to share'}
	{disabled}
>
	<i class="fa-solid fa-share-nodes fa-xl align-center" />
</button>

<StyleShare bind:map bind:isModalVisible={isStyleShareVisible} />

<style lang="scss">
	.maplibre-ctrl-icon {
		width: 29px;
		height: 29px;
		cursor: pointer;
	}

	.align-center {
		width: max-content;
		margin: auto;
	}
</style>
