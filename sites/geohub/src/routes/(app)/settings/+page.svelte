<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import IconImagePickerCard from '$components/maplibre/symbol/IconImagePickerCard.svelte';
	import Breadcrumbs, { type BreadcrumbPage } from '$components/util/Breadcrumbs.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import Help from '$components/util/Help.svelte';
	import {
		ClassificationMethods,
		DatasetSortingColumns,
		FontJsonUrl,
		IconOverlapPriority,
		IngestingDatasetSortingColumns,
		LimitOptions,
		MapSortingColumns,
		MapStyles,
		NumberOfClassesMaximum,
		NumberOfClassesMinimum,
		RasterResamplingMethods,
		StacDateFilterOptions,
		StacSearchLimitOptions
	} from '$lib/config/AppConfig';
	import { LineTypes } from '$lib/config/AppConfig/LineTypes';
	import { DefaultUserConfig, type UserConfig } from '$lib/config/DefaultUserConfig';
	import { getSpriteImageList, initTippy } from '$lib/helper';
	import { clean } from '$lib/helper/index.js';
	import type { SpriteImage } from '$lib/types';
	import type { SidebarPosition } from '@undp-data/svelte-sidebar';
	import { Checkbox, Radios } from '@undp-data/svelte-undp-design';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import type { StyleSpecification } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import RangeSlider from 'svelte-range-slider-pips';
	import type { PageData } from './$types';

	export let data: PageData;

	const tippy = initTippy();
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

	let settingTabs = [
		{
			title: 'Home',
			hash: 'home',
			icon: 'fa-solid fa-home'
		},
		{
			title: 'Data',
			hash: 'data',
			icon: 'fa-solid fa-server'
		},
		{
			title: 'Satellite',
			hash: 'satellite',
			icon: 'fa-solid fa-satellite'
		},
		{
			title: 'Map',
			hash: 'map',
			icon: 'fa-solid fa-map',
			subSettings: [
				{ title: 'Layout', hash: 'layout' },
				{ title: 'Legend', hash: 'legend' },
				{ title: '3D Polygon', hash: 'fill-extrusion' },
				{ title: 'Line', hash: 'line' },
				{ title: 'Point', hash: 'point' },
				// { title: 'Polygon', hash: 'polygon' },
				{ title: 'Raster', hash: 'raster' },
				{ title: 'Label', hash: 'label' }
			]
		}
	];
	const hash = $page.url.hash;
	let activeTab = settingTabs[0].subSettings ? settingTabs[0].subSettings[0] : settingTabs[0];

	if (hash) {
		let tab = settingTabs.find((t) => `#${t.hash}` === hash);
		if (tab) {
			activeTab = tab;
		}
	}
	let activeSettingTab = activeTab.title;

	const DatasetLimitOptions = LimitOptions.includes(DefaultUserConfig.DatasetSearchLimit)
		? LimitOptions
		: [...LimitOptions, DefaultUserConfig.DatasetSearchLimit].sort((a, b) => a - b);

	const DataPageLimitOptions = LimitOptions.includes(DefaultUserConfig.DataPageSearchLimit)
		? LimitOptions
		: [...LimitOptions, DefaultUserConfig.DataPageSearchLimit].sort((a, b) => a - b);

	const MapPageLimitOptions = LimitOptions.includes(DefaultUserConfig.MapPageSearchLimit)
		? LimitOptions
		: [...LimitOptions, DefaultUserConfig.MapPageSearchLimit].sort((a, b) => a - b);

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
		toast.push('Settings were reset. Please click apply button to save them.');
	};

	onMount(() => {
		getSpriteImage();
	});

	const getSpriteImage = async () => {
		const style = MapStyles[0];
		const res = await fetch(style.uri);
		const json: StyleSpecification = await res.json();
		const spriteUrl = json.sprite as string;
		spriteImageList = await getSpriteImageList(spriteUrl);
	};

	const getFonts = async () => {
		const res = await fetch(FontJsonUrl);
		const json: string[] = await res.json();
		return json;
	};

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'Settings', url: $page.url.href }
	];
</script>

<div class="has-background-light px-6 py-4">
	<div class="py-4"><Breadcrumbs pages={breadcrumbs} /></div>

	<p class="title is-3 mt-6 mb-5 is-uppercase">{breadcrumbs[breadcrumbs.length - 1].title}</p>
</div>

