<script context="module" lang="ts">
	import type { ControlPosition, IControl, Map } from 'maplibre-gl';
	import { onDestroy, onMount } from 'svelte';

	export class MaplibreLegendControl implements IControl {
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
			const defaultPosition = 'top-left';
			return defaultPosition;
		}
	}

	interface Layer {
		id: string;
		children?: Layer[];
	}

	/**
	 * LegendLayer interface to contain layer legend information
	 */
	export interface LegendLayer {
		id: string;
		name: string;
		legend: string;
		layer: Layer;
		raw?: {
			min?: number;
			max?: number;
			unit?: string;
			colors?: [number, number, number, number][] | string[];
			values?: number[][] | string[];
			shape?: string;
		};
	}
</script>

<script lang="ts">
	import {
		Accordion,
		clean,
		FloatingPanel,
		initTooltipTippy,
		Notification,
		OpacityEditor
	} from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { layerTypes } from './helpers.js';

	export let map: Map;
	export let styleId: string;
	export let width = '268px';
	export let origin = '';
	export let position: ControlPosition = 'bottom-left';

	let control: MaplibreLegendControl | undefined;
	let contentDiv: HTMLDivElement;

	let legend: LegendLayer[] = [];
	let isLoading = false;

	const tippyTooltip = initTooltipTippy();

	let expanded: { [key: string]: boolean } = {};
	let layerOpacity: { [key: string]: number } = {};

	onMount(() => {
		control = new MaplibreLegendControl(contentDiv);
		map.addControl(control, position);
		getLegend();
	});

	onDestroy(() => {
		if (control) {
			map.removeControl(control);
			control = undefined;
		}
	});

	$: styleId, getLegend();
	let isStyleChanged = false;

	const getLegend = async () => {
		try {
			isLoading = true;

			const res = await fetch(`${origin}/api/style/${styleId}/legend?width=${width}`);
			legend = await res.json();

			setLayerOpacity();

			map.on('styledata', () => {
				setLayerOpacity();
			});
		} finally {
			isLoading = false;
		}
	};

	const setLayerOpacity = () => {
		if (!legend) return;
		legend.forEach((l) => {
			const opacity = getLayerOpacity(l.id);
			layerOpacity[l.id] = opacity ?? 0;
		});

		legend.forEach((l) => {
			expanded[l.id] = layerOpacity[l.id] > 0;
		});

		isStyleChanged = !isStyleChanged;
	};

	const getLayerOpacity = (layerId: string) => {
		if (!map) return;
		const style = map.getStyle();
		const layer = style?.layers?.find((l) => l.id === layerId);
		if (!layer) return;

		if (layer.layout?.visibility === 'none') {
			return 0;
		}

		let opacity = 0;

		const props: string[] = layerTypes[layer.type];
		if (props && props.length > 0) {
			for (const prop of props) {
				const v = layer.paint[prop];
				opacity = v ?? 1;
			}
		}

		return opacity;
	};

	const expandAllDisabled = () => {
		if (legend.length === 0) return true;
		return Object.keys(expanded).filter((key) => expanded[key] === true)?.length === legend.length;
	};

	const collapseAllDisabled = () => {
		if (legend.length === 0) return true;
		return Object.keys(expanded).filter((key) => expanded[key] === false)?.length === legend.length;
	};

	const handleExpandAll = () => {
		if (legend.length === 0) return;
		legend.forEach((l) => {
			expanded[l.id] = true;
		});
	};

	const handleCollapseAll = () => {
		if (legend.length === 0) return;
		legend.forEach((l) => {
			expanded[l.id] = false;
		});
	};

	const handleOpacityChanged = debounce((values: number, layer: Layer) => {
		const opacity = values;
		const mapLayer = map.getLayer(layer.id);
		const props: string[] = layerTypes[mapLayer.type];
		props.forEach((prop) => {
			map.setPaintProperty(layer.id, prop, opacity);
		});

		if (layer.children && layer.children.length > 0) {
			layer.children.forEach((child) => {
				const childLayer = map.getLayer(child.id);
				if (!childLayer) return;
				const childProps: string[] = layerTypes[childLayer.type];
				childProps.forEach((prop) => {
					map.setPaintProperty(child.id, prop, opacity);
				});
			});
		}
	}, 300);
</script>

<div class="contents" bind:this={contentDiv}>
	<FloatingPanel title="Legend" showClose={false}>
		{#if legend?.length > 1}
			<div class="is-flex is-align-items-center layer-header px-4 pt-2">
				<div class="layer-header-buttons buttons">
					{#key expanded}
						<button
							class="button m-0 px-4"
							disabled={expandAllDisabled()}
							on:click={handleExpandAll}
							use:tippyTooltip={{ content: 'Expand all layers' }}
						>
							<span class="icon">
								<span class="material-icons"> expand </span>
							</span>
						</button>

						<button
							class="button m-0 px-4"
							disabled={collapseAllDisabled()}
							use:tippyTooltip={{ content: 'Collapse all layers' }}
							on:click={handleCollapseAll}
						>
							<span class="icon">
								<span class="material-icons"> compress </span>
							</span>
						</button>
					{/key}
				</div>
			</div>
		{/if}

		<div class="legend-contents">
			{#if isLoading}
				<div class="is-flex is-justify-content-center">
					<Loader size="small" />
				</div>
			{:else if legend?.length > 0}
				{#each legend as l (l.id)}
					<Accordion
						title={clean(l.name)}
						bind:isExpanded={expanded[l.id]}
						isSelected={false}
						showHoveredColor={true}
					>
						<div slot="buttons">
							{#key isStyleChanged}
								<OpacityEditor
									bind:opacity={layerOpacity[l.id]}
									on:change={(e) => {
										const opacity = e.detail.opacity;
										handleOpacityChanged(opacity, l.layer);
									}}
								/>
							{/key}
						</div>
						<div slot="content">
							{#if l.legend.startsWith('http') || l.legend.startsWith('https')}
								<img src={l.legend} alt={l.name} />
							{:else}
								<!-- eslint-disable svelte/no-at-html-tags -->
								{@html l.legend}
							{/if}
						</div>
					</Accordion>
				{/each}
			{:else}
				<Notification type="info" showCloseButton={false}>No layer in this map</Notification>
			{/if}
		</div>
	</FloatingPanel>
</div>

<style lang="scss">
	$width: 300px;

	button {
		border: none;
		outline: none;
		appearance: none;
	}

	.contents {
		background-color: white;
		z-index: 10;
		width: $width;

		.layer-header-buttons {
			margin-left: auto;

			.button {
				box-shadow: none;
			}
		}

		.legend-contents {
			width: $width;
			max-height: $width;
			overflow-y: auto;
			overflow-x: hidden;
		}
	}
</style>
