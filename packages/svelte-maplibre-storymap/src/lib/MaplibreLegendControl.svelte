<script module lang="ts">
	import type { ControlPosition, IControl, Map } from 'maplibre-gl';
	import { onDestroy, onMount, untrack } from 'svelte';

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
		FieldControl,
		FloatingPanel,
		initTooltipTippy,
		Notification,
		OpacityEditor
	} from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { layerTypes } from './helpers';

	interface Props {
		map: Map;
		styleId: string;
		width?: number;
		origin?: string;
		position?: ControlPosition;
		isExpanded?: boolean;
		/**
		 * If true, show layer visibility and opacity controls, and coappse/expand all buttons. Default is true.
		 */
		showInteractive?: boolean;
		/**
		 * If true, show all layers including invisible layers.
		 * Also, it will hide remote legend layer such as satellite imagery and terrain algorithm layer
		 * Defaut is true.
		 */
		showInvisibleLayers?: boolean;
	}

	let {
		map = $bindable(),
		styleId = $bindable(),
		width = $bindable(384),
		origin = $bindable(''),
		position = $bindable('bottom-left'),
		isExpanded = $bindable(true),
		showInteractive = $bindable(true),
		showInvisibleLayers = $bindable(true)
	}: Props = $props();

	let control: MaplibreLegendControl | undefined;
	let contentDiv: HTMLDivElement | undefined = $state();

	let legend: LegendLayer[] = $state([]);
	let isLoading = $state(false);

	const tippyTooltip = initTooltipTippy();

	let expanded: { [key: string]: boolean } = $state({});
	let layerOpacity: { [key: string]: number } = $state({});

	let numberOfVisibleLayers = $state(0);

	onMount(() => {
		if (!contentDiv) return;
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

	let isStyleChanged = $state(false);

	const getLegend = async () => {
		try {
			isLoading = true;

			const res = await fetch(`${origin}/api/style/${styleId}/legend?width=${width - 32}px`);
			legend = await res.json();

			setLayerOpacity();

			numberOfVisibleLayers = getNumberVisibleLayers();

			map.on('styledata', () => {
				setLayerOpacity();

				numberOfVisibleLayers = getNumberVisibleLayers();
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
		if (!map) return 0;
		const style = map.getStyle();
		const layer = style?.layers?.find((l) => l.id === layerId);
		if (!layer) return 0;

		let invisible = layer.layout?.visibility === 'none';
		if (invisible) {
			return 0;
		}

		if (layer.type === 'hillshade') {
			return 1;
		}

		let opacity = 0;

		const props: string[] = layerTypes[layer.type];
		if (props && props.length > 0) {
			for (const prop of props) {
				if (layer.paint && prop in layer.paint) {
					const v = layer.paint[prop];
					opacity = v;
				}
			}
		}

		if (opacity === 0 && !invisible) {
			opacity = 1;
		}

		return opacity;
	};

	const isShowOpacity = (layerId: string) => {
		const style = map.getStyle();
		const layer = style?.layers?.find((l) => l.id === layerId);
		if (!layer) return false;

		return layer.type === 'hillshade' ? false : true;
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
		const visibility = opacity === 0 ? 'none' : 'visible';
		const mapLayer = map.getLayer(layer.id);
		const props: string[] = layerTypes[mapLayer.type];
		if (props && props.length > 0) {
			props.forEach((prop) => {
				map.setPaintProperty(layer.id, prop, opacity);
			});
		} else {
			map.setLayoutProperty(layer.id, 'visibility', visibility);
		}

		if (layer.children && layer.children.length > 0) {
			layer.children.forEach((child) => {
				const childLayer = map.getLayer(child.id);
				if (!childLayer) return;
				const childProps: string[] = layerTypes[childLayer.type];
				if (childProps && childProps.length > 0) {
					childProps.forEach((prop) => {
						map.setPaintProperty(child.id, prop, opacity);
					});
				} else {
					map.setLayoutProperty(child.id, 'visibility', visibility);
				}
			});
		}
	}, 300);

	const getNumberVisibleLayers = () => {
		if (showInvisibleLayers) {
			return legend.length;
		} else {
			return legend.filter((l) => {
				const isRemoteLegend: boolean =
					l.legend.startsWith('http') || (l.legend.startsWith('https') as boolean);
				return !showInvisibleLayers && getLayerOpacity(l.id) > 0 && !isRemoteLegend;
			}).length;
		}
	};
	$effect(() => {
		if (styleId) {
			untrack(() => {
				getLegend();
			});
		}
	});
</script>

<div
	class="maplibre-ctrl-legend contents"
	bind:this={contentDiv}
	hidden={numberOfVisibleLayers === 0 && !isLoading}
	style="width: {width}px;"
>
	<FloatingPanel title="Legend" showClose={false} bind:isExpanded>
		{#if legend?.length > 1 && showInteractive}
			<div class="is-flex is-align-items-center layer-header px-4 pt-2">
				<div class="layer-header-buttons buttons">
					{#key expanded}
						<button
							class="button m-0 px-4"
							disabled={expandAllDisabled()}
							onclick={handleExpandAll}
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
							onclick={handleCollapseAll}
						>
							<span class="icon">
								<span class="material-icons"> compress </span>
							</span>
						</button>
					{/key}
				</div>
			</div>
		{/if}

		<div class="legend-contents" style="width: {width}px;">
			{#if isLoading}
				<div class="is-flex is-justify-content-center p-4">
					<Loader size="small" />
				</div>
			{:else if legend?.length > 0}
				{#each legend as l (l.id)}
					{@const showOpacity = isShowOpacity(l.id)}
					{@const isRemoteLegend = l.legend.startsWith('http') || l.legend.startsWith('https')}
					{#if showInvisibleLayers || (!showInvisibleLayers && getLayerOpacity(l.id) > 0 && !isRemoteLegend)}
						{#if showInteractive}
							<Accordion
								title={l.name}
								bind:isExpanded={expanded[l.id]}
								isSelected={false}
								showHoveredColor={true}
							>
								{#snippet buttons()}
									<div>
										{#key isStyleChanged}
											<OpacityEditor
												opacity={layerOpacity[l.id]}
												{showOpacity}
												onchange={(opacity: number) => {
													handleOpacityChanged(opacity, l.layer);
												}}
											/>
										{/key}
									</div>
								{/snippet}
								{#snippet content()}
									<div class="is-flex is-align-items-center">
										{#if isRemoteLegend}
											<img src={l.legend} alt={l.name} />
										{:else}
											<!-- eslint-disable svelte/no-at-html-tags -->
											{@html l.legend}
										{/if}
									</div>
								{/snippet}
							</Accordion>
						{:else}
							<div class="non-interactive-layer p-4">
								<FieldControl title={clean(l.name)} showHelp={false}>
									{#snippet control()}
										<div class="is-flex is-align-items-center">
											{#if isRemoteLegend}
												<img src={l.legend} alt={l.name} />
											{:else}
												<!-- eslint-disable svelte/no-at-html-tags -->
												{@html l.legend}
											{/if}
										</div>
									{/snippet}
								</FieldControl>
							</div>
						{/if}
					{/if}
				{/each}
			{:else}
				<Notification type="info" showCloseButton={false}>No layer in this map</Notification>
			{/if}
		</div>
	</FloatingPanel>
</div>

<style>
	button {
		border: none;
		outline: none;
		appearance: none;
	}

	.contents {
		background-color: white;
		z-index: 10;

		font-family: 'ProximaNova', sans-serif;

		.layer-header-buttons {
			margin-left: auto;

			.button {
				box-shadow: none;
			}
		}

		.legend-contents {
			max-height: 300px;
			overflow-y: auto;
			overflow-x: hidden;

			.non-interactive-layer {
				border-bottom: 1px solid #d4d6d8;
				&:last-child {
					border-bottom: none;
				}
			}
		}
	}
</style>
