<script lang="ts">
	import { page } from '$app/stores';
	import {
		StaticImageControl,
		type ControlOptions
	} from '@undp-data/svelte-geohub-static-image-controls';
	import {
		CopyToClipboard,
		FieldControl,
		handleEnterKey,
		isValidUrl,
		Sidebar
	} from '@undp-data/svelte-undp-components';
	import { Switch } from '@undp-data/svelte-undp-design';
	import { addProtocol, Map, NavigationControl, ScaleControl } from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { PageData } from './$types';

	export let data: PageData;
	let styleUrl: string = data.styleUrl;

	let origin = $page.url.origin;
	let apiUrl = '';

	const headerHeight: Writable<number> = getContext('header-height');
	let innerHeight: number;
	$: sidebarHeight = innerHeight - $headerHeight;

	let isExporting = false;
	let showStyleDropdown = false;

	let options: ControlOptions = {
		width: 300,
		height: 200,
		bbox: [-180, -90, 180, 90],
		latitude: 0,
		longitude: 0,
		zoom: 3,
		bearing: 0,
		pitch: 0,
		ratio: 1,
		defaultApi: 'center',
		extension: 'webp',
		pageSize: 'custom',
		orientation: 'portrait'
	};

	let mapContainer: HTMLDivElement;

	let map: Map;

	let showTileBoundaries = false;
	let showCollisionBoxes = false;

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);

		map = new Map({
			container: mapContainer,
			style: styleUrl
		});

		map.showTileBoundaries = showTileBoundaries;

		map.addControl(new NavigationControl(), 'bottom-right');
		map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');

		map.on('load', () => {
			map.resize();
		});
	});

	const handleShowTileBoundaryChange = () => {
		if (!map) return;
		map.showTileBoundaries = showTileBoundaries;
	};

	const handleShowCollisionBoxes = () => {
		if (!map) return;
		map.showCollisionBoxes = showCollisionBoxes;
	};

	const handleUrlChanged = (e: { detail: { url: string } }) => {
		apiUrl = e.detail.url;
	};

	const handleExport = () => {
		try {
			isExporting = true;

			const url = new URL(apiUrl);

			const styleJson = map.getStyle();
			const urlParts = url.pathname.split('.');
			const extension = urlParts[urlParts.length - 1];

			let a = document.createElement('a');
			a.href = apiUrl;
			a.download = `${styleJson.name ?? 'map'}.${extension}`;
			document.body.appendChild(a);
			a.click();
			a.remove();
		} finally {
			isExporting = false;
		}
	};

	const handleLoadStyle = () => {
		if (apiUrl) {
			const newUrl = new URL(apiUrl);
			newUrl.searchParams.set('url', styleUrl);
			apiUrl = newUrl.href;
		}
		map.setStyle(styleUrl);
	};
</script>

<svelte:window bind:innerHeight />

<Sidebar
	show={true}
	position="left"
	border="none"
	bind:marginTop={$headerHeight}
	bind:height={sidebarHeight}
>
	<div class="sidebar-content" slot="content" style="max-height: {sidebarHeight}px">
		<nav class="panel">
			<p class="panel-heading">Export settings</p>
			<div class="panel-block">
				<FieldControl
					title="Maplibre Style URL"
					fontWeight="bold"
					showHelp={true}
					showHelpPopup={false}
				>
					<div slot="control">
						<div
							class="dropdown {showStyleDropdown ? 'is-active' : ''}"
							role="menu"
							tabindex="-1"
							on:mouseleave={() => {
								showStyleDropdown = false;
							}}
						>
							<div class="dropdown-trigger is-flex">
								<input
									class="input style-input"
									type="text"
									aria-haspopup="true"
									aria-controls="dropdown-menu"
									bind:value={styleUrl}
									on:mouseenter={() => {
										showStyleDropdown = true;
									}}
								/>
								<button
									class="button is-link is-uppercase has-text-weight-bold"
									disabled={!isValidUrl(styleUrl)}
									on:click={handleLoadStyle}>Load</button
								>
							</div>
							<div class="dropdown-menu" id="dropdown-menu" role="menu">
								<div class="dropdown-content">
									{#each data.examples as example}
										<!-- svelte-ignore a11y-missing-attribute -->
										<a
											class="dropdown-item"
											role="menuitem"
											tabindex="-1"
											on:click={(e) => {
												e.preventDefault();
												styleUrl = example;
												showStyleDropdown = false;
											}}
											on:keydown={handleEnterKey}
										>
											{example}
										</a>
									{/each}
								</div>
							</div>
						</div>
					</div>
					<div slot="help">Select an example from dropdown, or paste your own style URL.</div>
				</FieldControl>
			</div>
			<div class="panel-block">
				<FieldControl title="Map Settings" fontWeight="bold" showHelp={false}>
					<div slot="control">
						<div class="pb-2">
							<Switch
								bind:toggled={showTileBoundaries}
								toggledText="Tile boundaries is shown"
								untoggledText="Tile boundaries is hidden"
								showValue={true}
								on:change={handleShowTileBoundaryChange}
							/>
						</div>
						<div>
							<Switch
								bind:toggled={showCollisionBoxes}
								toggledText="Collision Boxes is shown"
								untoggledText="Collision Boxes is hidden"
								showValue={true}
								on:change={handleShowCollisionBoxes}
							/>
						</div>
					</div>
				</FieldControl>
			</div>

			<div class="panel-block">
				{#if map}
					<FieldControl title="Export Settings" fontWeight="bold" showHelp={false}>
						<div slot="control">
							<StaticImageControl
								bind:map
								show={true}
								bind:style={styleUrl}
								apiBase="{origin}/api"
								showAdvanced={true}
								bind:options
								on:change={handleUrlChanged}
							/>
						</div>
					</FieldControl>
				{/if}
			</div>
			{#if apiUrl}
				<div class="panel-block">
					<button
						class="button is-link is-uppercase has-text-weight-bold is-fullwidth {isExporting
							? 'is-loading'
							: ''}"
						on:click={handleExport}
						disabled={isExporting}
					>
						Export
					</button>
				</div>
			{/if}
		</nav>
	</div>
	<div slot="main">
		<div bind:this={mapContainer} class="map" style="height: {sidebarHeight}px;">
			<div class="overlay has-background-white p-2">
				<FieldControl title="Static image URL" fontWeight="bold">
					<div slot="control">
						<CopyToClipboard bind:value={apiUrl} />
					</div>
					<div slot="help">Copy the URL of static image API</div>
				</FieldControl>
			</div>
		</div>
	</div>
</Sidebar>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.map {
		position: relative;
		width: 100%;

		.overlay {
			position: absolute;
			width: 80%;
			top: 5px;
			right: 5px;
			z-index: 10;
			opacity: 0.8;
		}
	}

	.sidebar-content {
		overflow-y: auto;
		overflow-x: hidden;

		.style-input {
			width: 240px;
		}
	}
</style>
