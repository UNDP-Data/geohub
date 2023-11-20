<script lang="ts">
	import { handleEnterKey, initTippy } from '$lib/helper';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import type { ControlPosition, Map } from 'maplibre-gl';
	import { getContext, onDestroy, onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import {
		TerraDraw,
		TerraDrawCircleMode,
		TerraDrawFreehandMode,
		TerraDrawLineStringMode,
		TerraDrawMapLibreGLAdapter,
		TerraDrawPointMode,
		TerraDrawPolygonMode,
		TerraDrawRectangleMode
	} from 'terra-draw';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let position: ControlPosition = 'top-right';

	let controlGroup: HTMLDivElement;
	let terraDrawInstance: Writable<TerraDraw>;
	let drawMode: string = '';

	const tippy = initTippy(
		{
			appendTo: $map.getContainer(),
			placement:
				position === 'bottom-left'
					? 'right-start'
					: position === 'top-left'
					  ? 'right-end'
					  : position === 'bottom-right'
					    ? 'left-end'
					    : 'left-start',
			interactive: true,
			arrow: false,
			theme: 'transparent',
			offset: [-10, -5]
		},
		'mouseenter click'
	);
	let tooltipContent: HTMLElement;

	let drawModes = [
		{ title: 'Point', mode: new TerraDrawPointMode(), icon: 'fa-solid fa-location-pin' },
		{ title: 'Line', mode: new TerraDrawLineStringMode(), icon: 'fa-solid fa-grip-lines' },
		{ title: 'Rectangle', mode: new TerraDrawRectangleMode(), icon: 'fa-solid fa-vector-square' },
		{ title: 'Polygon', mode: new TerraDrawPolygonMode(), icon: 'fa-solid fa-draw-polygon' },
		{ title: 'Circle', mode: new TerraDrawCircleMode(), icon: 'fa-solid fa-circle' },
		{ title: 'Freehand', mode: new TerraDrawFreehandMode(), icon: 'fa-solid fa-hand-point-up' }
	];

	// eslint-disable-next-line
	function DrawControl() {}

	DrawControl.prototype.onAdd = function (map: Map) {
		this.map = map;

		terraDrawInstance = writable(
			new TerraDraw({
				adapter: new TerraDrawMapLibreGLAdapter({ map }),
				modes: drawModes.map((m) => m.mode)
			})
		);

		this.controlContainer = controlGroup;
		return this.controlContainer;
	};

	DrawControl.prototype.onRemove = function () {
		if (!this.container || !this.container.parentNode) {
			return;
		}
		this.container.parentNode.removeChild(this.container);
		this.map = undefined;
	};

	/*global DrawControl */
	/*eslint no-undef: "error"*/
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	let drawControl: DrawControl;

	onMount(() => {
		if ($map) {
			if (!(drawControl && $map.hasControl(drawControl))) {
				drawControl = new DrawControl();
				$map.addControl(drawControl, position);
			}
		}
	});

	onDestroy(() => {
		if (map) {
			if (drawControl && $map.hasControl(drawControl)) {
				$map.removeControl(drawControl);
			}
		}
	});

	const handleDraw = (mode: string) => {
		if (!$terraDrawInstance) return;
		if (drawMode === mode) {
			handleStopDraw();
		} else {
			drawMode = mode;
			$terraDrawInstance.start();
			$terraDrawInstance.setMode(mode);
		}
	};

	const handleStopDraw = () => {
		if (!$terraDrawInstance) return;
		if (!$terraDrawInstance.enabled) return;
		drawMode = '';
		$terraDrawInstance.stop();
	};

	const handleClear = () => {
		if (!$terraDrawInstance) return;
		if (!$terraDrawInstance.enabled) {
			$terraDrawInstance.start();
		}
		$terraDrawInstance.clear();
	};
</script>

<div class="maplibregl-ctrl maplibregl-ctrl-group" bind:this={controlGroup}>
	<button class={drawMode === '' ? '' : 'has-text-success'} use:tippy={{ content: tooltipContent }}>
		{#if drawMode === ''}
			<i class="fa-solid fa-pencil"></i>
		{:else}
			{@const mode = drawModes.find((m) => m.mode.mode === drawMode)}
			<i class={mode.icon}></i>
		{/if}
	</button>
	<div class="dropdown is-active" bind:this={tooltipContent}>
		<div class="dropdown-menu" role="menu">
			<div class="dropdown-content">
				{#each drawModes as mode}
					<!-- svelte-ignore a11y-missing-attribute -->
					<a
						class="dropdown-item {drawMode === mode.mode.mode ? 'is-active' : ''}"
						role="menu"
						tabindex="0"
						on:click={() => {
							handleDraw(mode.mode.mode);
						}}
						on:keydown={handleEnterKey}
					>
						<span class="icon is-small">
							<i class={mode.icon} aria-hidden="true"></i>
						</span>
						<span>{mode.title}</span>
					</a>
				{/each}
			</div>
		</div>
	</div>
	<button on:click={handleClear}>
		<i class="fa-solid fa-trash"></i>
	</button>
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';

	:global(.tippy-content) {
		cursor: default;
	}

	:global(.tippy-box[data-theme='transparent']) {
		background-color: transparent;
		color: transparent;
	}
</style>
