<script module lang="ts">
	import type { ControlPosition, IControl, Map } from 'maplibre-gl';
	import { onDestroy, onMount } from 'svelte';

	export class MaplibreStaticApiControl implements IControl {
		private map: Map | undefined;
		private controlContainer: HTMLElement | undefined;
		private buttonDiv: HTMLDivElement;

		constructor(buttonDiv: HTMLDivElement) {
			this.buttonDiv = buttonDiv;
		}

		onAdd(map: Map): HTMLElement {
			this.map = map;
			return this.buttonDiv;
		}

		onRemove(): void {
			if (
				!this.controlContainer ||
				!this.controlContainer.parentNode ||
				!this.map ||
				!this.buttonDiv
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
	import { draggable, type DragOptions } from '@neodrag/svelte';
	import { FloatingPanel } from '@undp-data/svelte-undp-components';
	import StaticImageControl from './StaticImageControl.svelte';
	import type { ControlOptions } from './interface/index.js';

	interface Props {
		/**
		 * Maplibre Map object
		 */
		map: Map;
		/**
		 * If true, show control
		 */
		show?: boolean;
		/**
		 * Style JSON URL (optional)
		 */
		style: string;
		/**
		 * GeoHub Static Image API URL
		 * https://staticimage.undpgeohub.org/api
		 */
		apiBase: string;
		/**
		 * Optional values
		 */
		options?: ControlOptions;
		/**
		 * if enabled, show advanced settings
		 */
		showAdvanced?: boolean;
		/**
		 * If true, make API types (Center, BBOX, Auto) hiddden
		 */
		hiddenApiTypes?: boolean;
		title?: string;
		position?: ControlPosition;
		/**
		 * onChange event when static api URL is changed
		 * @param url Static API URL href
		 */
		onchange?: (url: string) => void;
	}

	let {
		map = $bindable(),
		show = $bindable(false),
		style = $bindable(),
		apiBase = $bindable(),
		options = $bindable({}),
		showAdvanced = $bindable(false),
		hiddenApiTypes = $bindable(false),
		title = $bindable('Export map'),
		position = $bindable('top-right'),
		onchange = () => {}
	}: Props = $props();

	let apiUrl: string = $state('');

	let control: MaplibreStaticApiControl | undefined = $state();
	let buttonDiv: HTMLDivElement | undefined = $state();

	let dragOptions: DragOptions = {
		bounds: map.getContainer()
	};

	let isExporting = $state(false);

	const handleButtonClicked = () => {
		show = !show;
	};

	onMount(() => {
		if (!buttonDiv) return;
		control = new MaplibreStaticApiControl(buttonDiv);
		map.addControl(control, position);
	});

	onDestroy(() => {
		if (control) {
			map.removeControl(control);
			control = undefined;
		}
	});

	const handleUrlChanged = (url: string) => {
		apiUrl = url;
		if (onchange) onchange(apiUrl);
	};

	const handleExport = async () => {
		try {
			isExporting = true;

			const url = new URL(apiUrl);
			url.searchParams.delete('url');

			const styleJson = map.getStyle();

			const urlParts = url.pathname.split('.');
			const extension = urlParts[urlParts.length - 1];

			const res = await fetch(url, {
				method: 'POST',
				body: JSON.stringify(styleJson)
			});
			const blob = await res.blob();
			const blobUrl = window.URL.createObjectURL(blob);
			let a = document.createElement('a');
			a.href = blobUrl;
			a.download = `${styleJson.name ?? 'map'}.${extension}`;
			document.body.appendChild(a);
			a.click();
			a.remove();
		} finally {
			isExporting = false;
		}
	};
</script>

<div
	class="legend-button maplibregl-ctrl maplibregl-ctrl-group {!show ? 'is-active' : ''}"
	bind:this={buttonDiv}
>
	<button class="button" onclick={handleButtonClicked} aria-label="export">
		<span class="icon is-small">
			<i class="fa-solid fa-print"></i>
		</span>
	</button>
</div>

<div class="static-control {show ? 'is-active' : ''}" use:draggable={dragOptions}>
	<FloatingPanel
		{title}
		showExpand={true}
		showClose={true}
		onclose={() => {
			show = false;
		}}
	>
		<div class="p-4">
			<StaticImageControl
				bind:map
				bind:show
				bind:style
				bind:apiBase
				bind:showAdvanced
				bind:options
				bind:hiddenApiTypes
				onchange={handleUrlChanged}
			/>

			{#if apiUrl}
				<div class="mt-3">
					<button
						class="button is-link is-uppercase has-text-weight-bold is-fullwidth {isExporting
							? 'is-loading'
							: ''}"
						disabled={isExporting}
						onclick={handleExport}
					>
						Export
					</button>
				</div>
			{/if}
		</div>
	</FloatingPanel>
</div>

<style lang="scss">
	.legend-button {
		display: none;
	}

	.static-control {
		position: absolute;
		top: 40px;
		left: 10px;
		background-color: white;
		z-index: 11;
		display: none;
		min-width: 342px;
	}

	.is-active {
		display: block;
	}
</style>
