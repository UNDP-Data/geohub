<script lang="ts" module>
	export interface StorymapBaseMapConfig {
		base_style_id?: string;
		style?: string | StyleSpecification;
		style_id?: number;
		hillshade?: boolean;
		terrain?: boolean;
	}
</script>

<script lang="ts">
	import { page } from '$app/state';
	import { MapStyles, type ExtendedStyleDefinition } from '$lib/config/AppConfig';
	import { getMapImageFromStyle } from '$lib/helper';
	import type { DashboardMapStyle } from '$lib/types';
	import {
		FieldControl,
		initTooltipTippy,
		ModalTemplate,
		SegmentButtons,
		type SegmentButton
	} from '@undp-data/svelte-undp-components';
	import { Loader, Switch } from '@undp-data/svelte-undp-design';
	import type { StyleSpecification } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import GeoHubMapSelector from './GeoHubMapSelector.svelte';

	const tippyTooltip = initTooltipTippy();

	interface Props {
		mapConfig?: StorymapBaseMapConfig;
		onchange?: (mapConfig: StorymapBaseMapConfig) => void;
	}

	let { mapConfig = $bindable({}), onchange = () => {} }: Props = $props();

	let buttons: SegmentButton[] = $state([
		{ value: 'base_style_id', title: 'Empty Map' },
		{ value: 'style_id', title: 'GeoHub Map' }
	]);
	const getDefaultActiveTab = () => {
		return (mapConfig?.style_id ? buttons[1].value : buttons[0].value) as string;
	};
	let activeTab: string = $state(getDefaultActiveTab());

	let showMapDialog = $state(false);

	let mapImageSize = [128, 64];
	let mapImageData = $state('');

	let mapStyleId: string = $state('');

	$effect(() => {
		mapStyleId = mapConfig?.style_id?.toString() ?? '';
	});

	const handleBaseStyleChanged = (e: ExtendedStyleDefinition) => {
		mapConfig.base_style_id = e.id;
		mapConfig.style = new URL(e.uri, page.url).href;
		mapConfig.style_id = undefined;
		mapConfig.hillshade = false;
		mapConfig.terrain = false;
		if (onchange) onchange(mapConfig);
	};

	const handleGeoHubMapBaseStyleChanged = (e: ExtendedStyleDefinition) => {
		if (mapConfig.style_id && mapConfig.style && typeof mapConfig.style === 'string') {
			mapConfig.base_style_id = e.id;
			const styleUrl = new URL(mapConfig.style as string);
			styleUrl.searchParams.set('basemap', mapConfig.base_style_id);

			if (mapConfig.hillshade === true) {
				styleUrl.searchParams.set('hillshade', 'true');
			} else {
				styleUrl.searchParams.delete('hillshade');
			}

			// if (mapConfig.terrain === true) {
			// 	styleUrl.searchParams.set('terrain', 'true');
			// } else {
			styleUrl.searchParams.delete('terrain');
			// }

			mapConfig.style = styleUrl.href;
			if (onchange) onchange(mapConfig);
		}
	};

	const handleSearchClicked = () => {
		showMapDialog = true;
	};

	const handleSelectMap = (style: DashboardMapStyle) => {
		mapStyleId = style.id;

		const mapLink = style.links.find((l) => l.rel === 'stylejson');

		mapConfig.base_style_id = undefined;
		mapConfig.style = mapLink?.href;
		mapConfig.style_id = Number(mapStyleId);
		mapConfig.hillshade = false;
		mapConfig.terrain = false;
		if (onchange) onchange(mapConfig);
		getGeoHubMapImageUrl();
		showMapDialog = false;
	};

	const handleHillshadeAndTerrainChanged = () => {
		if (mapConfig.base_style_id) {
			const styleUrl = new URL(mapConfig.style as string);
			styleUrl.searchParams.set('basemap', mapConfig.base_style_id);

			if (mapConfig.hillshade === true) {
				styleUrl.searchParams.set('hillshade', 'true');
			} else {
				styleUrl.searchParams.delete('hillshade');
			}

			// if (mapConfig.terrain === true) {
			// 	styleUrl.searchParams.set('terrain', 'true');
			// } else {
			styleUrl.searchParams.delete('terrain');
			// }

			mapConfig.style = styleUrl.href;
			if (onchange) onchange(mapConfig);
		}
	};

	onMount(() => {
		if (!mapStyleId) {
			if (mapConfig?.style_id) {
				mapStyleId = `${mapConfig?.style_id}`;
			}
		} else {
			getGeoHubMapImageUrl();
		}
	});

	const getGeoHubMapImageUrl = async () => {
		if (!mapStyleId) return;
		mapImageData = '';
		const styleUrl = `/api/style/${mapStyleId}.json`;
		const res = await fetch(styleUrl);
		const style: StyleSpecification = await res.json();
		mapImageData = await getMapImageFromStyle(
			style,
			mapImageSize[0],
			mapImageSize[1],
			page.data.staticApiUrl
		);
	};
</script>

