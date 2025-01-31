<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import DatasetPreview from '$components/pages/data/datasets/DatasetPreview.svelte';
	import RasterAlgorithmExplorer, {
		ALGORITHM_TAG_KEY
	} from '$components/pages/map/data/RasterAlgorithmExplorer.svelte';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { isRgbRaster } from '$lib/helper';
	import type { Continent, Country, License, Region } from '$lib/types';
	import {
		Breadcrumbs,
		CountrySelector,
		FieldControl,
		ModalTemplate,
		Notification,
		SdgSelector,
		SegmentButtons,
		TagSelector,
		clean,
		type BreadcrumbPage,
		type Tag
	} from '@undp-data/svelte-undp-components';
	import { Chips, DefaultLink } from '@undp-data/svelte-undp-design';
	import { toast } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';
	import Time from 'svelte-time';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const REDIRECRT_TIME = 2000; // two second

	type Tab = 'general' | 'coverage' | 'tags' | 'preview' | 'tools';
	const hash: Tab = page.url.hash?.replace('#', '') as Tab;

	let tabs: { id: Tab; label: string }[] = $state([
		{
			id: 'general',
			label: 'General'
		},
		{
			id: 'coverage',
			label: 'Coverage'
		},
		{
			id: 'tags',
			label: 'Tags'
		},
		{
			id: 'preview',
			label: 'Preview'
		}
	]);
	const getActiveTab = () => {
		return hash && tabs.find((t) => t.id === hash) ? hash : 'general';
	};
	let activeTab: Tab = $state(getActiveTab());

	const isNew: boolean = data.isNew ?? true;

	let name = $state(data.feature?.properties.name ?? '');
	if (isNew) {
		name = clean(data.feature?.properties.name as string);
	}
	let description = $state(data.feature?.properties.description ?? '');
	let license = $state(data.feature?.properties.license ?? '');
	let accessLevel = $state(data.feature.properties.access_level);
	let tags = $state('');
	let isRegistering = $state(false);
	let isRgbTile = $state(false);

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'datasets', url: '/data' }
	];
	if (!isNew) {
		breadcrumbs.push({
			title: data.feature.properties.name as string,
			url: `/data/${data.feature.properties.id}`
		});
	}
	breadcrumbs.push({ title: isNew ? 'publish dataset' : 'update metadata', url: page.url.href });

	let selectedContinents: Continent[] = $state([]);
	let continentsMaster: Continent[] = data.continents;
	let selectedRegions: Region[] = $state([]);
	let regionsMaster: Region[] = data.regions;

	let isDialogOpen = $state(false);

	const handleContinentSelected = (
		value: string | number,
		items?: { [key: string]: boolean; [key: number]: boolean }
	) => {
		if (!items) return;
		const changedValue: number = value as number;
		Object.keys(items).forEach((key) => {
			const id = parseInt(key);
			const continent = continentsMaster.find((c) => c.continent_code === id);
			if (continent?.continent_code === changedValue) {
				continentSelected(continent, false);
			}
		});
	};

	const handleRegionSelected = (
		value: string | number,
		items?: { [key: string]: boolean; [key: number]: boolean }
	) => {
		if (!items) return;
		const changedValue: number = value as number;
		Object.keys(items).forEach((key) => {
			const id = parseInt(key);
			const region = regionsMaster.find((r) => r.region_code === id);

			if (region?.region_code === changedValue) {
				regionSelected(region);
			}
		});
	};

	const continentSelected = (c: Continent, isInit = false) => {
		if (selectedContinents.find((x) => x.continent_code === c.continent_code)) {
			const rs = selectedRegions.filter((r) => r.continent_code === c.continent_code);
			for (const r of rs) {
				regionSelected(r);
			}
			selectedContinents.splice(selectedContinents.indexOf(c), 1);
		} else {
			selectedContinents.push(c);
			if (!isInit) {
				regionsMaster
					.filter((r) => r.continent_code === c.continent_code)
					?.forEach((r) => {
						regionSelected(r);
					});
			}
		}
		selectedContinents = [...selectedContinents];
		if (selectedContinents.length === 0) {
			continents = [];
			selectedRegions = [];
		} else {
			continents = selectedContinents.map((c) => {
				return {
					key: 'continent',
					value: c.continent_name
				};
			});
		}
	};

	const regionSelected = (r: Region) => {
		if (selectedRegions.find((x) => x.region_code === r.region_code)) {
			const index = selectedRegions.findIndex((x) => x.region_code === r.region_code);
			selectedRegions.splice(index, 1);
		} else {
			selectedRegions.push(r);
		}
		selectedRegions = [...selectedRegions];
		if (selectedRegions.length === 0) {
			regions = [];
		} else {
			regions = selectedRegions.map((r) => {
				return {
					key: 'region',
					value: r.region_name
				};
			});
		}
	};

	const initTags = (
		key:
			| 'provider'
			| 'sdg_goal'
			| 'continent'
			| 'region'
			| 'country'
			| 'year'
			| 'resolution'
			| 'unit'
			| 'granularity'
			| 'theme'
			| 'sdg_target',
		createEmptyTag = false
	) => {
		const _tags: Tag[] = data.feature?.properties?.tags as Tag[];

		const filtered = _tags?.filter((t) => t.key === key) ?? [];
		if (createEmptyTag && filtered.length === 0) {
			filtered.push({
				key: key,
				value: ''
			});
		}
		return filtered;
	};

	let providers: Tag[] = $state(initTags('provider'));
	let sdgs: Tag[] = $state(initTags('sdg_goal'));
	let continents: Tag[] = $state(initTags('continent'));
	let regions: Tag[] = $state(initTags('region'));
	let countries: Tag[] = $state(initTags('country'));
	let years: Tag[] = $state(initTags('year', false));
	let resolutions: Tag[] = $state(initTags('resolution', false));
	let units: Tag[] = $state(initTags('unit', false));
	let granularities: Tag[] = $state(initTags('granularity', false));
	let themes: Tag[] = $state(initTags('theme', false));
	let sdg_targets: Tag[] = $state(initTags('sdg_target', false));

	let licenses: License[] = $state([]);

	let extentTag = data.feature.properties?.tags?.find(
		(t) => t.key === 'extent' && t.value.toLowerCase() === 'global'
	);

	let isGlobal: 'global' | 'regional' | undefined = $state(
		!data.isNew ? (extentTag ? 'global' : 'regional') : undefined
	);

	const updateTags = () => {
		const excludes = [
			'provider',
			'sdg_goal',
			'country',
			'region',
			'continent',
			'year',
			'resolution',
			'unit',
			'granularity',
			'theme',
			'sdg_target',
			'algorithm'
		];
		const originalTags = data.feature?.properties?.tags?.filter((t) => !excludes.includes(t.key));
		const algoTags = data.feature?.properties?.tags?.filter((t) => t.key === ALGORITHM_TAG_KEY);

		let joined = sdgs.concat(
			providers,
			continents,
			regions,
			countries,
			years.filter((t) => t.value.trim().length > 0),
			resolutions.filter((t) => t.value.trim().length > 0),
			units.filter((t) => t.value.trim().length > 0),
			granularities.filter((t) => t.value.trim().length > 0),
			themes.filter((t) => t.value.trim().length > 0),
			sdg_targets.filter((t) => t.value.trim().length > 0),
			algoTags as Tag[],
			originalTags as Tag[]
		);
		if (isGlobal === 'global') {
			if (!joined?.find((t) => t.key === 'extent' && t.value === 'Global')) {
				joined = [
					...joined,
					{
						key: 'extent',
						value: 'Global'
					}
				];
			}
		} else {
			const index = joined.findIndex((t) => {
				return t.key === 'extent' && t.value === 'Global';
			});
			if (index > -1) {
				joined.splice(index, 1);
			}
		}
		tags = JSON.stringify(joined);
	};

	const getSdgNumbers = () => {
		return sdgs.map((s) => parseInt(s.value as string));
	};

	const handleSdgSelected = (values: number[]) => {
		sdgs = [
			...values.map((v: number) => {
				return {
					key: 'sdg_goal',
					value: v.toString()
				};
			})
		];
	};

	const handleGlobalRegionalChanged = (value: string | number) => {
		isGlobal = value as 'global' | 'regional';
		if (isGlobal === 'global') {
			selectedContinents = [];
			selectedRegions = [];
			continents = [];
			regions = [];
			countries = [];
		}
	};

	const handleCountrySelected = (selected: Country[]) => {
		if (selected.length === 0) {
			countries = [];
			return;
		}

		selected.forEach((c) => {
			const ct = continentsMaster.find((a) => a.continent_code === c.continent_code);
			const re = regionsMaster.find((a) => a.region_code === c.region_code);
			if (ct && !selectedContinents.find((c) => c.continent_code === ct.continent_code)) {
				selectedContinents.push(ct);
			}
			if (re && !selectedRegions.find((r) => r.region_code === re.region_code)) {
				selectedRegions.push(re);
			}
		});
		selectedContinents = [...selectedContinents];
		selectedRegions = [...selectedRegions];

		selectedContinents?.forEach((c) => {
			if (continents.find((x) => x.value === c.continent_name)) return;
			continents.push({ key: 'continent', value: c.continent_name });
		});
		continents = [...continents];

		selectedRegions?.forEach((c) => {
			if (regions.find((x) => x.value === c.region_name)) return;
			regions.push({ key: 'region', value: c.region_name });
		});
		regions = [...regions];

		const temp: Tag[] = [];
		selected.forEach((c) => {
			if (temp.find((x) => x.value === c.country_name)) return;
			temp.push({ key: 'country', value: c.iso_3 });
		});
		countries = temp;
	};

	data.feature.properties.tags
		?.filter((t) => t.key === 'continent')
		?.forEach((f) => {
			let continent = continentsMaster.find((c) => c.continent_name === f.value);
			continentSelected(continent, true);
		});
	data.feature.properties.tags
		?.filter((t) => t.key === 'region')
		?.forEach((f) => {
			let region = regionsMaster.find((c) => c.region_name === f.value);
			regionSelected(region);
		});

	const redirectToDatasetPage = () => {
		goto(`/data/${data.feature.properties.id}`);
	};

	const getSelectedContinent = () => {
		const selectedItems: { [key: number]: boolean } = {};
		selectedContinents.forEach((c) => {
			selectedItems[c.continent_code] = true;
		});
		return selectedItems;
	};

	const getSelectedRegion = () => {
		const selectedItems: { [key: number]: boolean } = {};
		selectedRegions.forEach((r) => {
			selectedItems[r.region_code] = true;
		});
		return selectedItems;
	};

	const checkRgbTile = async () => {
		const rasterTile = new RasterTileData(data.feature);
		const rasterInfo = await rasterTile.getMetadata();
		isRgbTile = isRgbRaster(rasterInfo?.colorinterp as string[]);
	};

	const getLicenses = async () => {
		const res = await fetch('/api/licenses');
		licenses = await res.json();
	};

	const selectedCountryCodes = () => {
		return countries.map((c) => c.value as string);
	};
	const getSelectedContinentCodes = () => {
		return selectedContinents.map((c) => c.continent_code);
	};
	const getSelectedRegionCodes = () => {
		return selectedRegions.map((c) => c.region_code);
	};

	onMount(async () => {
		await getLicenses();
		if (data.feature.properties.is_raster) {
			await checkRgbTile();
			if (!isRgbTile) {
				const tabIndex = tabs.findIndex((t) => t.id === `tags`);
				tabs.splice(tabIndex, 0, {
					id: `tools`,
					label: 'tools'
				});
				tabs = [...tabs];
			}
		}
	});
	$effect(() => {
		updateTags();
	});
