<script lang="ts">
	import { Map, type StyleSpecification } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import type { StyleDefinition } from './StyleDefinition';

	export let styles: StyleDefinition[];
	export let defaultStyle: string = styles[0].title;
	export let map: Map;
	export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'bottom-left';

	let primaryIndex = styles[0].title === defaultStyle ? 0 : 1;
	let secondaryIndex = styles[0].title === defaultStyle ? 1 : 0;

	let styleSwitcherDiv: HTMLDivElement;
	let stylePrimary: StyleDefinition = styles[primaryIndex];
	let styleSecondary: StyleDefinition = styles[secondaryIndex];
	let activeStyle: StyleDefinition = styles[primaryIndex];
	let buttonStyle: StyleDefinition = styles[secondaryIndex];

	let stylePrimaryData: StyleSpecification;
	let styleSecondaryData: StyleSpecification;

	const indexStyle = { id: 'index', type: 'background', layout: { visibility: 'none' } };

	let mainContainerId = 'main-switch-container';
	let mapToggle: Map;

	// eslint-disable-next-line
	function StyleSwitcherControl() {}

	StyleSwitcherControl.prototype.onAdd = function (map: Map) {
		this.map = map;

		this.controlContainer = document.createElement('div');
		this.controlContainer.className = 'maplibregl-ctrl';
		this.controlContainer.appendChild(styleSwitcherDiv);
		return this.controlContainer;
	};

	StyleSwitcherControl.prototype.onRemove = function () {
		if (!this.controlContainer || !this.controlContainer.parentNode || !this.map) {
			return;
		}
		this.controlContainer.parentNode.removeChild(this.controlContainer);
		this.map = undefined;
	};

	/*global StyleSwitcherControl */
	/*eslint no-undef: "error"*/
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	let styleSwitcherControl: StyleSwitcherControl = null;

	$: {
		if (map) {
			map.once('load', async () => {
				stylePrimaryData = await fetchUrl(stylePrimary.uri);
				styleSecondaryData = await fetchUrl(styleSecondary.uri);

				const currentStyle = map.getStyle();

				// check if all layers in secondary style exists in current style
				let doesAllLayersExists = true;
				styleSecondaryData.layers.forEach((l) => {
					let exists = currentStyle.layers.find((x) => x.id === l.id);
					if (!exists) {
						doesAllLayersExists = false;
						return;
					}
				});

				// switch to current selected style to secondary
				if (doesAllLayersExists) {
					activeStyle = styleSecondary;
					buttonStyle = stylePrimary;
				}

				mapToggle = createMiniMap(mainContainerId, buttonStyle.uri);
			});

			if (styleSwitcherControl !== null && map.hasControl(styleSwitcherControl) === false) {
				map.addControl(styleSwitcherControl, position);
			}
		}
	}
	onMount(async () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		styleSwitcherControl = new StyleSwitcherControl();
	});

	const createMiniMap = (id: string, uri: string) => {
		return new Map({
			container: id,
			style: uri,
			center: [36.975, -1.364],
			zoom: 1,
			attributionControl: false,
			interactive: false
		});
	};

	const fetchUrl = async (url: string) => {
		const res = await fetch(url);
		const json = await res.json();
		return json;
	};

	const changeStyle = () => {
		if (!map) return;

		if (map.getLayer(indexStyle.id)) map.removeLayer(indexStyle.id);
		const firstLayerId = map.getStyle().layers[0].id;
		map.addLayer(indexStyle, firstLayerId);

		let defaultIsCarto = styles[0].title === defaultStyle;

		if (activeStyle.title === stylePrimary.title) {
			activeStyle = styleSecondary;
			buttonStyle = stylePrimary;
			for (const layer of stylePrimaryData.layers) {
				if (map.getLayer(layer.id)) map.removeLayer(layer.id);
			}
			if (defaultIsCarto) {
				map.addSource('bing', styleSecondaryData.sources.bing);
			} else {
				map.removeSource('bing');
			}
			for (const layer of styleSecondaryData.layers) {
				map.addLayer(layer, 'index');
			}
		} else {
			activeStyle = stylePrimary;
			buttonStyle = styleSecondary;
			for (const layer of styleSecondaryData.layers) {
				if (map.getLayer(layer.id)) map.removeLayer(layer.id);
			}
			if (defaultIsCarto) {
				map.removeSource('bing');
			} else {
				map.addSource('bing', stylePrimaryData.sources.bing);
			}
			for (const layer of stylePrimaryData.layers) {
				map.addLayer(layer, 'index');
			}
		}

		if (!mapToggle) {
			createMiniMap(mainContainerId, buttonStyle.uri);
		} else {
			mapToggle.setStyle(buttonStyle.uri);
		}
	};

	const handleEnterKey = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			changeStyle();
		}
	};
</script>

<div class="main-switch-container" bind:this={styleSwitcherDiv}>
	<div
		class="map-button"
		role="button"
		tabindex="0"
		data-tooltip={buttonStyle.title}
		id={mainContainerId}
		on:click={() => {
			changeStyle();
		}}
		on:keydown={handleEnterKey}
	/>
</div>

<style lang="scss">
	@use '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';

	.main-switch-container {
		// position: absolute;
		// bottom: 40px;
		// left: 10px;
		z-index: 10;

		:global(.maplibregl-canvas) {
			width: 60px;
			height: 60px;
			border-radius: 30px;
			-moz-border-radius: 30px;
			-webkit-border-radius: 30px;
		}

		.map-button {
			cursor: pointer;
			width: 60px;
			height: 60px;
			border-radius: 30px;
			-moz-border-radius: 30px;
			-webkit-border-radius: 30px;
			margin: 0px;
			border-style: solid;
			border-color: #1c1c1c;
			border-width: 1px;
			background: white;
		}
	}
</style>
