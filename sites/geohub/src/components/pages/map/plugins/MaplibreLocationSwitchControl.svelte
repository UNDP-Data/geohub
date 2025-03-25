<script module lang="ts">
	import type { ControlPosition, IControl, LngLatBoundsLike, Map } from 'maplibre-gl';
	import { onDestroy, onMount } from 'svelte';

	export class MaplibreLocationSwitchControl implements IControl {
		private map?: Map;
		private controlContainer?: HTMLElement;
		private contentDiv: HTMLDivElement;

		constructor(contentDiv: HTMLDivElement) {
			this.contentDiv = contentDiv;
		}

		onAdd(map: Map): HTMLElement {
			this.map = map;

			this.controlContainer = document.createElement('div');
			this.controlContainer.classList.add('maplibregl-ctrl');
			this.controlContainer.classList.add('maplibregl-ctrl-group');
			this.controlContainer.appendChild(this.contentDiv);

			return this.controlContainer;
		}

		onRemove(): void {
			if (
				!this.controlContainer ||
				!this.controlContainer.parentNode ||
				!this.map ||
				!this.contentDiv
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

	export interface LocationSwitchPlaces {
		name: string;
		bounds: LngLatBoundsLike;
	}
</script>

<script lang="ts">
	interface Props {
		map: Map;
		position?: ControlPosition;
		places?: LocationSwitchPlaces[];
	}

	let {
		map = $bindable(),
		position = $bindable('top-right'),
		places = $bindable([])
	}: Props = $props();

	let control: MaplibreLocationSwitchControl | undefined;
	let contentDiv: HTMLDivElement | undefined = $state();

	onMount(() => {
		if (!map) return;
		if (!contentDiv) return;
		control = new MaplibreLocationSwitchControl(contentDiv);
		map.addControl(control, position);
	});

	onDestroy(() => {
		if (control) {
			map.removeControl(control);
			control = undefined;
		}
	});

	const zoomTo = (bounds: LngLatBoundsLike) => {
		if (map) {
			map.fitBounds(bounds);
		}
	};
</script>

<div class="location-switch-control" bind:this={contentDiv}>
	{#each places as place (place.name)}
		<button
			class="button is-light is-fullwidth p-2"
			onclick={() => {
				zoomTo(place.bounds);
			}}
		>
			<span>{place.name}</span>
		</button>
	{/each}
</div>

<style lang="scss">
	.location-switch-control {
		background-color: white;
		z-index: 10;
		width: fit-content;

		font-family: 'ProximaNova', sans-serif;
	}
</style>
