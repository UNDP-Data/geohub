<script context="module" lang="ts">
	import type { ControlPosition, IControl, LngLatBoundsLike, Map } from 'maplibre-gl';
	import { onDestroy, onMount } from 'svelte';

	export class TourControl implements IControl {
		private map?: Map;
		private controlContainer?: HTMLElement;
		private contentDiv: HTMLButtonElement;

		constructor(contentDiv: HTMLButtonElement) {
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
	import type { IntroJsOptions } from '$lib/types';
	import introJs from 'intro.js';
	import 'intro.js/introjs.css';

	export let map: Map;
	export let position: ControlPosition = 'top-right';
	export let options: IntroJsOptions;

	let control: TourControl | undefined;
	let contentDiv: HTMLButtonElement;

	onMount(() => {
		if (!map) return;
		control = new TourControl(contentDiv);
		map.addControl(control, position);

		if (options.showAsDefault === true) {
			introJs()
				.setOptions({
					steps: options.steps,
					dontShowAgain: options.dontShowAgain ?? false,
					dontShowAgainCookie: options.dontShowAgainCookie,
					dontShowAgainCookieDays: options.dontShowAgainCookieDays
				})
				.start();
		}
	});

	onDestroy(() => {
		if (control) {
			map.removeControl(control);
			control = undefined;
		}
	});

	const handleStart = () => {
		introJs()
			.setOptions({
				steps: options.steps,
				dontShowAgainCookie: options.dontShowAgainCookie,
				dontShowAgainCookieDays: options.dontShowAgainCookieDays
			})
			.start();
	};
</script>

<button class="tour-control-button" bind:this={contentDiv} on:click={handleStart}>
	<span class="material-symbols-outlined"> help </span>
</button>

<style lang="scss">
</style>
