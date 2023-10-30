<script lang="ts">
	import { page } from '$app/stores';
	import type { Map } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import { AdminLayer } from './AdminLayer';

	const azureUrl = $page.data.azureUrl;

	export let map: Map;
	export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-left';
	export let layerName = 'admin';
	export let isHover = false;

	let currentLocationDiv: HTMLDivElement;

	let adminLayer: AdminLayer;
	let isContainerVisible = false;
	let adm0Name = '';
	let adm1Name = '';
	let adm2Name = '';
	let adm3Name = '';
	let adm4Name = '';

	$: {
		if (map) {
			map.on('styledata', updateLocation);
			map.on('mousemove', updateLocation);

			map.on('load', () => {
				initAdminLayer();
			});
		}
	}

	const initAdminLayer = () => {
		if (!adminLayer) {
			adminLayer = new AdminLayer(map, azureUrl, isHover, layerName);
		}
		adminLayer.load();
		adminLayer.setInteraction();
	};

	const updateLocation = (e) => {
		if (map.getLayer(layerName)) {
			const features = map.queryRenderedFeatures(e.point, { layers: [layerName] });
			if (features.length > 0) {
				adm0Name = features[0].properties.adm0_name;
				adm1Name = features[0].properties.adm1_name;
				adm2Name = features[0].properties.adm2_name;
				adm3Name = features[0].properties.adm3_name;
				adm4Name = features[0].properties.adm4_name;
				isContainerVisible = Boolean(features[0].properties.adm0_name);
			} else {
				adm0Name = '';
				adm1Name = '';
				adm2Name = '';
				adm3Name = '';
				adm4Name = '';
				isContainerVisible = false;
			}
		}
	};

	// eslint-disable-next-line
	function CurrentLocationControl() {}

	CurrentLocationControl.prototype.onAdd = function (map: Map) {
		this.map = map;

		this.controlContainer = document.createElement('div');
		this.controlContainer.appendChild(currentLocationDiv);
		return this.controlContainer;
	};

	CurrentLocationControl.prototype.onRemove = function () {
		if (!this.controlContainer || !this.controlContainer.parentNode || !this.map) {
			return;
		}
		this.controlContainer.parentNode.removeChild(this.controlContainer);
		this.map = undefined;
	};

	/*global CurrentLocationControl */
	/*eslint no-undef: "error"*/
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	let currentLocationControl: CurrentLocationControl;

	$: {
		if (map) {
			if (currentLocationControl && map.hasControl(currentLocationControl) === false) {
				map.addControl(currentLocationControl, position);
			}
		}
	}

	onMount(async () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		currentLocationControl = new CurrentLocationControl();
	});
</script>

<div bind:this={currentLocationDiv}>
	{#if isContainerVisible}
		<div id="data-container" class="data-container">
			{#if adm0Name}
				{adm0Name}
			{/if}
			{#if adm1Name}
				{'>'} {adm1Name}
			{/if}
			{#if adm2Name}
				{'>'} {adm2Name}
			{/if}
			{#if adm3Name}
				{'>'} {adm3Name}
			{/if}
			{#if adm4Name}
				{'>'} {adm4Name}
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	.data-container {
		background-color: #fff;
		border-radius: 10px;
		border: 1px solid #ccc;
		box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
		color: #4a4a4a;
		font-family: ProximaNova, sans-serif;
		font-size: 11px;
		padding: 5px;
		margin: 10px;
	}
</style>