<div class="columns is-one-quarter mx-6 my-4">
	<div class="column is-2">
		<aside class="menu">
			<p class="menu-label">Settings</p>
			<ul class="menu-list">
				{#each settingTabs as tab}
					{#if tab.subSettings}
						<li>
							<a
								class={activeSettingTab === tab.title ? 'is-active' : ''}
								href="#{tab.hash}"
								on:click={() => {
									activeSettingTab = tab.title;
								}}
							>
								<span class="icon">
									<i
										class="{tab.icon} {activeSettingTab === tab.title
											? 'has-text-white'
											: 'has-text-link'}"
									/>
								</span>
								{tab.title}
							</a>
							<ul>
								{#each tab.subSettings as subSetting}
									<li>
										<a
											class={activeSettingTab === subSetting.title ? 'is-active' : ''}
											on:click={() => {
												activeSettingTab = subSetting.title;
											}}
											href="#{subSetting.hash}"
										>
											{subSetting.title}
										</a>
									</li>
								{/each}
							</ul>
						</li>
					{:else}
						<li>
							<a
								class={activeSettingTab === tab.title ? 'is-active' : ''}
								on:click={() => {
									activeSettingTab = tab.title;
								}}
								href="#{tab.hash}"
							>
								<span class="icon">
									<i
										class="{tab.icon} {activeSettingTab === tab.title
											? 'has-text-white'
											: 'has-text-link'}"
									/>
								</span>
								{tab.title}
							</a>
						</li>
					{/if}
				{/each}
			</ul>
		</aside>
	</div>
	<div class="column">
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
			<!-- main page settings -->
			<section class="section anchor" id={settingTabs[0].hash}>
				<h1 class="title">Home page settings</h1>

				<h2 class="subtitle">Search Settings</h2>

				<FieldControl title="Default search Limit">
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

				<FieldControl title="Default sort setting">
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
			</section>

			<hr />

			<!-- data page settings -->
			<section class="section anchor" id={settingTabs[1].hash}>
				<h1 class="title">Data page settings</h1>

				<h2 class="subtitle">Search Settings</h2>

				<FieldControl title="Default dataset table view">
					<div slot="help">
						Change the default dataset table view type either card view or list view or map view
					</div>
					<div slot="control">
						<div class="field has-addons">
							<p class="control">
								<button
									type="button"
									class="button {userSettings.DataPageTableViewType === 'card' ? 'is-link' : ''}"
									on:click={() => (userSettings.DataPageTableViewType = 'card')}
								>
									<span class="icon is-small">
										<i class="fa-solid fa-border-all fa-lg"></i>
									</span>
									<span>Card</span>
								</button>
							</p>
							<p class="control">
								<button
									type="button"
									class="button {userSettings.DataPageTableViewType === 'list' ? 'is-link' : ''}"
									on:click={() => (userSettings.DataPageTableViewType = 'list')}
								>
									<span class="icon is-small">
										<i class="fa-solid fa-list"></i>
									</span>
									<span>List</span>
								</button>
							</p>
							<p class="control">
								<button
									type="button"
									class="button {userSettings.DataPageTableViewType === 'map' ? 'is-link' : ''}"
									on:click={() => (userSettings.DataPageTableViewType = 'map')}
								>
									<span class="icon is-small">
										<i class="fa-solid fa-map"></i>
									</span>
									<span>Map</span>
								</button>
							</p>
						</div>
						<input
							type="hidden"
							name="DataPageTableViewType"
							bind:value={userSettings.DataPageTableViewType}
						/>
					</div>
				</FieldControl>

				<FieldControl title="Default search Limit">
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
				<FieldControl title="Default search query operator">
					<div slot="help">
						Change searching operator to either 'AND' or 'OR'. 'AND' enables you to search datasets
						which exactly match all keyword. 'OR' allows you to search wider range of results by
						matching at least a word.
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
				<FieldControl title="Defaut tag search operator">
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
				<FieldControl title="Default sort setting">
					<div slot="help">Change sort setting for the search result on datasets.</div>
					<div slot="control">
						<div class="select is-fullwidth">
							<select name="DataPageSortingColumn" bind:value={userSettings.DataPageSortingColumn}>
								{#each DatasetSortingColumns as column}
									<option value={column.value}>{column.label}</option>
								{/each}
							</select>
						</div>
					</div>
				</FieldControl>

				<FieldControl title="Default sorting column setting for my data">
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

				<FieldControl title="Default sorting order setting for my data">
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
				<div class="is-flex mt-5 help">
					<Checkbox
						on:clicked={() =>
							(userSettings.DataPageIngestingJoinVectorTiles =
								!userSettings.DataPageIngestingJoinVectorTiles)}
						checked={!userSettings.DataPageIngestingJoinVectorTiles}
						label="Every layer (Point, Line, Polygon) into its own file"
					/>
					<Help>
						Most of GIS data formats can hold more than one vector layer. The option below, if
						checked will result in extracting each layer a different dataset (own metadata, name and
						other properties). The alternative is to join all layers into one multi-layer dataset
						where layers are hidden inside and not discoverable directly.
					</Help>
					<input
						type="hidden"
						name="DataPageIngestingJoinVectorTiles"
						bind:value={userSettings.DataPageIngestingJoinVectorTiles}
					/>
				</div>
			</section>
			<hr />
			<!-- satellite search prefrerence settings -->
			<section class="section anchor" id={settingTabs[2].hash}>
				<h1 class="title">Satellite (STAC) data search settings</h1>

				<FieldControl title="Default search Limit">
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

				<FieldControl title="Default max cloud cover rate">
					<div slot="help">
						The default percentage of max cloud cover rate to search satellite imagery. If you
						increase it, more images can be hit, but cloud on the image will also be increased.
					</div>
					<div slot="control">
						<div class="control">
							<RangeSlider
								bind:values={stacMaxCloudCover}
								float
								min={0}
								max={100}
								step={1}
								pips
								springValues={{
									stiffness: 1,
									damping: 1
								}}
								first="label"
								last="label"
								rest={false}
								suffix="%"
							/>
							<input type="hidden" name="StacMaxCloudCover" bind:value={stacMaxCloudCover} />
						</div>
					</div>
				</FieldControl>

				<FieldControl title="Default search preference by date">
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
			</section>

			<hr />

			<!-- map page settings -->
			<section class="section anchor" id={settingTabs[3].hash}>
				<h1 class="title">Map page settings</h1>

				<h2 class="subtitle anchor" id="layout">Layout Settings</h2>

				<FieldControl title="Default base map">
					<div slot="help">Select a default base map style</div>
					<div slot="control">
						<div class="columns is-mobile">
							{#each MapStyles as style}
								<label class="column">
									<input
										on:select={() => defaultMapStyle === style.title}
										type="radio"
										name="DefaultMapStyle"
										value={style.title}
										checked={defaultMapStyle === style.title}
									/>
									<img
										class="sidebar-image"
										src="/assets/basemap/{style.title.toLowerCase().replace(/ /g, '')}.png"
										alt="{style.title} style"
										loading="lazy"
									/>
								</label>
							{/each}
						</div>
					</div>
				</FieldControl>

				<FieldControl title="Sidebar Position">
					<div slot="help">Select sidebar position of main GeoHub page.</div>
					<div slot="control">
						<div class="columns is-mobile">
							{#each ['left', 'right'] as pos}
								<label class="column">
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

				<h2 class="subtitle pt-4">Search Settings</h2>
				<FieldControl title="Default search Limit">
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

				<FieldControl title="Default search query operator">
					<div slot="help">
						Change searching operator to either 'AND' or 'OR'. 'AND' enables you to search datasets
						which exactly match all keyword. 'OR' allows you to search wider range of results by
						matching at least a word.
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

				<FieldControl title="Default sort setting">
					<div slot="help">Change sort setting for the search result on datasets.</div>
					<div slot="control">
						<div class="select is-fullwidth">
							<div class="select is-fullwidth">
								<select name="DatasetSortingColumn" bind:value={userSettings.DatasetSortingColumn}>
									{#each DatasetSortingColumns as column}
										<option value={column.value}>{column.label}</option>
									{/each}
								</select>
							</div>
						</div>
					</div>
				</FieldControl>

				<FieldControl title="Defaut tag search operator">
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

				<hr />

				<h2 class="subtitle anchor" id="legend">Legend Settings</h2>
				<FieldControl title="Default Classification Method">
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
				<FieldControl title="Default number of classes">
					<div slot="help">
						Change the default number of classes in classify legend for vector layer and raster
						layer
					</div>
					<div slot="control">
						<div class="control">
							<RangeSlider
								bind:values={numberOfClasses}
								float
								min={NumberOfClassesMinimum}
								max={NumberOfClassesMaximum}
								step={1}
								pips
								springValues={{
									stiffness: 1,
									damping: 1
								}}
								first="label"
								last="label"
								rest={false}
							/>
							<input type="hidden" name="NumberOfClasses" bind:value={numberOfClasses[0]} />
						</div>
					</div>
				</FieldControl>
				<FieldControl title="Default Layer Opacity">
					<div slot="help">Change Default Layer Opacity</div>
					<div slot="control">
						<RangeSlider
							bind:values={layerOpacity}
							float
							min={0}
							max={100}
							step={1}
							pips
							first="label"
							last="label"
							springValues={{
								stiffness: 1,
								damping: 1
							}}
							suffix="%"
							rest={false}
						/>
						<input type="hidden" bind:value={layerOpacity[0]} name="LayerOpacity" />
					</div>
				</FieldControl>

				<hr />

				<h2 class="subtitle anchor" id="fill-extrusion">3D Polygon Visualization Settings</h2>

				<FieldControl title="Default pitch">
					<div slot="help">
						The default pitch will be used when you add polygon data as 3D Polygon layer type. It
						will automatically be tilted by the deault pitch setting.
					</div>
					<div slot="control">
						<div class="control">
							<RangeSlider
								bind:values={fillExtrusionDefaultPitch}
								float
								min={0}
								max={85}
								step={1}
								pips
								springValues={{
									stiffness: 1,
									damping: 1
								}}
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

				<hr />

				<h2 class="subtitle anchor" id="line">Line Visualization Settings</h2>
				<FieldControl title="Default line width">
					<div slot="help">
						The default line width in <b>line</b> vector layer legend tab.
					</div>
					<div slot="control">
						<div class="control">
							<RangeSlider
								bind:values={lineWidth}
								float
								min={0}
								max={10}
								step={0.5}
								pips
								springValues={{
									stiffness: 1,
									damping: 1
								}}
								first="label"
								last="label"
								rest={false}
							/>
							<input type="hidden" name="LineWidth" bind:value={lineWidth[0]} />
						</div>
					</div>
				</FieldControl>
				<FieldControl title="Default line pattern">
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

				<hr />

				<h2 class="subtitle anchor" id="point">Point Visualization Settings</h2>
				<FieldControl title="Icon Symbol">
					<div slot="help">Pick the default icon symbol for symbol layers</div>
					<div slot="control">
						{#if spriteImageList?.length > 0}
							<div
								style="cursor: pointer"
								use:tippy={{ content: tooltipContent }}
								class="card"
								data-testid="icon-image-picker-card-container"
							>
								<div class="card-content">
									<div class="media is-flex is-justify-content-center">
										<figure class={`image is-24x24`} data-testid="icon-figure">
											<img
												data-testid="icon-image"
												src={iconImageSrc}
												alt={clean(selectedIcon)}
												title={clean(selectedIcon)}
												style="width:24px; height:24px; color: white;"
											/>
										</figure>
									</div>
									<div class="content is-size-7 columns is-gapless" style="padding-top: 5px;">
										<div
											class="column is-flex is-justify-content-center sprite-image-title"
											title={selectedIcon}
										>
											{clean(selectedIcon)}
										</div>
									</div>
								</div>
							</div>
							<div
								style="max-height: 400px; overflow-y: auto; overflow-x: hidden; max-width: fit-content"
								class="tooltip"
								data-testid="tooltip"
								bind:this={tooltipContent}
							>
								<div class="columns m-2 is-multiline is-justify-content-space-evenly">
									{#each spriteImageList as image}
										<IconImagePickerCard
											on:iconSelected={(e) => (selectedIcon = e.detail.iconImageAlt)}
											iconImageAlt={image.alt}
											iconImageSrc={image.src}
											withinForm={true}
											isSelected={selectedIcon === image.alt ? true : false}
										/>
									{/each}
								</div>
							</div>
							<input type="hidden" value={selectedIcon} name="IconImage" />
						{/if}
					</div>
				</FieldControl>
				<FieldControl title="Icon Overlap Priority">
					<div slot="help">
						Change Icon Overlap priority. When <b>Never</b> is selected, the icon will be hidden if
						it collides with any other previously drawn symbol. When <b>Always</b> is selected, the
						icon will be visible even if it collides with any other previously drawn symbol. When
						<b>Cooperative</b> is selected, If the icon collides with another previously drawn symbol,
						the overlap mode for that symbol is checked. If the previous symbol was placed using never
						overlap mode, the new icon is hidden. If the previous symbol was placed using always or cooperative
						overlap mode, the new icon is visible.
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
				<FieldControl title="Icon Size">
					<div slot="help">Change icon size for symbol layers</div>
					<div slot="control">
						<RangeSlider
							bind:values={iconSize}
							float
							min={0}
							max={5}
							step={0.1}
							pips
							first="label"
							last="label"
							springValues={{
								stiffness: 1,
								damping: 1
							}}
							rest={false}
						/>
						<input type="hidden" bind:value={iconSize[0]} name="IconSize" />
					</div>
				</FieldControl>

				<!--      <section class="content {activeSettingTab !== 'Polygon' ? 'is-hidden' : ''}" style="height:400px">-->
				<!--        <p class="title is-4">Polygon Visualization Settings</p>-->
				<!--        <FieldControl title="Default polygon fill color">-->
				<!--          <div slot="help">Change default polygon fill color</div>-->
				<!--          <div slot="control">-->
				<!--            <div class="field has-addons">-->
				<!--              <div class="control is-expanded">-->
				<!--                <input-->
				<!--                  type="color"-->
				<!--                  class="input"-->
				<!--                  name="PolygonFillColor"-->
				<!--                  bind:value={userSettings.PolygonFillColor}-->
				<!--                  data-testid="polygon-fill-color-input" />-->
				<!--              </div>-->
				<!--              <div class="control">-->
				<!--                <div class="button is-static">-->
				<!--                  <i class="fas fa-palette" />-->
				<!--                </div>-->
				<!--              </div>-->
				<!--            </div>-->
				<!--          </div>-->
				<!--        </FieldControl>-->
				<!--      </section>-->

				<hr />

				<h2 class="subtitle anchor" id="raster">Raster Visualization Settings</h2>
				<FieldControl title="Default raster resampling method">
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

				<hr />

				<h2 class="subtitle anchor" id="label">Label Settings</h2>

				{#await getFonts() then fonts}
					<FieldControl title="Default label font">
						<div slot="help">Change default label font</div>
						<div slot="control">
							<div class="select is-fullwidth">
								<select name="LabelTextFont" bind:value={userSettings.LabelTextFont}>
									{#each fonts as font}
										<option value={font}>{font}</option>
									{/each}
								</select>
							</div>
						</div>
					</FieldControl>
				{/await}

				<FieldControl title="Default label font size">
					<div slot="help">Change default label font size</div>
					<div slot="control">
						<RangeSlider
							bind:values={labelFontSize}
							float
							min={0}
							max={32}
							step={0.5}
							pips
							first="label"
							last="label"
							springValues={{
								stiffness: 1,
								damping: 1
							}}
							rest={false}
						/>
						<input type="hidden" bind:value={labelFontSize[0]} name="LabelFontSize" />
					</div>
				</FieldControl>

				<FieldControl title="Default label halo width">
					<div slot="help">Change default halo size for labels.</div>
					<div slot="control">
						<RangeSlider
							bind:values={labelHaloWidth}
							float
							min={0}
							max={10}
							step={0.1}
							pips
							first="label"
							last="label"
							springValues={{
								stiffness: 1,
								damping: 1
							}}
							rest={false}
						/>
						<input type="hidden" bind:value={labelHaloWidth[0]} name="LabelHaloWidth" />
					</div>
				</FieldControl>
			</section>

			<div class="field is-grouped is-grouped-centered">
				<div class="control">
					<button
						type="button"
						disabled={isSubmitting}
						class="button is-link is-uppercase has-text-weight-bold"
						on:click={resetToDefault}
					>
						Reset to default
					</button>
					<button
						formaction="?/save"
						type="submit"
						class="button is-primary is-uppercase has-text-weight-bold {isSubmitting
							? 'is-loading'
							: ''}"
					>
						Apply
					</button>
				</div>
			</div>
		</form>
	</div>
</div>

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

	// adjust anchor position against header heght
	.anchor {
		padding-top: 93.44px;
		margin-top: -93.44px;

		@media (max-width: 48em) {
			padding-top: 60.94;
			margin-top: -60.94px;
		}
	}
</style>
