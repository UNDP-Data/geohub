<script module lang="ts">
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
	import 'intro.js/introjs.css';

	interface Props {
		map: Map;
		position?: ControlPosition;
		options: IntroJsOptions;
	}

	let {
		map = $bindable(),
		position = $bindable('top-right'),
		options = $bindable()
	}: Props = $props();

	let control: TourControl | undefined;
	let contentDiv: HTMLButtonElement | undefined = $state();

	let introJs: typeof import('intro.js').default | undefined = $state();

	export const start = (init = true) => {
		if (!introJs) return;

		introJs
			.tour()
			.setOptions({
				steps: options.steps,
				dontShowAgain: init === true ? (options.dontShowAgain ?? false) : false,
				dontShowAgainCookie: options.dontShowAgainCookie,
				dontShowAgainCookieDays: options.dontShowAgainCookieDays,
				scrollTo: options.scrollTo,
				scrollToElement: options.scrollToElement
			})
			.start();
	};

	onMount(async () => {
		if (!map) return;
		if (!contentDiv) return;
		control = new TourControl(contentDiv);
		map.addControl(control, position);

		introJs = (await import('intro.js')).default;

		if (options.showAsDefault === true) {
			start(true);
		}
	});

	onDestroy(() => {
		if (control) {
			map.removeControl(control);
			control = undefined;
		}
	});

	const handleStart = () => {
		start(false);
	};
</script>

<button class="tour-control-button" bind:this={contentDiv} onclick={handleStart}>
	<span class="material-symbols-outlined"> help </span>
</button>

<style lang="scss">
</style>
