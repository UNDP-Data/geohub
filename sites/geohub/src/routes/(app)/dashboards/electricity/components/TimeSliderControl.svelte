<script module lang="ts">
	import type { ControlPosition, IControl, Map } from 'maplibre-gl';

	class TimeSliderControl implements IControl {
		private map: Map | undefined;
		private controlContainer: HTMLElement | undefined;
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
			return 'top-right';
		}
	}
</script>

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import TimeSlider from './TimeSlider.svelte';

	interface Props {
		map: Map;
		scaleColorList?: string[];
		rasterColorMapName?: string;
		electricitySelected: string;
		loadAdminLabels?: boolean | undefined;
		newColorExpression?: string;
		isActive?: boolean;
	}

	let {
		map = $bindable(),
		rasterColorMapName = $bindable(''),
		electricitySelected = $bindable(),

		isActive = $bindable(false)
	}: Props = $props();

	let controlElement: HTMLDivElement | undefined = $state();

	let control: TimeSliderControl | undefined;

	onMount(() => {
		if (!controlElement) return;
		control = new TimeSliderControl(controlElement);
		map.addControl(control, 'top-left');
	});

	onDestroy(() => {
		if (control) {
			map.removeControl(control);
			control = undefined;
		}
	});

	let timeSlider: TimeSlider | undefined = $state();
</script>

<div class="time-slider-control {isActive ? 'is-active' : ''}" bind:this={controlElement}>
	<TimeSlider
		bind:this={timeSlider}
		bind:electricitySelected
		bind:rasterColorMapName
		bind:isActive
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