<FieldControl title="Select Map Layer" showHelp={false}>
	{#snippet control()}
		<div>
			<SegmentButtons bind:buttons bind:selected={activeTab} capitalized={true} />
		</div>
	{/snippet}
</FieldControl>

<FieldControl
	title={activeTab === 'base_style_id' ? 'Choose map style' : 'Choose a map from GeoHub'}
	showHelp={false}
>
	{#snippet control()}
		<div>
			<div
				class="basemap-style-selector fixed-grid has-4-cols"
				hidden={activeTab !== 'base_style_id'}
			>
				<div class="grid">
					{#each MapStyles as style}
						<label
							class="cell"
							use:tippyTooltip={{
								content: `Use ${style.title === 'Carto' ? 'Standard' : style.title} style as default.`
							}}
						>
							<input
								onclick={() => {
									handleBaseStyleChanged(style);
								}}
								type="radio"
								name="DefaultMapStyle"
								value={style.title}
								checked={mapConfig.base_style_id?.toLowerCase() === style.id.toLowerCase()}
							/>
							<img
								class="sidebar-image"
								src={style.image}
								alt="{style.title} style"
								width="64"
								height="64"
								loading="lazy"
							/>
						</label>
					{/each}
				</div>
			</div>

			<div hidden={activeTab !== 'style_id'}>
				<div class="columns my-2 px-2">
					<div class="column p-0">
						<button
							class="geohubmap-button button has-text-weight-bold has-background-white-ter is-uppercase is-fullwidth py-3"
							onclick={handleSearchClicked}
						>
							geohub map catalog
						</button>
					</div>
					{#if mapStyleId}
						<div class="column p-0 ml-2">
							{#if mapImageData}
								<img
									src={mapImageData}
									alt="map preview"
									loading="lazy"
									width={mapImageSize[0]}
									height={mapImageSize[1]}
									use:tippyTooltip={{
										content: `This is current GeoHub map selected. To select another map, click GEOHUB MAP CATALOG button`
									}}
								/>
							{:else}
								<div class="is-flex is-justify-content-center mt-2">
									<Loader size="small" />
								</div>
							{/if}
						</div>
					{/if}
				</div>
				{#if mapStyleId}
					<FieldControl title="Change basemap for this style from default" showHelp={false}>
						{#snippet control()}
							<div>
								<div class="basemap-style-selector fixed-grid has-4-cols">
									<div class="grid">
										{#each MapStyles as style}
											<label
												class="cell"
												use:tippyTooltip={{
													content: `Use ${style.title === 'Carto' ? 'Standard' : style.title} style as default.`
												}}
											>
												<input
													onclick={() => {
														handleGeoHubMapBaseStyleChanged(style);
													}}
													type="radio"
													name="DefaultMapStyle"
													value={style.title}
													checked={mapConfig.base_style_id?.toLowerCase() ===
														style.id.toLowerCase()}
												/>
												<img
													class="sidebar-image"
													src={style.image}
													alt="{style.title} style"
													width="64"
													height="64"
													loading="lazy"
												/>
											</label>
										{/each}
									</div>
								</div>
							</div>
						{/snippet}
					</FieldControl>

					<FieldControl title="Hillshade" showHelp={true} showHelpPopup={false}>
						{#snippet control()}
							<div>
								<Switch
									bind:toggled={mapConfig.hillshade}
									on:change={handleHillshadeAndTerrainChanged}
								/>
							</div>
						{/snippet}
						{#snippet help()}
							<div>
								<span>Enable hillshade layer in this basemap if the option is enabled.</span>
							</div>
						{/snippet}
					</FieldControl>

					<!-- comment terrain switch since it has problem of trasition -->
					<!-- <FieldControl title="Terrain" showHelp={true} showHelpPopup={false}>
						<div slot="control">
							<Switch bind:toggled={mapConfig.terrain} on:change={handleHillshadeAndTerrainChanged} />
						</div>
						<div slot="help">
							<span>Enable terrain (3D) mode in this basemap if the option is enabled.</span>
						</div>
					</FieldControl> -->
				{/if}

				<input
					class="input"
					type="hidden"
					bind:value={mapStyleId}
					placeholder="Select a map"
					readonly
				/>
			</div>
		</div>
	{/snippet}
</FieldControl>

{#if showMapDialog}
	<ModalTemplate title="Select a map from GeoHub" width="100%" bind:show={showMapDialog}>
		{#snippet content()}
			<div>
				<GeoHubMapSelector bind:id={mapStyleId} onselect={handleSelectMap} />
			</div>
		{/snippet}
	</ModalTemplate>
{/if}

<style lang="scss">
	.basemap-style-selector {
		[type='radio'] {
			position: absolute;
			opacity: 0;
			width: 0;
			height: 0;
		}

		[type='radio'] + img {
			cursor: pointer;
		}

		[type='radio']:checked + img {
			outline: 2px solid #f00;
		}

		.sidebar-image {
			box-shadow: #0a0a0a 0 0 2px 0;
		}
	}

	.geohubmap-button {
		border: none;
	}
</style>
