<script context="module" lang="ts">
	import { type LayerListStore } from '$stores';
	import type { ControlPosition, IControl, Map } from 'maplibre-gl';
	import { onDestroy, onMount } from 'svelte';

	export class MaplibreLegendControl implements IControl {
		private map?: Map;
		private controlContainer?: HTMLElement;
		private buttonDiv: HTMLButtonElement;

		constructor(buttonDiv: HTMLButtonElement) {
			this.buttonDiv = buttonDiv;
		}

		onAdd(map: Map): HTMLElement {
			this.map = map;

			this.controlContainer = document.createElement('div');
			this.controlContainer.classList.add('maplibregl-ctrl');
			this.controlContainer.classList.add('maplibregl-ctrl-group');
			this.controlContainer.appendChild(this.buttonDiv);

			return this.controlContainer;
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
	import type { LegendLayer } from '$lib/server/helpers';
	import { draggable, type DragOptions } from '@neodrag/svelte';
	import {
		Accordion,
		clean,
		FloatingPanel,
		initTooltipTippy,
		Notification
	} from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import VisibilityButton from '../layers/header/VisibilityButton.svelte';

	export let map: Map;
	export let styleId: string;
	export let layerList: LayerListStore;
	export let show = true;

	let control: MaplibreLegendControl | undefined;
	let buttonDiv: HTMLButtonElement;
	let contentDiv: HTMLDivElement;

	let legend: LegendLayer[] = [];
	let isLoading = false;

	const tippyTooltip = initTooltipTippy();

	let dragOptions: DragOptions = {
		bounds: map.getContainer()
	};

	const handleButtonClicked = () => {
		show = !show;
	};

	let expanded: { [key: string]: boolean } = {};

	onMount(() => {
		control = new MaplibreLegendControl(buttonDiv);
		map.addControl(control, 'top-right');
		getLegend();
	});

	onDestroy(() => {
		if (control) {
			map.removeControl(control);
			control = undefined;
		}
	});

	const getLegend = async () => {
		try {
			isLoading = true;

			const res = await fetch(`/api/style/${styleId}/legend?width=268px`);
			legend = await res.json();

			legend.forEach((l) => {
				expanded[l.id] = true;
			});
		} finally {
			isLoading = false;
		}
	};

	const expandAllDisabled = () => {
		if ($layerList.length === 0) return true;
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
</script>

<button
	class="legend-button button {!show ? 'is-active' : ''}"
	bind:this={buttonDiv}
	on:click={handleButtonClicked}
>
	<span class="icon is-small">
		<i class="fa-solid fa-list"></i>
	</span>
</button>

<div class="contents {show ? 'is-active' : ''}" bind:this={contentDiv} use:draggable={dragOptions}>
	<FloatingPanel
		title="Legend"
		on:close={() => {
			show = false;
		}}
	>
		<div class="is-flex is-align-items-center layer-header pt-2 px-4">
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

		<div class="legend-contents py-2">
			{#if isLoading}
				<div class="is-flex is-justify-content-center">
					<Loader size="small" />
				</div>
			{:else if legend?.length > 0}
				{#each legend as l (l.id)}
					{@const layer = $layerList.find((x) => x.id === l.id)}
					{#if layer}
						<Accordion
							title={clean(l.name)}
							bind:isExpanded={expanded[l.id]}
							isSelected={false}
							showHoveredColor={true}
						>
							<div class="is-flex is-align-items-center" slot="buttons">
								<VisibilityButton bind:map {layer} />
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
					{/if}
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
		position: absolute;
		top: 40px;
		left: 10px;
		background-color: white;
		z-index: 10;
		display: none;
		width: $width;

		.layer-header-buttons {
			margin-left: auto;
		}

		.legend-contents {
			width: $width;
			max-height: $width;
			overflow-y: auto;
			overflow-x: hidden;
		}
	}

	.is-active {
		display: block;
	}
</style>
