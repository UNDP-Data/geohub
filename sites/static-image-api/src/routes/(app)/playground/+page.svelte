<script lang="ts">
	import { page } from '$app/stores';
	import { handleEnterKey } from '$lib/helpers/handleEnterKey';
	import maplibregl, {
		Map,
		NavigationControl,
		ScaleControl,
		type MapOptions,
		type StyleSpecification
	} from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';

	let protocol = new pmtiles.Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);

	let styleUrl: string = $page.url.searchParams.get('url') as string;

	let origin = $page.url.origin;
	let apiUrl = `${origin}/style/static/{lon},{lat},{zoom},{bearing},{pitch}|{auto}|{bbox}/{width}x{height}.png?url=${styleUrl}`;

	let width = 300;
	let height = 200;
	let bbox: [number, number, number, number];
	let latitude = 0;
	let longitude = 0;
	let zoom = 3;
	let bearing = 0;
	let pitch = 0;
	let isRetina = false;

	let supportedExtensions = ['jpeg', 'png', 'webp'];
	let extension = 'png';

	let mapContainer: HTMLDivElement;
	let previewContainer: HTMLDivElement;
	let activeTab: 'center' | 'bbox' | 'auto' = 'center';

	let map: Map;
	let previewMap: Map;

	let styleJSON: StyleSpecification;

	$: if (mapContainer) {
		initMap();
	}

	const initMap = async () => {
		styleJSON = await getStyleJSON();

		if (styleJSON.center) {
			longitude = styleJSON.center[0];
			latitude = styleJSON.center[1];
		} else {
			longitude = 0;
			latitude = 0;
		}

		zoom = styleJSON.zoom ?? 3;
		bearing = styleJSON.bearing ?? 0;
		pitch = styleJSON.pitch ?? 0;

		const options: MapOptions = {
			container: mapContainer,
			style: styleJSON,
			center: [longitude, latitude],
			zoom,
			bearing,
			pitch
		};

		map = new Map(options);

		const previewOptions = options;
		previewOptions.container = previewContainer;
		previewOptions.attributionControl = false;
		previewMap = new Map(previewOptions);

		map.addControl(new NavigationControl(), 'bottom-right');
		map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');

		map.on('load', () => {
			map.resize();
		});

		map.on('moveend', handleMoveend);

		previewMap.on('moveend', handleMoveend);
		previewMap.on('mousemove', () => {
			syncMap(map, previewMap);
		});
		map.on('mousemove', () => {
			syncMap(previewMap, map);
		});
		previewMap.on('zoomend', () => {
			map.setZoom(previewMap.getZoom());
		});
		map.on('zoomend', () => {
			previewMap.setZoom(map.getZoom());
		});
	};

	const getStyleJSON = async () => {
		const res = await fetch(styleUrl);
		const json = (await res.json()) as StyleSpecification;
		return json;
	};

	$: width, handleMoveend();
	$: height, handleMoveend();

	const syncMap = (first: Map, second: Map) => {
		first.setCenter(second.getCenter(), second.getZoom());
		first.setBearing(second.getBearing());
		first.setPitch(second.getPitch());
	};

	const handleMoveend = async () => {
		if (!map) return;
		if (activeTab === 'auto') return;
		const center = map.getCenter();
		longitude = center.lng;
		latitude = center.lat;
		zoom = map.getZoom();
		bearing = map.getBearing();
		pitch = map.getPitch();
		bbox = await computeBoundsFromCenter();

		updateApiUrl();
	};

	const computeBoundsFromCenter = async () => {
		const res = await fetch(
			`${origin}/api/bounds/${longitude},${latitude},${zoom}/${width}x${height}`
		);
		const json = await res.json();
		return json.bounds;
	};

	$: activeTab, updateApiUrl();
	$: isRetina, updateApiUrl();
	$: extension, updateApiUrl();
	const updateApiUrl = () => {
		let retina = isRetina ? '&ratio=2' : '';
		if (activeTab === 'center') {
			apiUrl = `${origin}/api/style/static/${longitude},${latitude},${zoom},${bearing},${pitch}/${width}x${height}.${extension}?url=${styleUrl}${retina}`;
		} else if (activeTab === 'bbox') {
			apiUrl = `${origin}/api/style/static/${bbox.join(
				','
			)}/${width}x${height}.${extension}?url=${styleUrl}${retina}`;
		} else {
			if (styleJSON.center) {
				longitude = styleJSON.center[0];
				latitude = styleJSON.center[1];
			} else {
				longitude = 0;
				latitude = 0;
			}

			zoom = styleJSON.zoom ?? 3;
			bearing = styleJSON.bearing ?? 0;
			pitch = styleJSON.pitch ?? 0;

			map.setCenter([longitude, latitude], zoom);
			map.setBearing(bearing);
			map.setPitch(bearing);

			apiUrl = `${origin}/api/style/static/auto/${width}x${height}.${extension}?url=${styleUrl}${retina}`;
		}
	};
</script>

