<script lang="ts">
	import { enhance } from '$app/forms';
	import { afterNavigate, invalidateAll } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import IconImagePickerCard from '$components/controls/vector-styles/IconImagePickerCard.svelte';
	import {
		ClassificationMethods,
		DatasetSortingColumns,
		FontJsonUrl,
		IconOverlapPriority,
		LimitOptions,
		MapSortingColumns,
		MapStyles,
		NumberOfClassesMaximum,
		NumberOfClassesMinimum,
		RasterResamplingMethods
	} from '$lib/config/AppConfig';
	import { LineTypes } from '$lib/config/AppConfig/LineTypes';
	import { DefaultUserConfig, type UserConfig } from '$lib/config/DefaultUserConfig';
	import { getSpriteImageList, initTippy } from '$lib/helper';
	import { clean } from '$lib/helper/index.js';
	import type { SidebarPosition } from '$lib/types';
	import { spriteImageList } from '$stores';
	import { Radios } from '@undp-data/svelte-undp-design';
	import { toast } from '@zerodevx/svelte-toast';
	import type { StyleSpecification } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import RangeSlider from 'svelte-range-slider-pips';
	import FieldControl from './controls/FieldControl.svelte';

	// preserve previous page URL
	let previousPage: string = base;
	afterNavigate(({ from }) => {
		if (from?.url) {
			previousPage = `${from?.url.pathname}${from?.url.search}`;
		}
	});

	const tippy = initTippy();
	let userSettings: UserConfig = $page.data.config;
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

	$: iconImageSrc = $spriteImageList.find((i) => i.alt === selectedIcon)?.src;
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
			title: 'Map',
			hash: 'map',
			icon: 'fa-solid fa-map',
			subSettings: [
				{ title: 'Layout', hash: 'layout' },
				{ title: 'Legend', hash: 'legend' },
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
		selectedIcon = userSettings.IconImage;
		toast.push('Settings were reset. Please click apply button to save them.');
	};

	const backToPreviousPage = () => {
		window.location.href = previousPage;
	};

	onMount(() => {
		getSpriteImage();
	});

	const getSpriteImage = async () => {
		const style = MapStyles[0];
		const res = await fetch(style.uri);
		const json: StyleSpecification = await res.json();
		const spriteUrl = json.sprite as string;
		const iconList = await getSpriteImageList(spriteUrl);
		spriteImageList.update(() => iconList);
	};

	const getFonts = async () => {
		const res = await fetch(FontJsonUrl);
		const json: string[] = await res.json();
		return json;
	};
</script>

<div class="columns is-one-quarter ml-auto mr-auto settings-page">
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
	<div class="column is-three-fifths m-auto">
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
			{#if previousPage}
				<button
					type="button"
					disabled={isSubmitting}
					class="button is-link"
					on:click={backToPreviousPage}
				>
					Back to previous page
				</button>
			{/if}

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
			</section>

			<hr />

			<!-- map page settings -->
			<section class="section anchor" id={settingTabs[2].hash}>
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
									<option value={classificationMethod.value}>{classificationMethod.label}</option>
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
				<FieldControl title="Icon Symbol" class="icon-selector">
					<div slot="help">Pick the default icon symbol for symbol layers</div>
					<div slot="control">
						{#if $spriteImageList?.length > 0}
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
												type="image"
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
									{#each $spriteImageList as image}
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
						class="button is-link"
						on:click={resetToDefault}
					>
						Reset to default
					</button>
					<button
						formaction="?/save"
						type="submit"
						class="button is-primary {isSubmitting ? 'is-loading' : ''}"
					>
						Apply
					</button>
				</div>
			</div>
		</form>
	</div>
</div>

<style lang="scss">
	// .content {
	// 	padding: 1rem;
	// }
	// .content.is-hidden:not(:first-of-type) {
	// 	display: none;
	// }

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

	// adjust anchor position agains header heght
	.anchor {
		padding-top: 93.44px;
		margin-top: -93.44px;

		@media (max-width: 48em) {
			padding-top: 60.94;
			margin-top: -60.94px;
		}
	}
</style>
