<script lang="ts">
	import { page } from '$app/stores';
	import type { LayerListStore } from '$stores';
	import { initTooltipTippy } from '@undp-data/svelte-undp-components';
	import type { Map } from 'maplibre-gl';
	import { onDestroy, onMount } from 'svelte';
	import StyleShare from './StyleShare.svelte';

	export let map: Map;
	export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
	export let layerList: LayerListStore;

	const tippyTooltip = initTooltipTippy();

	$: disabled = !($page.data.session && $layerList.length > 0);

	let isStyleShareVisible = false;

	const handleClick = () => {
		isStyleShareVisible = true;
	};

	let visiblilityButton: HTMLButtonElement;

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
	class="maplibregl-ctrl-styleshare maplibre-ctrl-icon is-flex is-align-items-center"
	bind:this={visiblilityButton}
	use:tippyTooltip={{
		content: `${disabled ? 'Please sign in to save your map' : 'Save your map to share'}`
	}}
	{disabled}
>
	<i class="fa-solid fa-share-nodes fa-xl align-center" />
</button>

<StyleShare bind:map bind:isModalVisible={isStyleShareVisible} {layerList} />

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
