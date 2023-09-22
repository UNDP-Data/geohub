<script lang="ts">
	import { enhance } from '$app/forms';
	import { afterNavigate, goto, invalidateAll } from '$app/navigation';
	import { base } from '$app/paths';
	import AccessLevelSwitcher from '$components/AccessLevelSwitcher.svelte';
	import CountryPicker from '$components/data-upload/CountryPicker.svelte';
	import DataPreview from '$components/data-upload/DataPreview.svelte';
	import DataProviderPicker from '$components/data-upload/DataProviderPicker.svelte';
	import SdgPicker from '$components/data-upload/SdgPicker.svelte';
	import Tags from '$components/data-upload/Tags.svelte';
	import { TagInputValues } from '$lib/config/AppConfig';
	import type { Continent, Country, DatasetFeature, Region, Tag } from '$lib/types';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { toast } from '@zerodevx/svelte-toast';
	import Time from 'svelte-time';
	import type { PageData } from './$types';

	export let data: PageData;

	// preserve previous page URL
	let previousPage: string = base;
	afterNavigate(({ from }) => {
		if (from?.url) {
			previousPage = `${from?.url.pathname}${from?.url.search}`;
		}
	});
	const REDIRECRT_TIME = 2000; // two second

	let feature: DatasetFeature = data.feature;
	const isNew: boolean = data.isNew ?? true;
	let name = feature?.properties.name ?? '';
	let description = feature?.properties.description ?? '';
	let license = feature?.properties.license ?? '';
	let tags = '';
	let isRegistering = false;

	let selectedContinents: Continent[] = [];
	let continentsMaster: Continent[] = [];
	let selectedRegions: Region[] = [];
	let regionsMaster: Region[] = [];

	const init = () => {
		data.promises.continents
			.then((cts) => {
				continentsMaster = cts;
				let filters = feature.properties.tags.filter((t) => t.key === 'continent');
				filters?.forEach((f) => {
					let continent = cts.find((c) => c.continent_name === f.value);
					continentSelected(continent, true);
				});
				return data.promises.regions;
			})
			.then((rs) => {
				regionsMaster = rs;
				let filters = feature.properties.tags.filter((t) => t.key === 'region');
				filters?.forEach((f) => {
					let region = rs.find((c) => c.region_name === f.value);
					regionSelected(region);
				});
			});
	};

	init();

	const continentSelected = (c: Continent, isInit = false) => {
		if (selectedContinents.includes(c)) {
			const rs = selectedRegions.filter((r) => r.continent_code === c.continent_code);
			for (const r of rs) {
				regionSelected(r);
			}
			selectedContinents.splice(selectedContinents.indexOf(c), 1);
		} else {
			if (!selectedContinents.find((c) => c.continent_code === c.continent_code)) {
				selectedContinents.push(c);
			}
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
		if (selectedRegions.includes(r)) {
			selectedRegions.splice(selectedRegions.indexOf(r), 1);
		} else {
			if (!selectedRegions.find((c) => c.region_code === r.region_code)) {
				selectedRegions.push(r);
			}
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
			...TagInputValues.map((t) => t.key)
		];
		const originalTags = feature?.properties?.tags?.filter((t) => !excludes.includes(t.key));

		let joined = sdgs.concat(
			providers,
			continents,
			regions,
			countries,
			otherTags.filter((t) => t.value.length > 0),
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

	const handleGlobalRegionalChanged = (type: 'global' | 'regional') => {
		isGlobal = type;
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
</script>

<div class="m-4 py-5">
	<p class="title is-4">{isNew ? 'Publish' : 'Update'} metadata of the dataset</p>
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
					if (previousPage) {
						setTimeout(() => {
							goto(previousPage, {
								replaceState: true
							});
						}, REDIRECRT_TIME);

						toast.push(
							'Dataset was registered successfully. It is going back to the previous page.',
							{
								duration: REDIRECRT_TIME
							}
						);
					} else {
						toast.push('Dataset was registered successfully. ');
						await invalidateAll();
						feature = data.feature;

						init();
					}
				} else {
					toast.push(result.data);
				}
				isRegistering = false;
			};
		}}
	>
		<div class="field is-grouped py-2">
			<div class="control">
				<button
					class="button is-primary {isRegistering ? 'is-loading' : ''}"
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
					<span class="icon">
						<i class="fa-solid fa-cloud-arrow-up" />
					</span>
					<span> {isNew ? 'Publish' : 'Update'}</span>
				</button>

				<DataPreview
					size="is-normal"
					bind:feature
					url={feature.properties.url.replace('pmtiles://', '')}
				/>
			</div>
		</div>

		{#if !data.isNew}
			<div class="pb-4">
				<p>
					This dataset was initially created by <b>{feature.properties.updated_user}</b> at
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

		<div class="columns">
			<div class="column is-6">
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
						Open data license definition can be found at<a
							href="https://opendefinition.org/licenses/"
							target="_blank">https://opendefinition.org</a
						>.
					</p>
				</div>
			</div>
			<div class="column is-6">
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
					<label class="label">SDGs (Optional)</label>
					<div class="control">
						<SdgPicker bind:tags={sdgs} />
					</div>
					<p class="help is-dark">
						Select relevant SDG goals which the dataset is related to. Learn more about SDGs <a
							href="https://www.undp.org/sustainable-development-goals"
							target="_blank">here</a
						>
					</p>
				</div>
			</div>
		</div>

		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Please select data accessibility.</label>
			<div class="control">
				<AccessLevelSwitcher bind:accessLevel={feature.properties.access_level} />
			</div>
		</div>

		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Is your data global or regional?</label>
			<div class="control">
				<div class="field has-addons">
					<p class="control">
						<button
							type="button"
							class="button {isGlobal === 'global'
								? 'is-primary is-active'
								: 'is-primary is-light'}"
							on:click={() => handleGlobalRegionalChanged('global')}
						>
							<span class="icon is-small">
								<i class="fas fa-globe" />
							</span>
							<span>Global</span>
						</button>
					</p>
					<p class="control">
						<button
							type="button"
							class="button {isGlobal === 'regional'
								? 'is-primary is-active'
								: 'is-primary is-light'}"
							on:click={() => handleGlobalRegionalChanged('regional')}
						>
							<span class="icon is-small">
								<i class="fas fa-earth-africa" />
							</span>
							<span>Regional</span>
						</button>
					</p>
				</div>
			</div>
		</div>

		{#if isGlobal === 'regional'}
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Please select a continent for your data.</label>
				<div class="control">
					{#await data.promises.continents}
						<Loader size="small" />
					{:then continents}
						<div class="field has-addons is-flex is-flex-wrap-wrap">
							{#each continents as continent}
								<p class="control pt-1">
									<button
										type="button"
										class="button {selectedContinents.find(
											(c) => c.continent_code === continent.continent_code
										)
											? 'is-primary is-active'
											: 'is-primary is-light'}"
										on:click={() => continentSelected(continent)}
									>
										<span class="icon is-small">
											<i
												class="fa-solid {continent.continent_name === 'Antarctica'
													? 'fa-globe'
													: `fa-earth-${continent.continent_name.toLowerCase()}`}"
											/>
										</span>
										<span>{continent.continent_name}</span>
									</button>
								</p>
							{/each}
						</div>
					{/await}
				</div>
			</div>

			{#if isGlobal === 'regional' && selectedContinents.length > 0}
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">Please select a region for your data.</label>
					<div class="control">
						{#await data.promises.regions}
							<Loader size="small" />
						{:then regions}
							<div class="field has-addons is-flex is-flex-wrap-wrap">
								{#each regions as region}
									{#if selectedContinents.filter((c) => c.continent_code === region.continent_code).length > 0}
										<p class="control pt-1">
											<button
												type="button"
												class="button {selectedRegions.find(
													(r) => r.region_code === region.region_code
												)
													? 'is-primary is-active'
													: 'is-primary is-light'}"
												on:click={() => regionSelected(region)}
											>
												<span>{region.region_name}</span>
											</button>
										</p>
									{/if}
								{/each}
							</div>
						{/await}
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
					/>
				</div>
			</div>
		{/if}

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

		<div class="field is-grouped py-2">
			<div class="control">
				<button
					class="button is-primary {isRegistering ? 'is-loading' : ''}"
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
					type="submit">{isNew ? 'Publish' : 'Update'}</button
				>
			</div>
		</div>

		<input class="input" type="hidden" name="feature" value={JSON.stringify(feature)} />

		<input class="input" type="hidden" name="tags" bind:value={tags} />
	</form>
</div>

<style lang="scss">
	.description {
		resize: none;
		height: 100px;
	}
</style>