</script>

<div class="has-background-light px-6 pt-4">
	<div class="py-4"><Breadcrumbs pages={breadcrumbs} /></div>

	<p class="title is-3 mt-6 mb-5 is-uppercase">{breadcrumbs[breadcrumbs.length - 1].title}</p>

	{#if !data.isNew}
		{@const feature = data.feature}
		<div class="pb-4">
			<p>
				This dataset was initially created by <b>{feature.properties.created_user}</b> at
				<b>
					<Time timestamp={feature.properties.createdat} format="h:mm A, MMMM D, YYYY" />
				</b>
			</p>
			<p>
				This dataset was lastly updated by <b>{feature.properties.updated_user}</b> at
				<b>
					<Time timestamp={feature.properties.updatedat} format="h:mm A, MMMM D, YYYY" />
				</b>
			</p>
		</div>
	{/if}

	<div class="tabs is-uppercase has-text-weight-bold">
		<ul>
			{#each tabs as tab}
				{@const isGeneralInfoFilled = name && license && description && providers.length > 0}
				{@const isCoverageFilled =
					isGlobal === 'global' ||
					(isGlobal === 'regional' &&
						(selectedContinents.length > 0 || selectedRegions.length > 0 || countries.length > 0))}
				{@const isTagsFilled =
					sdgs.length > 0 ||
					units.filter((t) => t.value !== '').length > 0 ||
					years.filter((t) => t.value !== '').length > 0 ||
					resolutions.filter((t) => t.value !== '').length > 0 ||
					granularities.filter((t) => t.value !== '').length > 0 ||
					themes.filter((t) => t.value !== '').length > 0 ||
					sdg_targets.filter((t) => t.value !== '').length > 0}
				{@const isAlgoSelected =
					data.feature.properties.tags &&
					data.feature.properties.tags?.filter((t) => t.key === ALGORITHM_TAG_KEY)?.length > 0}
				<li class={activeTab === tab.id ? 'is-active is-primary' : ''}>
					<a
						href="#{tab.id}"
						onclick={() => {
							activeTab = tab.id;
						}}
					>
						{tab.label}
						{#if tab.id === 'general'}
							{#if isGeneralInfoFilled}
								<span class="icon has-text-success">
									<span class="fa-stack fa-2xs">
										<i class="fa-solid fa-circle fa-stack-2x"></i>
										<i class="fa-solid fa-check fa-stack-1x fa-inverse"></i>
									</span>
								</span>
							{/if}
						{:else if tab.id === 'coverage'}
							{#if isCoverageFilled}
								<span class="icon has-text-success">
									<span class="fa-stack fa-2xs">
										<i class="fa-solid fa-circle fa-stack-2x"></i>
										<i class="fa-solid fa-check fa-stack-1x fa-inverse"></i>
									</span>
								</span>
							{/if}
						{:else if tab.id === 'tags'}
							{#if isTagsFilled}
								<span class="icon has-text-success">
									<span class="fa-stack fa-2xs">
										<i class="fa-solid fa-circle fa-stack-2x"></i>
										<i class="fa-solid fa-check fa-stack-1x fa-inverse"></i>
									</span>
								</span>
							{/if}
						{:else if tab.id === 'tools'}
							{#if isAlgoSelected}
								<span class="icon has-text-success">
									<span class="fa-stack fa-2xs">
										<i class="fa-solid fa-circle fa-stack-2x"></i>
										<i class="fa-solid fa-check fa-stack-1x fa-inverse"></i>
									</span>
								</span>
							{/if}
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</div>

<div class="m-6">
	<form
		method="POST"
		action="?/publish"
		use:enhance={({ cancel }) => {
			if (isRegistering) {
				cancel();
			}
			isRegistering = true;

			return async ({ result }) => {
				if (result.status === 200) {
					data.feature = result.data;
					if (isNew) {
						isDialogOpen = true;
					} else {
						toast.push(
							'Dataset was registered successfully. It is redirecting to the dataset page.',
							{
								duration: REDIRECRT_TIME
							}
						);
						setTimeout(() => {
							redirectToDatasetPage();
						}, REDIRECRT_TIME);
					}
				} else {
					toast.push(result.data);
				}
				isRegistering = false;
			};
		}}
	>
		<!-- General tab -->
		<div hidden={activeTab !== 'general'}>
			<FieldControl
				title="Dataset name"
				fontWeight="bold"
				isFirstCharCapitalized={false}
				showHelpPopup={false}
			>
				{#snippet control()}
					<div>
						<input
							class="input {name.length > 0 ? 'is-success' : 'is-danger'}"
							type="text"
							name="name"
							placeholder="Type name of dataset"
							disabled={isRegistering}
							bind:value={name}
						/>
					</div>
				{/snippet}
				{#snippet help()}
					<div>Name the dataset shortly and precisely.</div>
				{/snippet}
			</FieldControl>

			<FieldControl
				title="Description"
				fontWeight="bold"
				isFirstCharCapitalized={false}
				showHelpPopup={false}
			>
				{#snippet control()}
					<div>
						<textarea
							class="textarea {description.length > 0 ? 'is-success' : 'is-danger'} description"
							name="description"
							placeholder="Type description of dataset"
							disabled={isRegistering}
							bind:value={description}
						></textarea>
					</div>
				{/snippet}
				{#snippet help()}
					<div>Describe the dataset briefly. This information will be shown in data catalog.</div>
				{/snippet}
			</FieldControl>

			<FieldControl
				title="License"
				fontWeight="bold"
				isFirstCharCapitalized={false}
				showHelpPopup={false}
			>
				{#snippet control()}
					<div>
						<div class="select is-fullwidth {license.length > 0 ? 'is-success' : 'is-danger'}">
							<select bind:value={license} disabled={isRegistering} name="license">
								<option value="">Select a data license</option>
								{#each licenses as lc}
									<option value={lc.name}>{lc.name}</option>
								{/each}
							</select>
						</div>
					</div>
				{/snippet}
				{#snippet help()}
					<div>
						Open data license definition can be found at
						<DefaultLink href="https://opendefinition.org/licenses/" target="_blank" title="here" />
					</div>
				{/snippet}
			</FieldControl>

			<FieldControl
				title="Data providers"
				fontWeight="bold"
				isFirstCharCapitalized={false}
				showHelpPopup={false}
			>
				{#snippet control()}
					<div>
						<div class="flex is-flex-wrap-wrap pb-2">
							{#each providers as provider}
								<span class="pl-1">
									<Chips
										label={provider.value}
										showDelete={true}
										ondelete={() => {
											providers = providers.filter((t) => t.value !== provider.value);
										}}
									/>
								</span>
							{/each}
						</div>
						{#if browser}
							<TagSelector
								bind:selected={providers}
								type="multi"
								key="provider"
								newTagMode={true}
								showSelectedTags={false}
							/>
						{/if}
					</div>
				{/snippet}
				{#snippet help()}
					<div>Select at least a data provider for the dataset.</div>
				{/snippet}
			</FieldControl>

			<FieldControl
				title="Please select data accessibility."
				fontWeight="bold"
				isFirstCharCapitalized={false}
				showHelpPopup={false}
			>
				{#snippet control()}
					<div>
						<AccessLevelSwitcher bind:accessLevel />
						<input type="hidden" bind:value={accessLevel} name="accessLevel" />
					</div>
				{/snippet}
				{#snippet help()}
					<div>
						If you are ready to publish as open data, select <b>Public</b>. If you selected your
						organisation or your name, the data can only be accessed by authenticated users.
					</div>
				{/snippet}
			</FieldControl>
		</div>

		<!-- coverage tab -->
		<div hidden={activeTab !== 'coverage'}>
			<FieldControl
				title="Is your data global or regional?"
				fontWeight="bold"
				isFirstCharCapitalized={false}
				showHelp={false}
			>
				{#snippet control()}
					<div>
						<SegmentButtons
							buttons={[
								{ title: 'Global', icon: 'fas fa-globe', value: 'global' },
								{ title: 'Regional', icon: 'fas fa-earth-africa', value: 'regional' }
							]}
							bind:selected={isGlobal}
							onchange={handleGlobalRegionalChanged}
						/>
					</div>
				{/snippet}
			</FieldControl>

			{#if isGlobal === 'regional'}
				{@const buttons = continentsMaster.map((continent) => {
					return {
						title: continent.continent_name,
						icon:
							continent.continent_name === 'Antarctica'
								? 'fas fa-globe'
								: `fas fa-earth-${continent.continent_name.toLowerCase()}`,
						value: continent.continent_code
					};
				})}

				<FieldControl
					title="Please select a continent for your data."
					fontWeight="bold"
					isFirstCharCapitalized={false}
					showHelp={false}
				>
					{#snippet control()}
						<div>
							{#key selectedContinents}
								<SegmentButtons
									{buttons}
									selectedItems={getSelectedContinent()}
									multiSelect={true}
									onchange={handleContinentSelected}
									wrap={true}
								/>
							{/key}
						</div>
					{/snippet}
				</FieldControl>

				{#if isGlobal === 'regional' && selectedContinents.length > 0}
					{@const buttons = regionsMaster
						.filter(
							(region) =>
								selectedContinents.filter((c) => c.continent_code === region.continent_code)
									.length > 0
						)
						.map((r) => {
							return {
								title: r.region_name,
								value: r.region_code
							};
						})}

					<FieldControl
						title="Please select a region for your data."
						fontWeight="bold"
						isFirstCharCapitalized={false}
						showHelp={false}
					>
						{#snippet control()}
							<div>
								{#key selectedRegions}
									<SegmentButtons
										{buttons}
										selectedItems={getSelectedRegion()}
										multiSelect={true}
										onchange={handleRegionSelected}
										wrap={true}
									/>
								{/key}
							</div>
						{/snippet}
					</FieldControl>
				{/if}

				<FieldControl
					title="Please select countries"
					fontWeight="bold"
					isFirstCharCapitalized={false}
					showHelp={false}
				>
					{#snippet control()}
						<div>
							<div class="flex is-flex-wrap-wrap pb-2">
								{#each countries as country}
									<span class="pl-1">
										<Chips
											label={country.value}
											showDelete={true}
											ondelete={() => {
												countries = countries.filter((t) => t.value !== country.value);
											}}
										/>
									</span>
								{/each}
							</div>
							<div style="max-width: 350px;">
								{#key selectedContinents}
									{#key selectedRegions}
										{#key countries}
											{#if browser}
												<CountrySelector
													selected={selectedCountryCodes()}
													continents={getSelectedContinentCodes()}
													regions={getSelectedRegionCodes()}
													onselect={handleCountrySelected}
													showSelectedCountries={false}
												/>
											{/if}
										{/key}
									{/key}
								{/key}
							</div>
						</div>
					{/snippet}
				</FieldControl>
			{/if}
		</div>

		<!-- Tools tab -->
		{#if data.feature.properties.is_raster && !isRgbTile}
			<div hidden={activeTab !== 'tools'}>
				<RasterAlgorithmExplorer
					bind:feature={data.feature}
					onSelected={updateTags}
					title="Register tools to the dataset"
					cardDescription="Register this tool"
					mode="select"
				/>
			</div>
		{/if}

		<!-- Tags tab -->
		<div hidden={activeTab !== 'tags'}>
			<FieldControl
				title="SDGs (Optional)"
				fontWeight="bold"
				isFirstCharCapitalized={false}
				showHelpPopup={false}
			>
				{#snippet control()}
					<div>
						{#if browser}
							<SdgSelector selected={getSdgNumbers()} onselect={handleSdgSelected} />
						{/if}
					</div>
				{/snippet}
				{#snippet help()}
					<div>
						Select relevant SDG goals which the dataset is related to. Learn more about SDGs by
						<DefaultLink
							href="https://www.undp.org/sustainable-development-goals"
							target="_blank"
							title="clicking here"
						/>
					</div>
				{/snippet}
			</FieldControl>

			<FieldControl
				title="Unit (Optional)"
				fontWeight="bold"
				isFirstCharCapitalized={false}
				showHelpPopup={false}
			>
				{#snippet control()}
					<div>
						<div class="flex is-flex-wrap-wrap pb-2">
							{#each units as unit}
								<span class="pl-1">
									<Chips
										label={unit.value}
										showDelete={true}
										ondelete={() => {
											units = units.filter((t) => t.value !== unit.value);
										}}
									/>
								</span>
							{/each}
						</div>
						{#if browser}
							<TagSelector
								bind:selected={units}
								type="single"
								key="unit"
								newTagMode={true}
								showSelectedTags={false}
							/>
						{/if}
					</div>
				{/snippet}
				{#snippet help()}
					<div>
						Please provide unit information if applicable. It will be useful for other users to use
						your data. You can also search existing year tag values from the search button.
					</div>
				{/snippet}
			</FieldControl>

			<FieldControl
				title="Year (Optional)"
				fontWeight="bold"
				isFirstCharCapitalized={false}
				showHelpPopup={false}
			>
				{#snippet control()}
					<div>
						<div class="flex is-flex-wrap-wrap pb-2">
							{#each years as year}
								<span class="pl-1">
									<Chips
										label={year.value}
										showDelete={true}
										ondelete={() => {
											years = years.filter((t) => t.value !== year.value);
										}}
									/>
								</span>
							{/each}
						</div>
						{#if browser}
							<TagSelector
								bind:selected={years}
								type="multi"
								key="year"
								newTagMode={true}
								showSelectedTags={false}
							/>
						{/if}
					</div>
				{/snippet}
				{#snippet help()}
					<div>
						Please provide year information if applicable. It will be useful for other users to use
						your data. You can also search existing year tag values from the search button.
					</div>
				{/snippet}
			</FieldControl>

			<FieldControl
				title="Resolution (Optional)"
				fontWeight="bold"
				isFirstCharCapitalized={false}
				showHelpPopup={false}
			>
				{#snippet control()}
					<div>
						<div class="flex is-flex-wrap-wrap pb-2">
							{#each resolutions as resolution}
								<span class="pl-1">
									<Chips
										label={resolution.value}
										showDelete={true}
										ondelete={() => {
											resolutions = resolutions.filter((t) => t.value !== resolution.value);
										}}
									/>
								</span>
							{/each}
						</div>
						{#if browser}
							<TagSelector
								bind:selected={resolutions}
								type="single"
								key="resolution"
								newTagMode={true}
								showSelectedTags={false}
							/>
						{/if}
					</div>
				{/snippet}
				{#snippet help()}
					<div>
						Please provide data resolution if applicable. It will be useful for other users to use
						your data. Search existing resolution value from search button. Or you may find the
						resolution in the document provided by data producers.
					</div>
				{/snippet}
			</FieldControl>

			<FieldControl
				title="Administrative level (Optional)"
				fontWeight="bold"
				isFirstCharCapitalized={false}
				showHelpPopup={false}
			>
				{#snippet control()}
					<div>
						<div class="flex is-flex-wrap-wrap pb-2">
							{#each granularities as granularity}
								<span class="pl-1">
									<Chips
										label={granularity.value}
										showDelete={true}
										ondelete={() => {
											granularities = granularities.filter((t) => t.value !== granularity.value);
										}}
									/>
								</span>
							{/each}
						</div>
						{#if browser}
							<TagSelector
								bind:selected={granularities}
								type="single"
								key="granularity"
								newTagMode={true}
								showSelectedTags={false}
							/>
						{/if}
					</div>
				{/snippet}
				{#snippet help()}
					<div>
						Please provide administrative level of the data either national or subnational or other
						if applicable.
					</div>
				{/snippet}
			</FieldControl>

			<FieldControl
				title="Theme (Optional)"
				fontWeight="bold"
				isFirstCharCapitalized={false}
				showHelpPopup={false}
			>
				{#snippet control()}
					<div>
						<div class="flex is-flex-wrap-wrap pb-2">
							{#each themes as theme}
								<span class="pl-1">
									<Chips
										label={theme.value}
										showDelete={true}
										ondelete={() => {
											themes = themes.filter((t) => t.value !== theme.value);
										}}
									/>
								</span>
							{/each}
						</div>
						{#if browser}
							<TagSelector
								bind:selected={themes}
								type="multi"
								key="theme"
								newTagMode={true}
								showSelectedTags={false}
							/>
						{/if}
					</div>
				{/snippet}
				{#snippet help()}
					<div>Please select any theme keywords if applicable.</div>
				{/snippet}
			</FieldControl>

			<FieldControl
				title="SDG related keywords (Optional)"
				fontWeight="bold"
				isFirstCharCapitalized={false}
				showHelpPopup={false}
			>
				{#snippet control()}
					<div>
						<div class="flex is-flex-wrap-wrap pb-2">
							{#each sdg_targets as sdg_target}
								<span class="pl-1">
									<Chips
										label={sdg_target.value}
										showDelete={true}
										ondelete={() => {
											sdg_targets = sdg_targets.filter((t) => t.value !== sdg_target.value);
										}}
									/>
								</span>
							{/each}
						</div>
						{#if browser}
							<TagSelector
								bind:selected={sdg_targets}
								type="multi"
								key="sdg_target"
								newTagMode={true}
								showSelectedTags={false}
							/>
						{/if}
					</div>
				{/snippet}
				{#snippet help()}
					<div>Please select any SDG related keywords if applicable.</div>
				{/snippet}
			</FieldControl>
		</div>

		<!-- Preview tab -->
		<div hidden={activeTab !== 'preview'}>
			<DatasetPreview bind:feature={data.feature} showButtons={false} />
		</div>

		<input class="input" type="hidden" name="feature" value={JSON.stringify(data.feature)} />

		<input class="input" type="hidden" name="tags" bind:value={tags} />

		<div class="field is-grouped py-2 mt-4">
			<div class="control">
				<button
					class="button is-primary is-uppercase has-text-weight-bold {isRegistering
						? 'is-loading'
						: ''}"
					disabled={!(
						name &&
						license &&
						description &&
						providers.length > 0 &&
						(isGlobal === 'global' ||
							(isGlobal === 'regional' &&
								(selectedContinents.length > 0 ||
									selectedRegions.length > 0 ||
									countries.length > 0)))
					)}
					type="submit"
				>
					{isNew ? 'Publish' : 'Update'}
				</button>
			</div>
		</div>
	</form>
</div>

<ModalTemplate title="Successfully published!" bind:show={isDialogOpen} showClose={false}>
	{#snippet content()}
		<div>
			<Notification type="info" showCloseButton={false}>
				One more thing you can do about the dataset appearance.
			</Notification>
			<br />
			If you would like to continue editing how the dataset will be appeared in a map as default, please
			click <b>Set default appearance</b>.

			<br />
			Click <b>Go to Dataset</b> if you would like to do configuration afterwards. You can configure
			the dataset apperance from the dropdown menu of <b>Set default layer style</b>.
		</div>
	{/snippet}
	{#snippet buttons()}
		<div class="buttons">
			<button
				class="button is-link is-uppercase has-text-weight-bold"
				onclick={redirectToDatasetPage}
			>
				Go to Dataset
			</button>
			<a
				class="button is-primary is-uppercase has-text-weight-bold"
				href="/data/{data.feature.properties.id}/style/edit"
			>
				Set default appearance
			</a>
		</div>
	{/snippet}
</ModalTemplate>

<style lang="scss">
	.description {
		resize: none;
		height: 100px;
	}
</style>
