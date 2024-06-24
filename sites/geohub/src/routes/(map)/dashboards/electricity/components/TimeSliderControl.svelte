<script context="module" lang="ts">
	import type { ControlPosition, IControl, Map } from 'maplibre-gl';
	class TimeSliderControl implements IControl {
		private map: Map;
		private controlContainer: HTMLElement;
		private controlDiv: HTMLDivElement;

		constructor(controlDiv: HTMLDivElement) {
			this.controlDiv = controlDiv;
		}

		onAdd(map: Map): HTMLElement {
			this.map = map;

			this.controlContainer = document.createElement('div');
			this.controlContainer.classList.add('maplibregl-ctrl');
			this.controlContainer.classList.add('maplibregl-ctrl-group');
			this.controlContainer.appendChild(this.controlDiv);

			return this.controlContainer;
		}

		onRemove(): void {
			if (
				!this.controlContainer ||
				!this.controlContainer.parentNode ||
				!this.map ||
				!this.controlDiv
			) {
				return;
			}
			this.controlContainer.parentNode.removeChild(this.controlContainer);
			this.map = undefined;
		}

		getDefaultPosition(): ControlPosition {
			const defaultPosition = 'top-right';
			return defaultPosition;
		}
	}
</script>

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import TimeSlider from './TimeSlider.svelte';

	export let map: Map;
	export let scaleColorList = [];
	export let loadRasterLayer;
	export let rasterColorMapName = '';
	export let electricitySelected: string;
	export let loadAdminLabels: boolean | undefined = undefined;
	export let newColorExpression = undefined;
	export let isActive = false;

	let controlElement: HTMLDivElement;

	let control: TimeSliderControl;

	onMount(() => {
		control = new TimeSliderControl(controlElement);
		map.addControl(control, 'top-left');
	});

	onDestroy(() => {
		if (control) {
			map.removeControl(control);
			control = undefined;
		}
	});
</script>

<div class="time-slider-control {isActive ? 'is-active' : ''}" bind:this={controlElement}>
	<TimeSlider
		bind:electricitySelected
		bind:loadLayer={loadRasterLayer}
		bind:scaleColorList
		bind:rasterColorMapName
		bind:isActive
		bind:loadAdminLabels
		bind:newColorExpression
	/>
</div>

<style lang="scss">
	.time-slider-control {
		display: none;
		&.is-active {
			display: block;
		}
	}
</style>
