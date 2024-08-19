<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import IconImagePickerCard from '$components/maplibre/symbol/IconImagePickerCard.svelte';
	import ImageUploader from '$components/pages/storymap/ImageUploader.svelte';
	import {
		ClassificationMethods,
		DatasetSortingColumns,
		IconOverlapPriority,
		IngestingDatasetSortingColumns,
		LimitOptions,
		MapSortingColumns,
		MapStyles,
		NumberOfClassesMaximum,
		NumberOfClassesMinimum,
		RasterResamplingMethods,
		StacDateFilterOptions,
		StacSearchLimitOptions,
		StorymapSortingColumns
	} from '$lib/config/AppConfig';
	import { LineTypes } from '$lib/config/AppConfig/LineTypes';
	import { DefaultUserConfig, type UserConfig } from '$lib/config/DefaultUserConfig';
	import { getSpriteImageList, imageUrlToBase64 } from '$lib/helper';
	import type { SpriteImage } from '$lib/types';
	import type { SidebarPosition } from '@undp-data/svelte-sidebar';
	import {
		FieldControl,
		HeroHeader,
		SegmentButtons,
		Slider,
		clean,
		initTippy,
		initTooltipTippy,
		type BreadcrumbPage,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import {
		Checkbox,
		Radios,
		Sidebar,
		Switch,
		type SidebarItem
	} from '@undp-data/svelte-undp-design';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import type { StyleSpecification } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const tippy = initTippy();
	const tippyTooltip = initTooltipTippy();
	let userSettings: UserConfig = data.config;
	let isSubmitting = false;
	let defaultMapStyle: string = userSettings.DefaultMapStyle;
	let sideBarPosition: SidebarPosition = userSettings.SidebarPosition;
	let lineWidth = [userSettings.LineWidth];
	let numberOfClasses = [userSettings.NumberOfClasses];
	let labelFontSize = [userSettings.LabelFontSize];
	let labelHaloWidth = [userSettings.LabelHaloWidth];
	let iconSize = [userSettings.IconSize];
	let layerOpacity = [userSettings.LayerOpacity];
	let selectedIcon = userSettings.IconImage;
	let stacMaxCloudCover = [userSettings.StacMaxCloudCover];
	let fillExtrusionDefaultPitch = [userSettings.FillExtrusionDefaultPitch];
	let StorymapDefaultLogo = userSettings.StorymapDefaultLogo;

	let defaultStorymayLogoDataUrl = '';

	let linePattern = LineTypes.find((t) => t.title === userSettings.LinePattern)?.title;
	const setLinePatterns = () => {
		const pattern = LineTypes.map((type) => {
			const label = `
          ${type.title}
          <span
            style="font-family: monospace;position:relative;left: 10px;top:-4px;position:relative;font-weight: bold;">
            ${type.pattern}
          </span>`;

			return {
				label: label,
				value: type.title
			};
		});
		return pattern;
	};

	let linePatterns = setLinePatterns();

	let spriteImageList: SpriteImage[];
	$: iconImageSrc = spriteImageList?.find((i) => i.alt === selectedIcon)?.src;
	let tooltipContent: HTMLElement;

	let tabs: Tab[] = [
		{
			id: '#maps',
			label: 'Maps page'
		},
		{
			id: '#data',
			label: 'Dataset page'
		},
		{
			id: '#mapeditor',
			label: 'Map edit page'
		},
		{
			id: '#storymaps',
			label: 'Storymaps page'
		}
	];

	let sidebarItems: { [key: string]: SidebarItem[] } = {
		'#maps': [{ title: 'Map search', href: '#maps-search' }],
		'#data': [
			{ title: 'Dataset search', href: '#dataset-search' },
			{ title: 'Satellite search', href: '#satellite-search' }
		],
		'#mapeditor': [
			{ title: 'Map Layout', href: '#layout' },
			{ title: 'Search', href: '#search' },
			{ title: 'Legend', href: '#legend' },
			{ title: '3D polygon bisualization', href: '#fill-extrusion' },
			{ title: 'Line visualization', href: '#line' },
			{ title: 'Point visualization', href: '#point' },
			{ title: 'Raster visualization', href: '#raster' },
			{ title: 'Label', href: '#label' }
		],
		'#storymaps': [
			{ title: 'Storymaps search', href: '#storymaps-search' },
			{ title: 'Storymap builder', href: '#storymap-builder' }
		]
	};

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'Settings', url: $page.url.href }
	];

	const hash = $page.url.hash;
	let activeTab = tabs[0].id;

	if (hash) {
		let tab = tabs.find((t) => t.id === hash);
		if (tab) {
			activeTab = tab.id;
		} else {
			for (const key of Object.keys(sidebarItems)) {
				const item = sidebarItems[key].find((i) => i.href === hash);
				if (!item) continue;
				activeTab = key;
				break;
			}
		}
	}

	const DatasetLimitOptions = LimitOptions.includes(DefaultUserConfig.DatasetSearchLimit)
		? LimitOptions
		: [...LimitOptions, DefaultUserConfig.DatasetSearchLimit].sort((a, b) => a - b);

	const DataPageLimitOptions = LimitOptions.includes(DefaultUserConfig.DataPageSearchLimit)
		? LimitOptions
		: [...LimitOptions, DefaultUserConfig.DataPageSearchLimit].sort((a, b) => a - b);

	const MapPageLimitOptions = LimitOptions.includes(DefaultUserConfig.MapPageSearchLimit)
		? LimitOptions
		: [...LimitOptions, DefaultUserConfig.MapPageSearchLimit].sort((a, b) => a - b);

	const StorymapPageLimitOptions = LimitOptions.includes(DefaultUserConfig.StorymapPageSearchLimit)
		? LimitOptions
		: [...LimitOptions, DefaultUserConfig.StorymapPageSearchLimit].sort((a, b) => a - b);

	const resetToDefault = () => {
		userSettings = JSON.parse(JSON.stringify(DefaultUserConfig));
		defaultMapStyle = userSettings.DefaultMapStyle;
		sideBarPosition = userSettings.SidebarPosition;
		lineWidth = [userSettings.LineWidth];
		numberOfClasses = [userSettings.NumberOfClasses];
		labelFontSize = [userSettings.LabelFontSize];
		labelHaloWidth = [userSettings.LabelHaloWidth];
		iconSize = [userSettings.IconSize];
		layerOpacity = [userSettings.LayerOpacity];
		linePattern = LineTypes.find((t) => t.title === userSettings.LinePattern)?.title;
		linePatterns = setLinePatterns();
		stacMaxCloudCover = [userSettings.StacMaxCloudCover];
		selectedIcon = userSettings.IconImage;
		fillExtrusionDefaultPitch = [userSettings.FillExtrusionDefaultPitch];
		StorymapDefaultLogo = userSettings.StorymapDefaultLogo;
		toast.push('Settings were reset. Please click apply button to save them.');
	};

	onMount(() => {
		loadDeaultUNDPLogoDataUrl();
		if (!StorymapDefaultLogo.startsWith('data:')) {
			imageUrlToBase64(data.config.StorymapDefaultLogo).then((logo) => {
				StorymapDefaultLogo = logo;
			});
		}
		getSpriteImage();
	});

	const getSpriteImage = async () => {
		const style = MapStyles[0];
		const res = await fetch(style.uri);
		const json: StyleSpecification = await res.json();
		const spriteUrl = json.sprite as string;
		spriteImageList = await getSpriteImageList(spriteUrl);
	};

	const loadDeaultUNDPLogoDataUrl = async () => {
		const dataUrl = await imageUrlToBase64(DefaultUserConfig.StorymapDefaultLogo);
		defaultStorymayLogoDataUrl = dataUrl;
	};

	const resetLogoToUNP = () => {
		StorymapDefaultLogo = defaultStorymayLogoDataUrl;
		userSettings.StorymapDefaultLogo = StorymapDefaultLogo;
	};