<div class="columns is-mobile">
	<div class="column is-4">
		<div class="card">
			<header class="card-header"><p class="card-header-title">Parameters</p></header>
			<div class="card-content">
				<div class="is-flex">
					<div class="field m-1">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Width</label>
						<div class="control">
							<input class="input" type="number" placeholder="Type width" bind:value={width} />
						</div>
					</div>
					<div class="field m-1">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Height</label>
						<div class="control">
							<input class="input" type="number" placeholder="Type height" bind:value={height} />
						</div>
					</div>
				</div>

				<div class="tabs is-toggle is-fullwidth">
					<ul>
						<li class={activeTab === 'center' ? 'is-active' : ''}>
							<!-- svelte-ignore a11y-missing-attribute -->
							<!-- svelte-ignore a11y-interactive-supports-focus -->
							<a role="tab" on:click={() => (activeTab = 'center')} on:keydown={handleEnterKey}
								>center</a
							>
						</li>
						<li class={activeTab === 'bbox' ? 'is-active' : ''}>
							<!-- svelte-ignore a11y-missing-attribute -->
							<!-- svelte-ignore a11y-interactive-supports-focus -->
							<a role="tab" on:click={() => (activeTab = 'bbox')} on:keydown={handleEnterKey}
								>bounding box</a
							>
						</li>
						<li class={activeTab === 'auto' ? 'is-active' : ''}>
							<!-- svelte-ignore a11y-missing-attribute -->
							<!-- svelte-ignore a11y-interactive-supports-focus -->
							<a role="tab" on:click={() => (activeTab = 'auto')} on:keydown={handleEnterKey}
								>auto</a
							>
						</li>
					</ul>
				</div>

				{#if activeTab === 'center'}
					<!-- {#if longitude && latitude && zoom} -->
					<div class="center-container">
						<div class="field">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label">longitude</label>
							<div class="control">
								<input class="input" type="number" bind:value={longitude} readonly />
							</div>
						</div>
						<div class="field">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label">latitude</label>
							<div class="control">
								<input class="input" type="number" bind:value={latitude} readonly />
							</div>
						</div>
					</div>

					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">zoom level</label>
						<div class="control">
							<input class="input" type="number" bind:value={zoom} readonly />
						</div>
					</div>

					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">bearing</label>
						<div class="control">
							<input class="input" type="number" bind:value={bearing} readonly />
						</div>
					</div>

					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">pitch</label>
						<div class="control">
							<input class="input" type="number" bind:value={pitch} readonly />
						</div>
					</div>
					<!-- {/if} -->
				{:else if activeTab === 'bbox'}
					{#if bbox}
						<div class="bbox-container">
							<div class="field">
								<!-- svelte-ignore a11y-label-has-associated-control -->
								<label class="label">min longitude</label>
								<div class="control">
									<input class="input" type="number" value={bbox[0]} readonly />
								</div>
							</div>
							<div class="field">
								<!-- svelte-ignore a11y-label-has-associated-control -->
								<label class="label">max longitude</label>
								<div class="control">
									<input class="input" type="number" value={bbox[1]} readonly />
								</div>
							</div>
							<div class="field">
								<!-- svelte-ignore a11y-label-has-associated-control -->
								<label class="label">min latitude</label>
								<div class="control">
									<input class="input" type="number" value={bbox[2]} readonly />
								</div>
							</div>
							<div class="field">
								<!-- svelte-ignore a11y-label-has-associated-control -->
								<label class="label">max latitude</label>
								<div class="control">
									<input class="input" type="number" value={bbox[3]} readonly />
								</div>
							</div>
						</div>
					{/if}
				{:else}
					<article class="message is-info">
						<div class="message-body">
							Position is automatically determined based on the overlays or the map style’s default
							center coordinates.
						</div>
					</article>
				{/if}

				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">High resolution</label>
					<div class="control">
						<label class="checkbox">
							<input type="checkbox" bind:checked={isRetina} />
							@2x
						</label>
					</div>
				</div>

				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">File extension</label>
					<div class="control">
						<div class="buttons has-addons is-left">
							{#each supportedExtensions as ext}
								<button
									class="button {extension === ext ? 'is-primary' : 'is-primary is-light'}"
									on:click={() => (extension = ext)}>{ext}</button
								>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="column is-flex is-flex-direction-column">
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Request URL</label>
			<div class="control">
				<input class="input" type="text" bind:value={apiUrl} />
			</div>
		</div>

		<div class="map-containers">
			<div bind:this={mapContainer} class="map" />

			<div
				bind:this={previewContainer}
				class="preview"
				style="width:{width}px; height:{height}px"
			/>
		</div>
	</div>
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.map-containers {
		position: relative;
		.map {
			position: relative;
			width: 100%;
			height: 70vh;
		}

		.preview {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			z-index: 10;
			// background-color: rgba(255, 255, 255, 0.108);
			box-shadow: 5px 10px 25px 5px rgba(0, 0, 0, 0.5);
		}
	}

	.center-container,
	.bbox-container {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
	}
</style>
