<script context="module" lang="ts">
	import type { ControlPosition, IControl, Map } from 'maplibre-gl';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	export class MaplibreLegendControl implements IControl {
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
	import StaticImageControl from './StaticImageControl.svelte';
	import type { ControlOptions } from './interface/index.js';

	const dispatch = createEventDispatcher();

	/**
	 * Maplibre Map object
	 */
	export let map: Map;

	/**
	 * If true, show control
	 */
	export let show = false;

	/**
	 * Style JSON URL (optional)
	 */
	export let style: string;

	/**
	 * GeoHub Static Image API URL
	 * https://staticimage.undpgeohub.org/api
	 */
	export let apiBase: string;

	/**
	 * Optional values
	 */
	export let options: ControlOptions = {};

	/**
	 * if enabled, show advanced settings
	 */
	export let showAdvanced = false;

	/**
	 * If true, make API types (Center, BBOX, Auto) hiddden
	 */
	export let hiddenApiTypes = false;

	export let title = 'Export map';

	export let position: ControlPosition = 'top-right';

	let apiUrl: string;

	let control: MaplibreLegendControl | undefined;
	let buttonDiv: HTMLDivElement;
	let contentDiv: HTMLDivElement;

	let dragOptions: DragOptions = {
		bounds: map.getContainer()
	};

	let isExporting = false;

	const handleButtonClicked = () => {
		show = !show;
	};

	onMount(() => {
		control = new MaplibreLegendControl(buttonDiv);
		map.addControl(control, position);
	});

	onDestroy(() => {
		if (control) {
			map.removeControl(control);
			control = undefined;
		}
	});

	const handleUrlChanged = (e: { detail: { url: string } }) => {
		apiUrl = e.detail.url;
		dispatch('change', {
			url: apiUrl
		});
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
	<button class="button" on:click={handleButtonClicked}>
		<span class="icon is-small">
			<i class="fa-solid fa-print"></i>
		</span>
	</button>
</div>

<div
	class="contents p-2 {show ? 'is-active' : ''}"
	bind:this={contentDiv}
	use:draggable={dragOptions}
>
	<h2 class="header-title subtitle has-background-light p-2 mb-0">
		<span class="icon">
			<i class="fa-solid fa-print"></i>
		</span>
		<span>{title} </span>

		<button
			class="close-button delete"
			on:click={() => {
				show = false;
			}}
		/>
	</h2>

	<StaticImageControl
		bind:map
		bind:show
		bind:style
		bind:apiBase
		bind:showAdvanced
		bind:options
		bind:hiddenApiTypes
		on:change={handleUrlChanged}
	/>

	{#if apiUrl}
		<div class="mt-2">
			<button
				class="button is-primary is-uppercase has-text-weight-bold is-fullwidth {isExporting
					? 'is-loading'
					: ''}"
				disabled={isExporting}
				on:click={handleExport}
			>
				Export
			</button>
		</div>
	{/if}
</div>

<style lang="scss">
	.legend-button {
		display: none;
	}

	.contents {
		position: absolute;
		top: 40px;
		left: 10px;
		background-color: white;
		z-index: 11;
		display: none;

		.header-title {
			position: relative;
			cursor: grab;

			.close-button {
				position: absolute;
				top: 10px;
				right: 10px;
			}
		}
	}

	.is-active {
		display: block;
	}
</style>
