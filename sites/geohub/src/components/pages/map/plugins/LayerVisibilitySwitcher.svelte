<script lang="ts">
	import { initTooltipTippy, sleep } from '@undp-data/svelte-undp-components';
	import type { Map } from 'maplibre-gl';
	import { onDestroy, onMount } from 'svelte';

	interface Props {
		map: Map;
		position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
		target?: string;
		icon?: string;
	}

	let {
		map = $bindable(),
		position = $bindable('top-right'),
		target = $bindable('hillshade'),
		icon = $bindable('fa-solid fa-mountain')
	}: Props = $props();

	const isLayerVisible = () => {
		if (!map.getLayer(target)) return false;
		const visibility = map.getLayoutProperty(target, 'visibility');
		return !(visibility && visibility === 'none');
	};

	let isVisible = $state(false);
	let isLoading = $state(false);

	const tippyTooltip = initTooltipTippy();

	const setVisibility = () => {
		if (!map?.isStyleLoaded()) return;
		if (isVisible) {
			map.setLayoutProperty(target, 'visibility', 'visible');
		} else {
			map.setLayoutProperty(target, 'visibility', 'none');
		}
	};

	const handleClick = async () => {
		const loaded = map?.loaded();
		if (loaded) {
			isVisible = !isVisible;
		} else {
			const currentCursor = map.getCanvas().style.cursor;
			map.getCanvas().style.cursor = 'wait';
			isLoading = true;
			while (map.loaded() === false) {
				await sleep(100);
			}
			isLoading = false;
			map.getCanvas().style.cursor = currentCursor;
			isVisible = !isVisible;
		}
		setVisibility();
	};

	const handleStyleChanged = () => {
		if (!map) return;

		const currentVisibility = isLayerVisible();
		if (currentVisibility !== isVisible) {
			isVisible = currentVisibility;
		}
	};
	map.on('sourcedata', handleStyleChanged);
	map.on('styledata', handleStyleChanged);

	let visiblilityButton: HTMLButtonElement = $state();

	function VisibilityControl() {}

	VisibilityControl.prototype.onAdd = function (map: Map) {
		this.map = map;

		this.controlContainer = document.createElement('div');
		this.controlContainer.className = 'maplibregl-ctrl maplibregl-ctrl-group';
		visiblilityButton.addEventListener('click', handleClick);
		this.controlContainer.appendChild(visiblilityButton);
		return this.controlContainer;
	};

	VisibilityControl.prototype.onRemove = function () {
		if (!this.container || !this.container.parentNode) {
			return;
		}
		this.container.parentNode.removeChild(this.container);
		this.map = undefined;
	};

	/*global VisibilityControl */
	/*eslint no-undef: "error"*/
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	let visibilityControl: VisibilityControl;

	onMount(() => {
		if (map) {
			if (!(visibilityControl && map.hasControl(visibilityControl))) {
				visibilityControl = new VisibilityControl();
				map.addControl(visibilityControl, position);
			}
			map.once('load', () => {
				isVisible = isLayerVisible();
				setVisibility();
			});
		}
	});

	onDestroy(() => {
		if (map) {
			if (visibilityControl && map.hasControl(visibilityControl)) {
				map.removeControl(visibilityControl);
			}
		}
	});
</script>

<button
	class="maplibregl-ctrl-{target}-visibility maplibre-ctrl-icon is-flex is-align-items-center"
	bind:this={visiblilityButton}
	use:tippyTooltip={{ content: `${!isVisible ? `Show ${target}` : `Hide ${target}`}` }}
	disabled={isLoading}
>
	{#if icon.startsWith('fa')}
		<i class="{icon} fa-xl align-center {isVisible ? 'has-text-success' : ''}"></i>
	{:else}
		<span
			class="material-symbols-outlined material-icon align-center {isVisible
				? 'has-text-success'
				: ''}"
		>
			{icon}
		</span>
	{/if}
</button>

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

	.material-icon {
		font-size: 28px;
	}
</style>
