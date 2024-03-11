<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import RasterAlgorithmExplorer, {
		ALGORITHM_TAG_KEY
	} from '$components/maplibre/raster/RasterAlgorithmExplorer.svelte';
	import DatasetPreview from '$components/pages/data/datasets/DatasetPreview.svelte';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import CountryPicker from '$components/util/CountryPicker.svelte';
	import DataProviderPicker from '$components/util/DataProviderPicker.svelte';
	import SdgCard from '$components/util/SdgCard.svelte';
	import SdgPicker from '$components/util/SdgPicker.svelte';
	import Tags from '$components/util/Tags.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { TagInputValues } from '$lib/config/AppConfig';
	import { clean, isRgbRaster } from '$lib/helper';
	import type { Continent, Country, DatasetFeature, Region, Tag } from '$lib/types';
	import {
		Breadcrumbs,
		ModalTemplate,
		Notification,
		SegmentButtons,
		type BreadcrumbPage
	} from '@undp-data/svelte-undp-components';
	import { DefaultLink } from '@undp-data/svelte-undp-design';
	import { toast } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';
	import Time from 'svelte-time';
	import type { PageData } from './$types';

	export let data: PageData;

	const REDIRECRT_TIME = 2000; // two second

	type Tab = 'general' | 'coverage' | 'tags' | 'preview' | 'tools';
	const hash: Tab = $page.url.hash?.replace('#', '') as Tab;

	let tabs: { id: Tab; label: string }[] = [
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
	];
	let activeTab: Tab = hash && tabs.find((t) => t.id === hash) ? hash : 'general';

	let feature: DatasetFeature = data.feature;
	const isNew: boolean = data.isNew ?? true;
	let name = feature?.properties.name ?? '';
	if (isNew) {
		name = clean(feature?.properties.name);
	}
	let description = feature?.properties.description ?? '';
	let license = feature?.properties.license ?? '';
	let tags = '';
	let isRegistering = false;
	let isRgbTile = false;

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'datasets', url: '/data' }
	];
	if (!isNew) {
		breadcrumbs.push({ title: feature.properties.name, url: `/data/${feature.properties.id}` });
	}
	breadcrumbs.push({ title: isNew ? 'publish dataset' : 'update metadata', url: $page.url.href });

	let selectedContinents: Continent[] = [];
	let continentsMaster: Continent[] = data.continents;
	let selectedRegions: Region[] = [];
	let regionsMaster: Region[] = data.regions;

	let isDialogOpen = false;

	const handleContinentSelected = (e) => {
		const selectedItems: { [key: number]: boolean } = e.detail.items;
		const changedValue: number = e.detail.value;
		Object.keys(selectedItems).forEach((key) => {
			const id = parseInt(key);
			const continent = continentsMaster.find((c) => c.continent_code === id);
			if (continent.continent_code === changedValue) {
				continentSelected(continent, false);
			}
		});
	};

	const handleRegionSelected = (e) => {
		const selectedItems: { [key: number]: boolean } = e.detail.items;
		const changedValue: number = e.detail.value;
		Object.keys(selectedItems).forEach((key) => {
			const id = parseInt(key);
			const region = regionsMaster.find((r) => r.region_code === id);

			if (region.region_code === changedValue) {
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
			selectedRegions.splice(selectedRegions.indexOf(r), 1);
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

	const excludedTagForEditing = [
		'type',
		'container',
		'geometry_column',
		'geometrytype',
		'geometry_type',
		'id',
		'id_column',
		'layertype',
		'schema',
		'srid',
		'table'
	];

	const initTags = (
		key: 'provider' | 'sdg_goal' | 'continent' | 'region' | 'country' | 'other'
	) => {
		const _tags: Tag[] = feature?.properties?.tags;
		if (key === 'other') {
			const keys = [
				'provider',
				'sdg_goal',
				'country',
				'region',
				'continent',
				'extent',
				'algorithm',
				...excludedTagForEditing
			];
			return _tags?.filter((t) => !keys.includes(t.key)) ?? [];
		} else {
			let keys: string[] = [key];
			return _tags?.filter((t) => keys.includes(t.key)) ?? [];
		}
	};

	let providers: Tag[] = initTags('provider');
	let sdgs: Tag[] = initTags('sdg_goal');
	let continents: Tag[] = initTags('continent');
	let regions: Tag[] = initTags('region');
	let countries: Tag[] = initTags('country');
	let otherTags: Tag[] = initTags('other');

	let licenses = [
		'Creative Commons Zero 1.0 Universal',
		'Creative Commons BY 4.0',
		'Creative Commons BY ShareAlike 4.0',
		'Creative Commons BY NoDerivs 4.0',
		'Creative Commons BY NonCommercial 4.0',
		'Creative Commons BY NonCommercial ShareAlike 4.0',
		'Creative Commons BY NonCommercial NoDerivs 4.0',
		'GNU Free Documentation License',
		'License not specified',
		'Open Data Commons Attribution License',
		'Open Data Commons Open Database License (ODbL)',
		'Open Data Commons Public Domain Dedication and License (PDDL)',
		'Other (Attribution)',
		'Other (Non-Commercial)',
		'Other (Not Open)',
		'Other (Open)',
		'Other (Public Domain)',
		'UK Open Governement License (OGL)'
	];

	$: sdgs, updateTags();
	$: continents, updateTags();
	$: regions, updateTags();
	$: countries, updateTags();
	$: otherTags, updateTags();
	$: providers, updateTags();

	let extentTag = feature.properties?.tags?.find(
		(t) => t.key === 'extent' && t.value.toLowerCase() === 'global'
	);

	let isGlobal: 'global' | 'regional' = !data.isNew
		? extentTag
			? 'global'
			: 'regional'
		: undefined;

	const updateTags = () => {
		const excludes = [
			'provider',
			'sdg_goal',
			'country',
			'region',
			'continent',
			'algorithm',
			...TagInputValues.map((t) => t.key)
		];
		const originalTags = feature?.properties?.tags?.filter((t) => !excludes.includes(t.key));
		const algoTags = feature?.properties?.tags?.filter((t) => t.key === ALGORITHM_TAG_KEY);

		let joined = sdgs.concat(
			providers,
			continents,
			regions,
			countries,
			otherTags.filter((t) => t.value.length > 0),
			algoTags,
			originalTags
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

	const handleGlobalRegionalChanged = (e) => {
		isGlobal = e.detail.value;
		if (isGlobal === 'global') {
			selectedContinents = [];
			selectedRegions = [];
			continents = [];
			regions = [];
			countries = [];
		}
	};

	const handleCountrySelected = (e) => {
		const _countries: Country[] = e.detail.countries;
		if (_countries.length === 0) {
			countries = [];
			return;
		}

		_countries.forEach((c) => {
			const ct = continentsMaster.find((a) => a.continent_code === c.continent_code);
			const re = regionsMaster.find((a) => a.region_code === c.region_code);
			if (!selectedContinents.includes(ct)) {
				selectedContinents.push(ct);
			}
			if (!selectedRegions.includes(re)) {
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
		_countries.forEach((c) => {
			if (temp.find((x) => x.value === c.country_name)) return;
			temp.push({ key: 'country', value: c.iso_3 });
		});
		countries = temp;
	};

	feature.properties.tags
		.filter((t) => t.key === 'continent')
		?.forEach((f) => {
			let continent = continentsMaster.find((c) => c.continent_name === f.value);
			continentSelected(continent, true);
		});
	feature.properties.tags
		.filter((t) => t.key === 'region')
		?.forEach((f) => {
			let region = regionsMaster.find((c) => c.region_name === f.value);
			regionSelected(region);
		});

	const redirectToDatasetPage = () => {
		goto(`/data/${feature.properties.id}`);
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
		const rasterTile = new RasterTileData(feature);
		const rasterInfo = await rasterTile.getMetadata();
		isRgbTile = isRgbRaster(rasterInfo.colorinterp);
	};

	onMount(async () => {
		if (feature.properties.is_raster) {
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
</script>

<div class="has-background-light px-6 pt-4">
	<div class="py-4"><Breadcrumbs pages={breadcrumbs} /></div>

	<p class="title is-3 mt-6 mb-5 is-uppercase">{breadcrumbs[breadcrumbs.length - 1].title}</p>

	{#if !data.isNew}
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
				{@const isTagsFilled = sdgs.length > 0 || otherTags.length > 0}
				{@const isAlgoSelected =
					feature.properties.tags?.filter((t) => t.key === ALGORITHM_TAG_KEY)?.length > 0}
				<li class={activeTab === tab.id ? 'is-active is-primary' : ''}>
					<a
						href="#{tab.id}"
						on:click={() => {
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

<div class="mx-6 my-4">
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
					feature = result.data;
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
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Dataset name</label>
				<div class="control has-icons-right">
					<input
						class="input {name.length > 0 ? 'is-success' : 'is-danger'}"
						type="text"
						name="name"
						placeholder="Type name of dataset"
						disabled={isRegistering}
						bind:value={name}
					/>
					{#if name}
						<span class="icon is-small is-right">
							<i class="fas fa-check has-text-success" />
						</span>
					{/if}
				</div>
				<p class="help is-dark">Name the dataset shortly and precisely.</p>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Description</label>
				<div class="control has-icons-right">
					<textarea
						class="textarea {description.length > 0 ? 'is-success' : 'is-danger'} description"
						name="description"
						placeholder="Type description of dataset"
						disabled={isRegistering}
						bind:value={description}
					/>
					{#if description}
						<span class="icon is-small is-right">
							<i class="fas fa-check has-text-success" />
						</span>
					{/if}
				</div>
				<p class="help is-dark">
					Describe the dataset briefly. This information will be shown in data catalog.
				</p>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">License</label>
				<div class="control has-icons-right">
					<div class="select is-fullwidth {license.length > 0 ? 'is-success' : 'is-danger'}">
						<select bind:value={license} disabled={isRegistering} name="license">
							<option value="">Select a data license</option>
							{#each licenses as lc}
								<option value={lc}>{lc}</option>
							{/each}
						</select>
					</div>
					{#if license}
						<span class="icon is-small is-right">
							<i class="fas fa-check has-text-success" />
						</span>
					{/if}
				</div>
				<p class="help is-dark">
					Open data license definition can be found at
					<DefaultLink href="https://opendefinition.org/licenses/" target="_blank" title="here" />
				</p>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Data providers</label>
				<div class="control">
					<DataProviderPicker bind:tags={providers} />
				</div>
				<p class="help is-dark">Select at least a data provider for the dataset.</p>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Please select data accessibility.</label>
				<div class="control">
					<AccessLevelSwitcher bind:accessLevel={feature.properties.access_level} />
				</div>
				<p class="help is-dark">
					If you are ready to publish as open data, select <b>Public</b>. If you selected your
					organisation or your name, the data can only be accessed by authenticated users.
				</p>
			</div>
		</div>

		<!-- coverage tab -->
		<div hidden={activeTab !== 'coverage'}>
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Is your data global or regional?</label>
				<div class="control">
					<SegmentButtons
						buttons={[
							{ title: 'Global', icon: 'fas fa-globe', value: 'global' },
							{ title: 'Regional', icon: 'fas fa-earth-africa', value: 'regional' }
						]}
						bind:selected={isGlobal}
						on:change={handleGlobalRegionalChanged}
					/>
				</div>
			</div>

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

				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">Please select a continent for your data.</label>
					<div class="control">
						{#key selectedContinents}
							<SegmentButtons
								{buttons}
								selectedItems={getSelectedContinent()}
								multiSelect={true}
								on:change={handleContinentSelected}
								wrap={true}
							/>
						{/key}
					</div>
				</div>

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

					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Please select a region for your data.</label>
						<div class="control">
							{#key selectedRegions}
								<SegmentButtons
									{buttons}
									selectedItems={getSelectedRegion()}
									multiSelect={true}
									on:change={handleRegionSelected}
									wrap={true}
								/>
							{/key}
						</div>
					</div>
				{/if}
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">Please select countries</label>
					<div class="control">
						<CountryPicker
							on:change={handleCountrySelected}
							bind:tags={countries}
							bind:selectedContinents
							bind:selectedRegions
							showSelectedCountries={true}
						/>
					</div>
				</div>
			{/if}
		</div>

		<!-- Tools tab -->
		{#if feature.properties.is_raster && !isRgbTile}
			<div hidden={activeTab !== 'tools'}>
				<RasterAlgorithmExplorer
					bind:feature
					on:selected={updateTags}
					title="Register tools to the dataset"
					cardDescription="Register this tool"
					mode="select"
				/>
			</div>
		{/if}

		<!-- Tags tab -->
		<div hidden={activeTab !== 'tags'}>
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">SDGs (Optional)</label>
				<div class="control">
					<SdgPicker bind:tags={sdgs} />

					<div class="mt-2 is-flex is-flex-direction-row is-flex-wrap-wrap">
						{#each sdgs as sdg}
							<SdgCard sdg={Number(sdg.value)} isSelectable={false} />
						{/each}
					</div>
				</div>
				<p class="help is-dark">
					Select relevant SDG goals which the dataset is related to. Learn more about SDGs by
					<DefaultLink
						href="https://www.undp.org/sustainable-development-goals"
						target="_blank"
						title="clicking here"
					/>
				</p>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Tags (Optional)</label>
				<div class="control">
					<Tags bind:tags={otherTags} />
				</div>
				<p class="help is-dark">
					Select relevant tags which the dataset is related to. These tags will be helpful for users
					to search data.
				</p>
			</div>
		</div>

		<!-- Preview tab -->
		<div hidden={activeTab !== 'preview'}>
			<DatasetPreview bind:feature showButtons={false} />
		</div>

		<input class="input" type="hidden" name="feature" value={JSON.stringify(feature)} />

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
	<div slot="content">
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
	<div class="buttons" slot="buttons">
		<button
			class="button is-link is-uppercase has-text-weight-bold"
			on:click={redirectToDatasetPage}
		>
			Go to Dataset
		</button>
		<a
			class="button is-primary is-uppercase has-text-weight-bold"
			href="/data/{feature.properties.id}/style/edit"
		>
			Set default appearance
		</a>
	</div>
</ModalTemplate>

<style lang="scss">
	.description {
		resize: none;
		height: 100px;
	}
</style>
