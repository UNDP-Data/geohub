<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import DatasetPreview from '$components/pages/data/datasets/DatasetPreview.svelte';
	import PublishedDatasetDeleteDialog from '$components/pages/data/datasets/PublishedDatasetDeleteDialog.svelte';
	import UserPermission, {
		DatasetPermissionAPI
	} from '$components/pages/data/datasets/UserPermission.svelte';
	import RasterAlgorithmExplorer, {
		type AlgorithmLayerSpec
	} from '$components/pages/map/data/RasterAlgorithmExplorer.svelte';
	import Star from '$components/util/Star.svelte';
	import StacApiExplorer from '$components/util/stac/StacApiExplorer.svelte';
	import StacCatalogExplorer from '$components/util/stac/StacCatalogExplorer.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import {
		AcceptedOrganisationDomains,
		AccessLevel,
		Permission,
		TabNames
	} from '$lib/config/AppConfig';
	import {
		addDataToLocalStorage,
		createAttributionFromTags,
		getAccessLevelIcon,
		getDomainFromEmail,
		getFirstSymbolLayerId,
		isRgbRaster,
		removeSasTokenFromDatasetUrl
	} from '$lib/helper';
	import type { DatasetFeature, Layer, StacDataLayer } from '$lib/types';
	import {
		CopyToClipboard,
		FieldControl,
		handleEnterKey,
		HeroHeader,
		type BreadcrumbPage,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import { DefaultLink } from '@undp-data/svelte-undp-design';
	import { filesize } from 'filesize';
	import type { StyleSpecification } from 'maplibre-gl';
	import { marked } from 'marked';
	import { onMount } from 'svelte';
	import Time from 'svelte-time/Time.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let feature: DatasetFeature = $state(data.feature);

	let breadcrumbs: BreadcrumbPage[] = $state([
		{ title: 'home', url: '/' },
		{ title: 'datasets', url: '/data' },
		{ title: data.feature.properties.name as string, url: page.url.href }
	]);

	let tabs: Tab[] = $state([
		{
			id: `#${TabNames.INFO}`,
			label: TabNames.INFO
		},
		{
			id: `#${TabNames.LINKS}`,
			label: `Share ${TabNames.LINKS}`
		}
	]);

	let activeTab: string = $state(`#${TabNames.INFO}`);

	let confirmDeleteDialogVisible = $state(false);

	const accessIcon = getAccessLevelIcon(data.feature.properties.access_level, true);

	const links = data.feature.properties.links;
	const datasetApi = links?.find((l) => l.rel === 'self')?.href;
	const downloadUrl = links?.find((l) => l.rel === 'download')?.href;
	const infoUrl = links?.find((l) => l.rel === 'info')?.href;
	const statisticsUrl = links?.find((l) => l.rel === 'statistics')?.href;
	const tilesUrl = links?.find((l) => l.rel === 'tiles')?.href;
	const metadatajson = links?.find((l) => l.rel === 'metadatajson')?.href;
	const tilejson = links?.find((l) => l.rel === 'tilejson')?.href;
	const pbfUrl = links?.find((l) => l.rel === 'pbf')?.href;
	const previewUrl = links?.find((l) => l.rel === 'preview')?.href;
	const previewStyleUrl = links?.find((l) => l.rel === 'stylejson')?.href;
	const fgbUrls = links?.filter((l) => l.rel.startsWith('flatgeobuf'));
	let selectedFgbLayer = $state(fgbUrls && fgbUrls.length > 0 ? fgbUrls[0].rel : '');

	let isStac = data.feature.properties.tags?.find((t) => t.key === 'type' && t.value === 'stac');
	let isRgbTile = false;

	const tags: [{ key: string; value: string }] = data.feature.properties.tags as unknown as [
		{ key: string; value: string }
	];
	const sdgs = tags
		.filter((t) => t.key === 'sdg_goal')
		.sort((a, b) => parseInt(a.value) - parseInt(b.value));
	const unit = tags?.find((t) => t.key === 'unit')?.value;
	const attribution = createAttributionFromTags(tags);
	const year = tags?.filter((t) => t.key === 'year')?.map((t) => t.value);
	const granularity = tags?.filter((t) => t.key === 'granularity')?.map((t) => t.value);
	const resolution = tags?.filter((t) => t.key === 'resolution')?.map((t) => t.value);

	const dataAddedToMap = async (dataArray: StacDataLayer[]) => {
		const mapUrl = await addDataToLocalStorage(
			page.url,
			(layers: Layer[], style: StyleSpecification, styleId: string) => {
				for (const data of dataArray) {
					layers = [data.geohubLayer, ...layers];

					let idx = style.layers.length - 1;
					const firstSymbolLayerId = getFirstSymbolLayerId(style.layers);
					if (firstSymbolLayerId) {
						idx = style.layers.findIndex((l) => l.id === firstSymbolLayerId);
					}
					style.layers.splice(idx, 0, data.layer);

					if (!style.sources[data.sourceId]) {
						style.sources[data.sourceId] = data.source;
					}
				}

				return { layers, style, styleId };
			}
		);

		// move to /map page
		goto(mapUrl.url, { invalidateAll: true });
	};

	const checkRgbTile = async () => {
		const rasterTile = new RasterTileData(feature);
		const rasterInfo = await rasterTile.getMetadata();
		isRgbTile = isRgbRaster(rasterInfo.colorinterp as string[]);
	};

	onMount(async () => {
		if (feature.properties.permission && feature.properties.permission >= Permission.READ) {
			tabs = [
				...tabs.filter((t) => t.id !== `#${TabNames.LINKS}`),
				{
					id: `#${TabNames.PERMISSIONS}`,
					label: TabNames.PERMISSIONS
				},
				tabs.find((t) => t.id === `#${TabNames.LINKS}`)
			];
		}

		if (feature.properties.is_raster && !isStac) {
			await checkRgbTile();
			if (!isRgbTile) {
				const tabIndex = tabs.findIndex((t) => t.id === `#${TabNames.INFO}`);
				tabs.splice(tabIndex + 1, 0, {
					id: `#${TabNames.TOOLS}`,
					label: TabNames.TOOLS
				});
				tabs = [...tabs];
			}
		}
		let hash = page.url.hash;
		activeTab = hash.length > 0 && tabs.find((t) => t.id === hash) ? hash : `#${TabNames.INFO}`;
	});

	const handleAlgorithmSelected = async (layerSpec: AlgorithmLayerSpec) => {
		const rasterTile = new RasterTileData(feature);
		const rasterInfo = await rasterTile.getMetadata(layerSpec.algorithmId);
		const metadata = rasterInfo;

		if (layerSpec.algorithm.outputs.unit) {
			feature.properties.tags?.push({
				key: 'unit',
				value: layerSpec.algorithm.outputs.unit
			});
		}

		if (metadata && metadata.stats) {
			metadata.active_band_no = Object.keys(metadata.stats)[0];
		}

		const mapUrl = await addDataToLocalStorage(
			page.url,
			(layers: Layer[], style: StyleSpecification, styleId: string) => {
				// add layer to local storage
				layers = [
					{
						id: layerSpec.layerId,
						name: `${layerSpec.algorithm.title} ${feature.properties.name}`,
						info: metadata,
						dataset: feature,
						colorMapName: layerSpec.colormap_name
					},
					...layers
				];

				let idx = style.layers.length - 1;

				const firstSymbolLayerId = getFirstSymbolLayerId(style.layers);
				if (firstSymbolLayerId) {
					idx = style.layers.findIndex((l) => l.id === firstSymbolLayerId);
				}
				style.layers.splice(idx, 0, layerSpec.layer);

				if (!style.sources[layerSpec.sourceId]) {
					style.sources[layerSpec.sourceId] = layerSpec.source;
				}

				return { layers, style, styleId };
			}
		);

		// move to /map page
		goto(mapUrl.url, { invalidateAll: true });
	};

	const getEditMetadataPage = (url: string) => {
		const url4edit = removeSasTokenFromDatasetUrl(url);
		return `/data/${feature.properties.id}/edit?url=${url4edit}`;
	};

	const handleDeletedDataset = () => {
		if (browser) {
			window.location.href = '/data';
		}
	};

	const getFileSize = async (url: string) => {
		let bytes = 'N/A';
		const res = await fetch(url);
		if (res.ok) {
			const contentLength = res.headers.get('content-length');
			if (contentLength) {
				bytes = filesize(Number(contentLength), { round: 1 }) as string;
			}
		}
		return bytes;
	};
</script>

<HeroHeader
	title={feature.properties.name as string}
	icon={accessIcon}
	bind:breadcrumbs
	bind:tabs
	bind:activeTab
/>

<div class="m-6">
	<div hidden={activeTab !== `#${TabNames.INFO}`}>
		<div>
			<div class="buttons my-2">
				{#if feature.properties.permission}
					{#if !isStac && feature.properties.permission > Permission.READ}
						<a
							class="button is-link is-outlined is-uppercase has-text-weight-bold"
							href={getEditMetadataPage(feature.properties.url)}
						>
							Edit
						</a>

						<a
							class="button is-link is-outlined is-uppercase has-text-weight-bold"
							href="/data/{feature.properties.id}/style/edit"
						>
							Change default appearance
						</a>
					{/if}
					{#if feature.properties.permission > Permission.WRITE}
						<button
							class="button is-link is-outlined is-uppercase has-text-weight-bold"
							onclick={() => {
								confirmDeleteDialogVisible = true;
							}}
							onkeydown={handleEnterKey}
						>
							Unpublish
						</button>
					{/if}
				{/if}

				<Star
					bind:id={feature.properties.id as string}
					bind:isStar={feature.properties.is_star as boolean}
					bind:no_stars={feature.properties.no_stars as number}
					table="datasets"
					size="normal"
				/>
			</div>
		</div>

		<div class="columns">
			<div class="column is-10 is-flex is-flex-direction-column">
				<FieldControl title="Title" fontWeight="bold" showHelp={false}>
					{#snippet control()}
						<div>
							<p>{feature.properties.name}</p>
						</div>
					{/snippet}
				</FieldControl>
				<FieldControl title="Description" fontWeight="bold" showHelp={false}>
					{#snippet control()}
						<div>
							<!-- eslint-disable svelte/no-at-html-tags -->
							{@html marked(feature.properties.description as string)}
						</div>
					{/snippet}
				</FieldControl>

				<FieldControl title="Preview" fontWeight="bold" showHelp={false}>
					{#snippet control()}
						<div>
							{#if isStac}
								{@const stacId = feature.properties.tags?.find((t) => t.key === 'stac')?.value}
								{@const urlparts = feature.properties.url.split('/')}
								{@const collection = urlparts[urlparts.length - 2]}
								{@const isCatalog =
									feature.properties.tags?.find((t) => t.key === 'stacApiType')?.value ===
									'catalog'}

								{#if isCatalog}
									<StacCatalogExplorer
										stacId={stacId as string}
										dataset={feature}
										onDataAdded={dataAddedToMap}
									/>
								{:else}
									<StacApiExplorer
										dataset={feature}
										stacId={stacId as string}
										{collection}
										onDataAdded={dataAddedToMap}
									/>
								{/if}
							{:else}
								<DatasetPreview bind:feature />
							{/if}
						</div>
					{/snippet}
				</FieldControl>
			</div>

			<div class="column is-flex is-flex-direction-column">
				{#if sdgs.length > 0}
					<FieldControl
						title="SDGs"
						isFirstCharCapitalized={false}
						fontWeight="bold"
						showHelp={false}
					>
						{#snippet control()}
							<div>
								<div class="sdg-grid">
									{#each sdgs as sdg (sdg.value)}
										<span class="icon is-large">
											<i class="sdg-{sdg.value}"></i>
										</span>
									{/each}
								</div>
							</div>
						{/snippet}
					</FieldControl>
				{/if}
				<FieldControl title="License" fontWeight="bold" showHelp={false}>
					{#snippet control()}
						<div>
							{feature.properties.license && feature.properties.license?.length > 0
								? feature.properties.license
								: 'No license'}
						</div>
					{/snippet}
				</FieldControl>

				<FieldControl title="Access level" fontWeight="bold" showHelp={false}>
					{#snippet control()}
						<div>
							{#if feature.properties.access_level === AccessLevel.PUBLIC}
								Public
							{:else if feature.properties.access_level === AccessLevel.PRIVATE}
								Private
							{:else}
								{@const domain = getDomainFromEmail(feature.properties.created_user as string)}
								{@const org = AcceptedOrganisationDomains.find((d) => d.domain === domain)?.name}
								{org?.toUpperCase()}
							{/if}
						</div>
					{/snippet}
				</FieldControl>

				<FieldControl title="Source" fontWeight="bold" showHelp={false}>
					{#snippet control()}
						<div>
							<!-- eslint-disable svelte/no-at-html-tags -->
							{@html attribution}
						</div>
					{/snippet}
				</FieldControl>

				{#if unit}
					<FieldControl title="Unit" fontWeight="bold" showHelp={false}>
						{#snippet control()}
							<div>
								{unit}
							</div>
						{/snippet}
					</FieldControl>
				{/if}

				{#if year?.length > 0}
					<FieldControl title="Year" fontWeight="bold" showHelp={false}>
						{#snippet control()}
							<div>
								{year.join(', ')}
							</div>
						{/snippet}
					</FieldControl>
				{/if}

				{#if granularity?.length > 0}
					<FieldControl title="Admin Level" fontWeight="bold" showHelp={false}>
						{#snippet control()}
							<div>
								{granularity.join(', ')}
							</div>
						{/snippet}
					</FieldControl>
				{/if}

				{#if resolution?.length > 0}
					<FieldControl title="Resolution" fontWeight="bold" showHelp={false}>
						{#snippet control()}
							<div>
								{resolution.join(', ')}
							</div>
						{/snippet}
					</FieldControl>
				{/if}

				<FieldControl title="Created by" fontWeight="bold" showHelp={false}>
					{#snippet control()}
						<div class="wordwrap">
							{feature.properties.created_user}
						</div>
					{/snippet}
				</FieldControl>

				<FieldControl title="Created at" fontWeight="bold" showHelp={false}>
					{#snippet control()}
						<div>
							<Time timestamp={feature.properties.createdat} format="HH:mm, MM/DD/YYYY" />
						</div>
					{/snippet}
				</FieldControl>

				<FieldControl title="Updated by" fontWeight="bold" showHelp={false}>
					{#snippet control()}
						<div class="wordwrap">
							{feature.properties.updated_user}
						</div>
					{/snippet}
				</FieldControl>

				<FieldControl title="Updated at" fontWeight="bold" showHelp={false}>
					{#snippet control()}
						<div>
							<Time timestamp={feature.properties.updatedat} format="HH:mm, MM/DD/YYYY" />
						</div>
					{/snippet}
				</FieldControl>

				{#if downloadUrl}
					{@const filePath = new URL(downloadUrl).pathname.split('/')}
					<FieldControl title="Dataset" fontWeight="bold" showHelp={false}>
						{#snippet control()}
							<div>
								{#await getFileSize(downloadUrl) then bytes}
									<div class="is-flex is-align-content-center">
										<DefaultLink
											href={downloadUrl}
											title={`${filePath[filePath.length - 1].split('.')[1].toUpperCase()} ${bytes}`}
											target=""
										>
											{#snippet content()}
												<i class="fas fa-download has-text-primary pl-2"></i>
											{/snippet}
										</DefaultLink>
									</div>
								{/await}
							</div>
						{/snippet}
					</FieldControl>
				{/if}

				{#if fgbUrls && fgbUrls.length > 0}
					{@const fgbUrl = fgbUrls[0].href}
					<FieldControl title="Flatgeobuf" fontWeight="bold" showHelp={false}>
						{#snippet control()}
							<div>
								{#if fgbUrls.length === 1}
									{#await getFileSize(fgbUrl) then bytes}
										<div class="is-flex is-align-content-center">
											<DefaultLink href={fgbUrl} title={`Flatgeobuf ${bytes}`} target="">
												{#snippet content()}
													<i class="fas fa-download has-text-primary pl-2"></i>
												{/snippet}
											</DefaultLink>
										</div>
									{/await}
								{:else}
									<div class="select mb-2">
										<select bind:value={selectedFgbLayer}>
											{#each fgbUrls as url, index (index)}
												{@const layer = url.rel.split('-')[1]}
												<option value={url.rel}>{layer}</option>
											{/each}
										</select>
									</div>
									{#if selectedFgbLayer}
										{@const fgbUrl = fgbUrls.find((x) => x.rel === selectedFgbLayer)?.href}
										{#if fgbUrl}
											{#await getFileSize(fgbUrl) then bytes}
												<div class="is-flex is-align-content-center">
													<DefaultLink href={fgbUrl} title={`Flatgeobuf ${bytes}`} target="">
														{#snippet content()}
															<i class="fas fa-download has-text-primary pl-2"></i>
														{/snippet}
													</DefaultLink>
												</div>
											{/await}
										{/if}
									{/if}
								{/if}
							</div>
						{/snippet}
					</FieldControl>
				{/if}
			</div>
		</div>
	</div>

	{#if feature.properties.is_raster && !isStac}
		<div hidden={activeTab !== `#${TabNames.TOOLS}`}>
			<RasterAlgorithmExplorer {feature} onAdded={handleAlgorithmSelected} />
		</div>
	{/if}

	{#if page.data.session}
		<div hidden={activeTab !== `#${TabNames.PERMISSIONS}`}>
			<UserPermission api={new DatasetPermissionAPI(feature)} />
		</div>
	{/if}

	<div hidden={activeTab !== `#${TabNames.LINKS}`}>
		<div class="mx-3 mt-4">
			<p class="title is-5">For developers</p>
			{#if datasetApi}
				<FieldControl
					title="GeoHub Dataset API URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={true}
					showHelpPopup={false}
				>
					{#snippet control()}
						<div>
							<CopyToClipboard value={datasetApi} />
						</div>
					{/snippet}
					{#snippet help()}
						<div><a href="/api" target="_blank">Learn more about GeoHub API</a></div>
					{/snippet}
				</FieldControl>
			{/if}
			{#if previewUrl}
				<FieldControl
					title="Preview URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={true}
					showHelpPopup={false}
				>
					{#snippet control()}
						<div>
							<CopyToClipboard value={previewUrl} />
						</div>
					{/snippet}
					{#snippet help()}
						<div>{`Please replace {width} and {height} to pixel values`}</div>
					{/snippet}
				</FieldControl>
			{/if}
			{#if previewStyleUrl}
				<FieldControl
					title="Preview Style URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={true}
					showHelpPopup={false}
				>
					{#snippet control()}
						<div>
							<CopyToClipboard value={previewStyleUrl} />
						</div>
					{/snippet}
					{#snippet help()}
						<div>Maplibre style URL for preview</div>
					{/snippet}
				</FieldControl>
			{/if}
			{#if downloadUrl}
				<FieldControl
					title="File URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={!feature.properties.is_raster}
					showHelpPopup={false}
				>
					{#snippet control()}
						<div>
							<CopyToClipboard value={downloadUrl} />
						</div>
					{/snippet}
					{#snippet help()}
						<div>
							<a href="https://protomaps.com/docs/frontends/maplibre" target="_blank"
								>Learn more about how to integrate PMTiles with Maplibre GL JS</a
							>
						</div>
					{/snippet}
				</FieldControl>
			{/if}

			{#if tilesUrl}
				<FieldControl
					title="Titiler Tiles API URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={false}
					showHelpPopup={false}
				>
					{#snippet control()}
						<div>
							<CopyToClipboard value={tilesUrl} />
						</div>
					{/snippet}
				</FieldControl>
			{/if}
			{#if infoUrl}
				<FieldControl
					title="Titiler Info API URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={false}
					showHelpPopup={false}
				>
					{#snippet control()}
						<div>
							<CopyToClipboard value={infoUrl} />
						</div>
					{/snippet}
				</FieldControl>
			{/if}
			{#if statisticsUrl}
				<FieldControl
					title="Titiler Statistics API URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={false}
					showHelpPopup={false}
				>
					{#snippet control()}
						<div>
							<CopyToClipboard value={statisticsUrl} />
						</div>
					{/snippet}
				</FieldControl>
			{/if}

			{#if tilejson}
				<FieldControl
					title="TileJSON URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={false}
					showHelpPopup={false}
				>
					{#snippet control()}
						<div>
							<CopyToClipboard value={tilejson} />
						</div>
					{/snippet}
				</FieldControl>
			{/if}

			{#if infoUrl || statisticsUrl || tilesUrl}
				<a href="{new URL(infoUrl as string).origin}/docs" target="_blank"
					>Learn more about Titiler API</a
				>
			{/if}

			{#if pbfUrl}
				<FieldControl
					title="Vector Tile PBF URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={false}
					showHelpPopup={false}
				>
					{#snippet control()}
						<div>
							<CopyToClipboard value={pbfUrl} />
						</div>
					{/snippet}
				</FieldControl>
			{/if}

			{#if metadatajson}
				<FieldControl
					title="Metadata JSON URL"
					isFirstCharCapitalized={false}
					fontWeight="bold"
					showHelp={false}
					showHelpPopup={false}
				>
					{#snippet control()}
						<div>
							<CopyToClipboard value={metadatajson} />
						</div>
					{/snippet}
				</FieldControl>
			{/if}
		</div>
	</div>
</div>

<PublishedDatasetDeleteDialog
	bind:id={feature.properties.id as string}
	bind:name={feature.properties.name as string}
	bind:dialogShown={confirmDeleteDialogVisible}
	ondelete={handleDeletedDataset}
/>

<style lang="scss">
	.sdg-grid {
		display: flex;
		flex-direction: row;
		gap: 5px;
		flex-wrap: wrap;
	}

	.wordwrap {
		overflow-wrap: break-word;
		word-break: break-all;
	}
</style>