</script>

<HeroHeader
	title={breadcrumbs[breadcrumbs.length - 1].title}
	bind:breadcrumbs
	bind:tabs
	bind:activeTab
/>

<form
	action="?/save"
	method="post"
	use:enhance={() => {
		isSubmitting = true;
		return async ({ result }) => {
			if (result.status === 200) {
				await invalidateAll();
				toast.push('Settings saved successfully!!');
			} else {
				toast.push('Error saving settings!!');
			}
			isSubmitting = false;
		};
	}}
>
	<div class="sidebar-container m-6">
		<div class="sidebar">
			<Sidebar data={sidebarItems[activeTab]} isFixed={false} />
		</div>
		<div>
			<section class="section pt-0">
				<!-- main page settings -->
				<div hidden={activeTab !== tabs[0].id}>
					<h3 class="title is-3 section-title" id="maps-search">Search</h3>

					<FieldControl title="Default Map table view" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">
							Change the default map table view type either card view or list view
						</div>
						<div slot="control">
							<SegmentButtons
								buttons={[
									{ title: 'Card', icon: 'fa-solid fa-border-all', value: 'card' },
									{ title: 'List', icon: 'fa-solid fa-list', value: 'list' }
								]}
								bind:selected={userSettings.MapPageTableViewType}
							/>
							<input
								type="hidden"
								name="MapPageTableViewType"
								bind:value={userSettings.MapPageTableViewType}
							/>
						</div>
					</FieldControl>

					<FieldControl title="Default search Limit" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">The number of items to search at data page and maps page</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select name="MapPageSearchLimit" bind:value={userSettings.MapPageSearchLimit}>
									{#each MapPageLimitOptions as limit}
										<option value={limit}>{limit}</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>

					<FieldControl title="Default sort setting" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">Change sort setting for the search result on datasets.</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select name="MapPageSortingColumn" bind:value={userSettings.MapPageSortingColumn}>
									{#each MapSortingColumns as column}
										<option value={column.value}>{column.label}</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>
				</div>

				<!-- data page settings -->
				<div hidden={activeTab !== tabs[1].id}>
					<h3 class="title is-3 section-title" id="dataset-search">Dataset Search</h3>

					<FieldControl
						title="Default dataset table view"
						showHelpPopup={false}
						marginBottom="2rem"
					>
						<div slot="help">
							Change the default dataset table view type either card view or list view or map view
						</div>
						<div slot="control">
							<SegmentButtons
								buttons={[
									{ title: 'Card', icon: 'fa-solid fa-border-all', value: 'card' },
									{ title: 'List', icon: 'fa-solid fa-list', value: 'list' },
									{ title: 'Map', icon: 'fa-solid fa-map', value: 'map' }
								]}
								bind:selected={userSettings.DataPageTableViewType}
							/>
							<input
								type="hidden"
								name="DataPageTableViewType"
								bind:value={userSettings.DataPageTableViewType}
							/>
						</div>
					</FieldControl>

					<FieldControl title="Default search Limit" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">The number of items to search at data page and maps page</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select name="DataPageSearchLimit" bind:value={userSettings.DataPageSearchLimit}>
									{#each DataPageLimitOptions as limit}
										<option value={limit}>{limit}</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>
					<FieldControl
						title="Default search query operator"
						showHelpPopup={false}
						marginBottom="2rem"
					>
						<div slot="help">
							Change searching operator to either 'AND' or 'OR'. 'AND' enables you to search
							datasets which exactly match all keyword. 'OR' allows you to search wider range of
							results by matching at least a word.
						</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select
									name="DataPageSearchQueryOperator"
									bind:value={userSettings.DataPageSearchQueryOperator}
								>
									{#each ['and', 'or'] as operator}
										<option value={operator}>
											{#if operator === 'and'}
												Match all words typed (AND)
											{:else}
												Match at least a word typed (OR)
											{/if}
										</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>
					<FieldControl
						title="Defaut tag search operator"
						showHelpPopup={false}
						marginBottom="2rem"
					>
						<div slot="help">
							Change searching operator for tag filter to either 'AND' or 'OR'. 'AND' enables you to
							search datasets which exactly match all tags you selected. 'OR' allows you to search
							wider range of results by matching at least a tag selected.
						</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select
									name="DataPageTagSearchOperator"
									bind:value={userSettings.DataPageTagSearchOperator}
								>
									{#each ['and', 'or'] as operator}
										<option value={operator}>
											{#if operator === 'and'}
												Match all selected tags (AND)
											{:else}
												Match at least a tag selected (OR)
											{/if}
										</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>
					<FieldControl title="Default sort setting" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">Change sort setting for the search result on datasets.</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select
									name="DataPageSortingColumn"
									bind:value={userSettings.DataPageSortingColumn}
								>
									{#each DatasetSortingColumns as column}
										<option value={column.value}>{column.label}</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>

					<FieldControl
						title="Default sorting column setting for my data"
						showHelpPopup={false}
						marginBottom="2rem"
					>
						<div slot="help">
							Change sorting column setting for the search result on my data table.
						</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select
									name="DataPageIngestingSortingColumn"
									bind:value={userSettings.DataPageIngestingSortingColumn}
								>
									{#each IngestingDatasetSortingColumns as column}
										<option value={column.value}>{column.label}</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>

					<FieldControl
						title="Default sorting order setting for my data"
						showHelpPopup={false}
						marginBottom="2rem"
					>
						<div slot="help">
							Change sorting order setting for the search result on my data table.
						</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select
									name="DataPageIngestingSortingOrder"
									bind:value={userSettings.DataPageIngestingSortingOrder}
								>
									<option value="asc">A to Z / Old to latest</option>
									<option value="desc">Z to A / Latest to old</option>
								</select>
							</div>
						</div>
					</FieldControl>

					<FieldControl
						title="Dataset file upload preference"
						showHelpPopup={false}
						marginBottom="2rem"
					>
						<div slot="help">
							Most of GIS data formats can hold more than one vector layer. The option below, if
							checked will result in extracting each layer a different dataset (own metadata, name
							and other properties). The alternative is to join all layers into one multi-layer
							dataset where layers are hidden inside and not discoverable directly.
						</div>
						<div slot="control" class="is-flex mt-5 help">
							<Checkbox
								on:clicked={() =>
									(userSettings.DataPageIngestingJoinVectorTiles =
										!userSettings.DataPageIngestingJoinVectorTiles)}
								checked={!userSettings.DataPageIngestingJoinVectorTiles}
								label="Every layer (Point, Line, Polygon) into its own file"
							/>
							<input
								type="hidden"
								name="DataPageIngestingJoinVectorTiles"
								bind:value={userSettings.DataPageIngestingJoinVectorTiles}
							/>
						</div>
					</FieldControl>

					<!-- satellite search prefrerence settings -->
					<h3 class="title is-3 section-title" id="satellite-search">Satellite data search</h3>

					<FieldControl title="Default search Limit" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">The number of items to search at satellite data expolorer.</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select name="StacSearchLimit" bind:value={userSettings.StacSearchLimit}>
									{#each StacSearchLimitOptions as limit}
										<option value={limit}>{limit}</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>

					<FieldControl
						title="Default max cloud cover rate"
						showHelpPopup={false}
						marginBottom="2rem"
					>
						<div slot="help">
							The default percentage of max cloud cover rate to search satellite imagery. If you
							increase it, more images can be hit, but cloud on the image will also be increased.
						</div>
						<div slot="control">
							<div class="control">
								<Slider
									bind:values={stacMaxCloudCover}
									min={0}
									max={100}
									step={1}
									pips
									first="label"
									last="label"
									rest={false}
									suffix="%"
								/>
								<input type="hidden" name="StacMaxCloudCover" bind:value={stacMaxCloudCover} />
							</div>
						</div>
					</FieldControl>

					<FieldControl
						title="Default search preference by date"
						showHelpPopup={false}
						marginBottom="2rem"
					>
						<div slot="help">
							This option is to set default user preference for searching datasets by date.
						</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select name="StacDateFilterOption" bind:value={userSettings.StacDateFilterOption}>
									{#each StacDateFilterOptions as option}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>
				</div>
				<!-- map page settings -->
				<div hidden={activeTab !== tabs[2].id}>
					<h3 class="title is-3 section-title" id="layout">Map Layout</h3>

					<FieldControl title="Default base map" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">Select a default base map style</div>
						<div slot="control" class="is-flex">
							{#each MapStyles as style}
								<label
									class="m-1"
									use:tippyTooltip={{
										content: `Use ${style.title === 'Carto' ? 'Standard' : style.title} style as default.`
									}}
								>
									<input
										on:select={() => defaultMapStyle === style.title}
										type="radio"
										name="DefaultMapStyle"
										value={style.title}
										checked={defaultMapStyle === style.title}
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
					</FieldControl>

					<FieldControl title="Sidebar Position" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">Select sidebar position of main GeoHub page.</div>
						<div slot="control">
							<div class="columns is-mobile">
								{#each ['left', 'right'] as pos}
									<label
										class="column"
										use:tippyTooltip={{
											content: `Show the side bar at the  ${pos} side as default.`
										}}
									>
										<input
											on:select={() => sideBarPosition === pos}
											type="radio"
											name="SidebarPosition"
											value={pos}
											checked={sideBarPosition === pos}
										/>
										<img
											class="sidebar-image"
											src="/assets/sidebar/{pos}-sidebar.png"
											alt="{pos} sidebar"
											loading="lazy"
										/>
									</label>
								{/each}
							</div>
						</div>
					</FieldControl>

					<FieldControl title="Development mode" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">
							If enabled, it shows tile boundaries and collision boxes for advanced users to style
							layers. You can also enable dev mode if `dev=true` query param is added in map editor
							page URL.
						</div>
						<div slot="control">
							<div class="field">
								<Switch
									bind:toggled={userSettings.MaplibreDevMode}
									showValue={true}
									toggledText="Enable devlopment mode on map editor"
									untoggledText="Disable devlopment mode on map editor"
								/>
							</div>
							<input
								type="hidden"
								name="MaplibreDevMode"
								bind:value={userSettings.MaplibreDevMode}
							/>
						</div>
					</FieldControl>

					<h3 class="title is-3 section-title" id="search">Search</h3>

					<FieldControl title="Default search Limit" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">The number of items to search at data tab in main GeoHub page.</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select name="DatasetSearchLimit" bind:value={userSettings.DatasetSearchLimit}>
									{#each DatasetLimitOptions as limit}
										<option value={limit}>{limit}</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>

					<FieldControl
						title="Default search query operator"
						showHelpPopup={false}
						marginBottom="2rem"
					>
						<div slot="help">
							Change searching operator to either 'AND' or 'OR'. 'AND' enables you to search
							datasets which exactly match all keyword. 'OR' allows you to search wider range of
							results by matching at least a word.
						</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select
									name="DatasetSearchQueryOperator"
									bind:value={userSettings.DatasetSearchQueryOperator}
								>
									{#each ['and', 'or'] as operator}
										<option value={operator}>
											{#if operator === 'and'}
												Match all words typed (AND)
											{:else}
												Match at least a word typed (OR)
											{/if}
										</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>

					<FieldControl title="Default sort setting" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">Change sort setting for the search result on datasets.</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<div class="select is-fullwidth">
									<select
										name="DatasetSortingColumn"
										bind:value={userSettings.DatasetSortingColumn}
									>
										{#each DatasetSortingColumns as column}
											<option value={column.value}>{column.label}</option>
										{/each}
									</select>
								</div>
							</div>
						</div>
					</FieldControl>

					<FieldControl
						title="Defaut tag search operator"
						showHelpPopup={false}
						marginBottom="2rem"
					>
						<div slot="help">
							Change searching operator for tag filter to either 'AND' or 'OR'. 'AND' enables you to
							search datasets which exactly match all tags you selected. 'OR' allows you to search
							wider range of results by matching at least a tag selected.
						</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select name="TagSearchOperator" bind:value={userSettings.TagSearchOperator}>
									{#each ['and', 'or'] as operator}
										<option value={operator}>
											{#if operator === 'and'}
												Match all selected tags (AND)
											{:else}
												Match at least a tag selected (OR)
											{/if}
										</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>

					<h3 class="title is-3 section-title" id="legend">Legend</h3>

					<FieldControl
						title="Default Classification Method"
						showHelpPopup={false}
						marginBottom="2rem"
					>
						<div slot="help">Change the default classification method</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select name="ClassificationMethod" bind:value={userSettings.ClassificationMethod}>
									{#each ClassificationMethods as classificationMethod}
										<option value={classificationMethod.code}>{classificationMethod.name}</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>
					<FieldControl title="Default number of classes" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">
							Change the default number of classes in classify legend for vector layer and raster
							layer
						</div>
						<div slot="control">
							<div class="control">
								<Slider
									bind:values={numberOfClasses}
									min={NumberOfClassesMinimum}
									max={NumberOfClassesMaximum}
									step={1}
									pips
									first="label"
									last="label"
									rest={false}
								/>
								<input type="hidden" name="NumberOfClasses" bind:value={numberOfClasses[0]} />
							</div>
						</div>
					</FieldControl>
					<FieldControl title="Default Layer Opacity" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">Change Default Layer Opacity</div>
						<div slot="control">
							<Slider
								bind:values={layerOpacity}
								min={0}
								max={100}
								step={1}
								pips
								first="label"
								last="label"
								suffix="%"
								rest={false}
							/>
							<input type="hidden" bind:value={layerOpacity[0]} name="LayerOpacity" />
						</div>
					</FieldControl>

					<h3 class="title is-3 section-title" id="fill-extrusion">3D Polygon Visualization</h3>

					<FieldControl title="Default pitch" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">
							The default pitch will be used when you add polygon data as 3D Polygon layer type. It
							will automatically be tilted by the deault pitch setting.
						</div>
						<div slot="control">
							<div class="control">
								<Slider
									bind:values={fillExtrusionDefaultPitch}
									min={0}
									max={85}
									step={1}
									pips
									first="label"
									last="label"
									rest={false}
								/>
								<input
									type="hidden"
									name="FillExtrusionDefaultPitch"
									bind:value={fillExtrusionDefaultPitch[0]}
								/>
							</div>
						</div>
					</FieldControl>

					<h3 class="title is-3 section-title" id="line">Line Visualization</h3>

					<FieldControl title="Default line width" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">
							The default line width in <b>line</b> vector layer legend tab.
						</div>
						<div slot="control">
							<div class="control">
								<Slider
									bind:values={lineWidth}
									min={0}
									max={10}
									step={0.5}
									pips
									first="label"
									last="label"
									rest={false}
								/>
								<input type="hidden" name="LineWidth" bind:value={lineWidth[0]} />
							</div>
						</div>
					</FieldControl>
					<FieldControl title="Default line pattern" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">
							The default pattern in <b>line</b> vector layer legend tab.
						</div>
						<div slot="control">
							<div class="line-pattern-view-container" data-testid="line-pattern-view-container">
								<Radios
									groupName="LinePattern"
									bind:radios={linePatterns}
									bind:value={linePattern}
									allowHtml={true}
									isVertical={true}
								/>
							</div>
						</div>
					</FieldControl>

					<h3 class="title is-3 section-title" id="point">Point Visualization</h3>

					<FieldControl title="Icon Symbol" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">Pick the default icon symbol for symbol layers</div>
						<div slot="control">
							{#if spriteImageList?.length > 0}
								<button type="button" class="button" use:tippy={{ content: tooltipContent }}>
									<span class="icon is-small">
										<figure class={`image is-24x24`} data-testid="icon-figure">
											<img
												data-testid="icon-image"
												src={iconImageSrc}
												alt={clean(selectedIcon)}
												title={clean(selectedIcon)}
												style="width:24px; height:24px; color: white;"
											/>
										</figure>
									</span>
									<span>{clean(selectedIcon)}</span>
								</button>
								<div
									style="max-height: 350px; overflow-y: auto; overflow-x: hidden; max-width: fit-content"
									class="tooltip"
									data-testid="tooltip"
									bind:this={tooltipContent}
								>
									<div class="columns m-2 is-multiline is-justify-content-space-evenly">
										{#each spriteImageList as image}
											<div class="m-1">
												<IconImagePickerCard
													on:iconSelected={(e) => (selectedIcon = e.detail.iconImageAlt)}
													iconImageAlt={image.alt}
													iconImageSrc={image.src}
													withinForm={true}
													isSelected={selectedIcon === image.alt ? true : false}
												/>
											</div>
										{/each}
									</div>
								</div>
								<input type="hidden" value={selectedIcon} name="IconImage" />
							{/if}
						</div>
					</FieldControl>
					<FieldControl title="Icon Overlap Priority" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">
							Change Icon Overlap priority. When <b>Never</b> is selected, the icon will be hidden
							if it collides with any other previously drawn symbol. When <b>Always</b> is selected,
							the icon will be visible even if it collides with any other previously drawn symbol.
							When
							<b>Cooperative</b> is selected, If the icon collides with another previously drawn symbol,
							the overlap mode for that symbol is checked. If the previous symbol was placed using never
							overlap mode, the new icon is hidden. If the previous symbol was placed using always or
							cooperative overlap mode, the new icon is visible.
						</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select name="IconOverlapPriority" bind:value={userSettings.IconOverlapPriority}>
									{#each IconOverlapPriority as overlapPriority}
										<option value={overlapPriority.value}>{overlapPriority.label}</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>
					<FieldControl title="Icon Size" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">Change icon size for symbol layers</div>
						<div slot="control">
							<Slider
								bind:values={iconSize}
								min={0}
								max={5}
								step={0.1}
								pips
								first="label"
								last="label"
								rest={false}
							/>
							<input type="hidden" bind:value={iconSize[0]} name="IconSize" />
						</div>
					</FieldControl>

					<h3 class="title is-3 section-title" id="raster">Raster Visualization</h3>
					<FieldControl
						title="Default raster resampling method"
						showHelpPopup={false}
						marginBottom="2rem"
					>
						<div slot="help">
							Change raster resampling method
							<p>
								<b>Bili-near</b> filtering interpolates pixel values using the weighted average of the
								four closest original source pixels creating a smooth but blurry look when overscaled
							</p>
							<p>
								<b>Nearest neighbour</b> filtering interpolates pixel values using the weighted average
								of the four closest original source pixels creating a smooth but blurry look when overscaled
							</p>
						</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select
									name="RasterResamplingMethod"
									bind:value={userSettings.RasterResamplingMethod}
								>
									{#each RasterResamplingMethods as resamplingMethod}
										<option value={resamplingMethod.value}>{resamplingMethod.label}</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>

					<h3 class="title is-3 section-title" id="label">Label</h3>

					<FieldControl title="Default label font" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">Change default label font</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select name="LabelTextFont" bind:value={userSettings.LabelTextFont}>
									{#each data.fonts as font}
										<option value={font}>{font}</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>

					<FieldControl title="Default label font size" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">Change default label font size</div>
						<div slot="control">
							<Slider
								bind:values={labelFontSize}
								min={0}
								max={32}
								step={0.5}
								pips
								first="label"
								last="label"
								rest={false}
							/>
							<input type="hidden" bind:value={labelFontSize[0]} name="LabelFontSize" />
						</div>
					</FieldControl>

					<FieldControl title="Default label halo width" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">Change default halo size for labels.</div>
						<div slot="control">
							<Slider
								bind:values={labelHaloWidth}
								min={0}
								max={10}
								step={0.1}
								pips
								first="label"
								last="label"
								rest={false}
							/>
							<input type="hidden" bind:value={labelHaloWidth[0]} name="LabelHaloWidth" />
						</div>
					</FieldControl>
				</div>

				<!-- storymaps page settings -->
				<div class="mb-4" hidden={activeTab !== tabs[3].id}>
					<h3 class="title is-3 section-title" id="storymaps-search">Search</h3>

					<FieldControl title="Default Map table view" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">
							Change the default storymap table view type either card view or list view
						</div>
						<div slot="control">
							<SegmentButtons
								buttons={[
									{ title: 'Card', icon: 'fa-solid fa-border-all', value: 'card' },
									{ title: 'List', icon: 'fa-solid fa-list', value: 'list' }
								]}
								bind:selected={userSettings.StorymapPageTableViewType}
							/>
							<input
								type="hidden"
								name="StorymapPageTableViewType"
								bind:value={userSettings.StorymapPageTableViewType}
							/>
						</div>
					</FieldControl>

					<FieldControl title="Default search Limit" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">The number of items to search at storymaps page</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select
									name="StorymapPageSearchLimit"
									bind:value={userSettings.StorymapPageSearchLimit}
								>
									{#each StorymapPageLimitOptions as limit}
										<option value={limit}>{limit}</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>

					<FieldControl title="Default sort setting" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">Change sort setting for the search result on storymaps.</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select
									name="StorymapPageSortingColumn"
									bind:value={userSettings.StorymapPageSortingColumn}
								>
									{#each StorymapSortingColumns as column}
										<option value={column.value}>{column.label}</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>

					<h3 class="title is-3 section-title" id="storymap-builder">Storymap builder</h3>

					<h6 class="title is-6 section-title">Storymap header settings</h6>

					<FieldControl title="Default logo" showHelpPopup={false} marginBottom="2rem">
						<div slot="help">Change default logo for storymap header.</div>
						<div slot="control">
							<ImageUploader
								bind:dataUrl={StorymapDefaultLogo}
								on:change={() => {
									userSettings.StorymapDefaultLogo = StorymapDefaultLogo ?? '';
								}}
							/>
							<input
								type="hidden"
								name="StorymapDefaultLogo"
								bind:value={userSettings.StorymapDefaultLogo}
							/>
							{#if defaultStorymayLogoDataUrl !== StorymapDefaultLogo}
								<button
									class="mt-2 button is-link is-outlined has-text-weight-bold is-uppercase"
									on:click={resetLogoToUNP}
								>
									Use UNDP Logo
								</button>
							{/if}
						</div>
					</FieldControl>

					<h6 class="title is-6 section-title">Storymap chapter settings</h6>

					<FieldControl title="Slide card alignment" showHelp={true} showHelpPopup={false}>
						<div slot="help">Change default alignment of storymap slide card</div>
						<div slot="control">
							<SegmentButtons
								size="normal"
								capitalized={true}
								fontWeight="semibold"
								buttons={[
									{ title: 'left', value: 'left', icon: 'fa-solid fa-align-left' },
									{ title: 'center', value: 'center', icon: 'fa-solid fa-align-center' },
									{ title: 'right', value: 'right', icon: 'fa-solid fa-align-right' }
									// { title: 'full', value: 'full', icon: 'fa-solid fa-arrows-left-right-to-line' }
								]}
								bind:selected={userSettings.StorymapChapterCardAlignment}
							/>
							<input
								type="hidden"
								name="StorymapChapterCardAlignment"
								bind:value={userSettings.StorymapChapterCardAlignment}
							/>
						</div>
					</FieldControl>

					<FieldControl
						title="Map navigation control position"
						showHelp={true}
						showHelpPopup={false}
					>
						<div slot="help">
							Change default position of navigation control when map control option for a slide is
							enabled.
						</div>
						<div slot="control" class="select is-fullwidth">
							<select bind:value={userSettings.StorymapChapterNavigationControlPosition}>
								{#each [{ title: 'top-left', value: 'top-left' }, { title: 'top-right', value: 'top-right' }, { title: 'bottom-left', value: 'bottom-left' }, { title: 'bottom-right', value: 'bottom-right' }] as item}
									<option value={item.value}>{item.title}</option>
								{/each}
							</select>
							<input
								type="hidden"
								name="StorymapChapterNavigationControlPosition"
								bind:value={userSettings.StorymapChapterNavigationControlPosition}
							/>
						</div>
					</FieldControl>

					<FieldControl title="Slide transition animation" showHelp={true} showHelpPopup={false}>
						<div slot="help">
							Change default slide transition animation when users scroll into a slide.
						</div>
						<div slot="control">
							<SegmentButtons
								capitalized={true}
								fontWeight="semibold"
								buttons={[
									{ title: 'fly To', value: 'flyTo' },
									// { title: 'easeTo', value: 'easeTo' },
									{ title: 'instant jump', value: 'jumpTo' }
								]}
								bind:selected={userSettings.StorymapChapterTransitionAnimation}
							/>
							<input
								type="hidden"
								name="StorymapChapterTransitionAnimation"
								bind:value={userSettings.StorymapChapterTransitionAnimation}
							/>
						</div>
					</FieldControl>
				</div>

				<div class="buttons">
					<button
						formaction="?/save"
						type="submit"
						class="button is-link is-uppercase has-text-weight-bold {isSubmitting
							? 'is-loading'
							: ''}"
					>
						Apply
					</button>
					<button
						type="button"
						disabled={isSubmitting}
						class="button is-primary is-uppercase has-text-weight-bold"
						on:click={resetToDefault}
					>
						Reset to default
					</button>
				</div>
			</section>
		</div>
	</div>
</form>

<SvelteToast />

<style lang="scss">
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

	.icon-selector {
		display: flex;
		flex-direction: column;
	}

	.section-title {
		padding-top: 2rem;
		margin-bottom: 2rem;
	}

	.sidebar-container {
		display: block;

		@media (min-width: 64em) {
			display: flex;

			.sidebar {
				min-width: 300px;
			}
		}
	}
</style>
