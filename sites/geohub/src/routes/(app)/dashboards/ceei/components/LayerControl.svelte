<script lang="ts">
	import {
		ColorMapPicker,
		ModalTemplate,
		handleEnterKey,
		initTippy,
		initTooltipTippy
	} from '@undp-data/svelte-undp-components';
	import { Button, Loader, TextInput } from '@undp-data/svelte-undp-design';

	import { MAPSTORE_CONTEXT_KEY, Slider, type MapStore } from '@undp-data/svelte-undp-components';
	import chroma from 'chroma-js';
	import { getContext } from 'svelte';
	import { get } from 'svelte/store';
	import { layers as layersStore, type Layer } from '../stores';
	import {
		applyDataSimulation,
		deleteLayer,
		downloadData,
		duplicateLayer,
		editLayerName,
		updatePaintOfLayer,
		uploadData
	} from '../utils/layerHelper';

	const mapStore: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerDetails: Layer;
		index: number;
	}

	let { layerDetails = $bindable(), index = $bindable() }: Props = $props();

	let showCustomizeDataModal = $state(false);
	let showSimulateModal = $state(false);
	let showEditLayerNameModal = $state(false);
	let showEditColorScaleModel = $state(false);

	let editLayerNameValue = $state(layerDetails.name);
	let groupCount = 10;
	let colorMapName = $state('rdylbu');

	const getColorGroups = () => {
		const isReverse = layerDetails.colorMap.indexOf('_r') !== -1;
		const colors = chroma.scale(layerDetails.colorMap.replace('_r', '')).colors(groupCount);
		if (isReverse) colors.reverse();
		return colors;
	};
	let colorGroups = $state(getColorGroups());

	const openSimulateModal = () => {
		if (layerDetails.sliders) {
			sliders = [...layerDetails.sliders];
		} else {
			sliders = [...defaultSliders];
		}

		showSimulateModal = true;
	};

	const closeSimulateModal = () => {
		showSimulateModal = false;
	};

	const openEditLayerNameModal = () => {
		showEditLayerNameModal = true;
	};

	const closeEditLayerNameModal = () => {
		showEditLayerNameModal = false;
	};

	const openEditColorScaleModel = () => {
		showEditColorScaleModel = true;
	};

	const closeEditColorScaleModel = () => {
		showEditColorScaleModel = false;
	};

	const tippy = initTippy();
	let tooltipContent: HTMLElement;

	const tippyTooltip = initTooltipTippy();

	const defaultSliders: {
		id: number;
		percentage: number;
		label: string;
		locked: boolean;
	}[] = [
		{ id: 1, percentage: 7.1429, label: 'Solar Power Potential', locked: false },
		{ id: 2, percentage: 7.1429, label: 'Wind Speed', locked: false },
		{ id: 3, percentage: 7.1429, label: 'Geothermal Power Potential', locked: false },
		{ id: 4, percentage: 7.1429, label: 'Hydro Power Potential', locked: false },
		{ id: 5, percentage: 7.1429, label: 'Jobs in Renewable Energy Sector', locked: false },
		{ id: 6, percentage: 7.1429, label: 'Education Index', locked: false },
		{ id: 7, percentage: 7.1429, label: 'Access to electricity', locked: false },
		{
			id: 8,
			percentage: 7.1429,
			label: 'Public and foreign (aid) investments on renewable energy',
			locked: false
		},
		{
			id: 9,
			percentage: 7.1429,
			label: 'Households with access to loans from commercial banks',
			locked: false
		},
		{ id: 10, percentage: 7.1429, label: 'Relative Wealth Index', locked: false },
		{ id: 11, percentage: 7.1429, label: 'Grid Density', locked: false },
		{ id: 12, percentage: 7.1429, label: 'GHG Emissions', locked: false },
		{ id: 13, percentage: 7.1429, label: 'Net Electricity Imports', locked: false },
		{
			id: 14,
			percentage: 7.1429,
			label: 'Fossil Fuel Share on Energy Capacity and Generation',
			locked: false
		}
	];

	let sliders = $state(defaultSliders);

	let pillarSliders = $state([
		{ id: 1, percentage: 28.57, label: 'Potential', locked: false },
		{ id: 2, percentage: 50, label: 'Means and Resources', locked: false },
		{ id: 3, percentage: 21.43, label: 'Urgent', locked: false }
	]);

	const pillarTotal = (ids) => {
		let total = 0;
		sliders.forEach((slider) => {
			if (ids.includes(slider.id)) {
				total += slider.percentage;
			}
		});
		return total;
	};

	const calculatePillarTotal = () => {
		pillarSliders[0].percentage = pillarTotal([1, 2, 3, 4]);
		pillarSliders[1].percentage = pillarTotal([5, 6, 7, 8, 9, 10, 11]);
		pillarSliders[2].percentage = pillarTotal([12, 13, 14]);
		pillarSliders = [...pillarSliders];
	};

	const distributePillarValueToIndicators = () => {
		pillarSliders.forEach((pillarSlider) => {
			let indicatorIds = [];
			if (pillarSlider.id === 1) {
				indicatorIds = [1, 2, 3, 4];
			} else if (pillarSlider.id === 2) {
				indicatorIds = [5, 6, 7, 8, 9, 10, 11];
			} else if (pillarSlider.id === 3) {
				indicatorIds = [12, 13, 14];
			}
			let indicatorSliders = sliders.filter((slider) => indicatorIds.includes(slider.id));
			let unlockedIndicatorsSliders = indicatorSliders.filter((slider) => !slider.locked);
			let lockedIndicatorSliders = indicatorSliders.filter((slider) => slider.locked);
			let lockedSum = lockedIndicatorSliders.reduce(
				(sum, lockedSlider) => (sum += lockedSlider.percentage),
				0
			);
			let percentageToShare = pillarSlider.percentage - lockedSum;
			let slidersWithShareCount = unlockedIndicatorsSliders.length;
			if (slidersWithShareCount) {
				let equalShare = percentageToShare / slidersWithShareCount;
				unlockedIndicatorsSliders.forEach((slider) => {
					slider.percentage = equalShare;
				});
				sliders = [...sliders];
			}
		});
	};

	const toggleLocked = (sliderId) => {
		const slider = sliders.find((slider) => slider.id == sliderId);
		slider.locked = !slider.locked;
		sliders = sliders;

		let potentialIds = [1, 2, 3, 4];
		let meansAndResourcesIds = [5, 6, 7, 8, 9, 10, 11];
		let urgentIds = [12, 13, 14];

		let potentialLocked = true;
		let meansAndResourcesLocked = true;
		let urgentLocked = true;

		sliders.forEach((slider) => {
			if (potentialIds.includes(slider.id)) {
				if (potentialLocked && !slider.locked) {
					potentialLocked = false;
				}
			} else if (meansAndResourcesIds.includes(slider.id)) {
				if (meansAndResourcesLocked && !slider.locked) {
					meansAndResourcesLocked = false;
				}
			} else if (urgentIds.includes(slider.id)) {
				if (urgentLocked && !slider.locked) {
					urgentLocked = false;
				}
			}
		});

		pillarSliders[0].locked = potentialLocked;
		pillarSliders[1].locked = meansAndResourcesLocked;
		pillarSliders[2].locked = urgentLocked;

		pillarSliders = [...pillarSliders];
	};

	const resetSliders = () => {
		sliders = sliders.map((slider) => {
			slider.percentage = 100 / sliders.length;
			slider.locked = false;
			return slider;
		});

		applyDataSimulation($mapStore, index, null, null);
		calculatePillarTotal();

		pillarSliders = pillarSliders.map((slider) => {
			slider.locked = false;
			return slider;
		});

		closeSimulateModal();
	};

	const handlePillarSlider = (sliderId, newValue) => {
		const pillarSlider = pillarSliders.find((slider) => slider.id == sliderId);
		const lockedPillarSliders = pillarSliders.filter((slider) => slider.locked);
		const lockedPillarSlidersPercentageSum = lockedPillarSliders.reduce(
			(sum, slider) => (sum += slider.percentage),
			0
		);

		if (lockedPillarSlidersPercentageSum > 0 && newValue > 100 - lockedPillarSlidersPercentageSum) {
			newValue = 100 - lockedPillarSlidersPercentageSum;
		}

		const currentValue = pillarSlider.percentage;
		const difference = newValue - currentValue;
		pillarSlider.percentage = newValue;

		const otherPillarSliders = pillarSliders.filter(
			(slider) => slider.id !== sliderId && !slider.locked
		);
		const otherPillarSlidersPercentageSum = otherPillarSliders.reduce(
			(sum, slider) => (sum += slider.percentage),
			0
		);

		otherPillarSliders.forEach((slider) => {
			const share =
				otherPillarSlidersPercentageSum === 0
					? 1 / otherPillarSliders.length
					: slider.percentage / otherPillarSlidersPercentageSum;

			slider.percentage = slider.percentage - difference * share;
		});

		if (!otherPillarSliders.length) {
			pillarSlider.percentage = currentValue;
		}

		setTimeout(() => {
			pillarSliders = [...pillarSliders];
			distributePillarValueToIndicators();
		}, 50);
	};

	const handleSlider = (sliderId, newValue) => {
		const slider = sliders.find((slider) => slider.id == sliderId);
		const lockedSliders = sliders.filter((slider) => slider.locked);
		const lockedSlidersPercentageSum = lockedSliders.reduce(
			(sum, slider) => (sum += slider.percentage),
			0
		);

		if (lockedSlidersPercentageSum > 0 && newValue > 100 - lockedSlidersPercentageSum) {
			newValue = 100 - lockedSlidersPercentageSum;
		}

		const currentValue = slider.percentage;
		const difference = newValue - currentValue;
		slider.percentage = newValue;

		const otherSliders = sliders.filter((slider) => slider.id !== sliderId && !slider.locked);
		const otherSlidersPercentageSum = otherSliders.reduce(
			(sum, slider) => (sum += slider.percentage),
			0
		);

		otherSliders.forEach((slider) => {
			const share =
				otherSlidersPercentageSum === 0
					? 1 / otherSliders.length
					: slider.percentage / otherSlidersPercentageSum;

			slider.percentage = slider.percentage - difference * share;
		});

		if (!otherSliders.length) {
			slider.percentage = currentValue;
		}

		setTimeout(() => {
			sliders = [...sliders];
			calculatePillarTotal();
		}, 50);
	};

	const applySimulation = () => {
		let multiplierMap = {};
		sliders.forEach((slider) => {
			let multiplier = slider.percentage / 100;
			multiplierMap[slider.label] = multiplier;
		});

		applyDataSimulation($mapStore, index, $state.snapshot(sliders), multiplierMap);
	};

	const handleClicked = (callback: (index?: number) => unknown, index?: number) => () => {
		if (layerDetails.isDataLoaded) {
			if (index == null) {
				callback();
				return;
			}

			callback(index);
		}
	};

	const handleKeydown =
		(callback: (index?: number) => unknown, index?: number) => (e: KeyboardEvent) => {
			if (layerDetails.isDataLoaded && e.key === 'Enter') {
				if (index == null) {
					callback();
					return;
				}

				callback(index);
			}
		};

	const toggleLayerVisibility = (index: number) => {
		if (!$mapStore || !get(layersStore)) return true;

		const layers = get(layersStore);

		const mapVisibility = $mapStore.getLayoutProperty(layers[index].layerId, 'visibility');
		if (mapVisibility === 'visible') {
			$mapStore.setLayoutProperty(layers[index].layerId, 'visibility', 'none');
			layers[index].isVisible = false;
		} else {
			$mapStore.setLayoutProperty(layers[index].layerId, 'visibility', 'visible');
			layers[index].isVisible = true;
		}

		layersStore.set(layers);
		layerDetails = layerDetails;
	};
</script>

<div class="a-card is-flex is-flex-direction-column is-gap-1">
	<div class="is-flex is-gap-1">
		<div class="is-flex-grow-1 text-heavy">{layerDetails.name}</div>
		<div class="is-flex is-align-items-center is-gap-1">
			<button
				class="button menu-button px-0 py-0 is-flex is-align-items-center is-justify-content-center"
				onclick={() => {
					toggleLayerVisibility(index);
				}}
				use:tippy={{ content: tooltipContent }}
				use:tippyTooltip={{ content: 'Change the layer visibility' }}
			>
				{#if layerDetails.isVisible}
					<i class="fa fa-eye"></i>
				{:else}
					<i class="fa fa-eye-slash"></i>
				{/if}
			</button>
			<div class="dropdown is-hoverable is-right">
				<div class="dropdown-trigger">
					<button
						class="button menu-button px-0 py-0 is-flex is-align-items-center is-justify-content-center"
						aria-label="menu"
					>
						<i class="fa fa-ellipsis"></i>
					</button>
				</div>
				<div class="dropdown-menu">
					<div class="dropdown-content">
						<!-- svelte-ignore a11y_missing_attribute -->
						<a
							role="button"
							tabindex="0"
							onclick={openEditLayerNameModal}
							onkeydown={handleEnterKey}
							class="dropdown-item is-flex is-gap-2 is-align-items-center"
							class:disabled={!layerDetails.isDataLoaded}
						>
							<i class="fa-solid fa-pen-to-square"></i>
							<div>
								<p>Edit layer name</p>
								<p class="is-size-7">Changes the text shown in cards and popups</p>
							</div>
						</a>
						<!-- svelte-ignore a11y_missing_attribute -->
						<a
							role="button"
							tabindex="0"
							onclick={() => {
								duplicateLayer($mapStore, index);
							}}
							onkeydown={handleEnterKey}
							class="dropdown-item is-flex is-gap-2 is-align-items-center"
							class:disabled={!layerDetails.isDataLoaded}
						>
							<i class="fa fa-copy"></i>
							<div>
								<p>Duplicate layer</p>
								<p class="is-size-7">Create a copy of this layer with seperate data</p>
							</div>
						</a>
						<!-- svelte-ignore a11y_missing_attribute -->
						<a
							role="button"
							tabindex="0"
							onclick={handleClicked(openEditColorScaleModel)}
							onkeydown={handleKeydown(openEditColorScaleModel)}
							class="dropdown-item is-flex is-gap-2 is-align-items-center"
							class:disabled={!layerDetails.isDataLoaded}
						>
							<i class="fa-solid fa-palette"></i>
							<div>
								<p>Edit color scale</p>
								<p class="is-size-7">Change the colors shown in map</p>
							</div>
						</a>
						{#if index !== 0}
							<!-- svelte-ignore a11y_missing_attribute -->
							<a
								role="button"
								tabindex="0"
								class="dropdown-item is-flex is-gap-2 is-align-items-center"
								onclick={() => {
									deleteLayer($mapStore, index);
								}}
								onkeydown={handleEnterKey}
								class:disabled={!layerDetails.isDataLoaded}
							>
								<i class="fa-solid fa-trash"></i>
								<div>
									<p>Delete layer</p>
									<p class="is-size-7">Permanently deletes layer and data associated</p>
								</div>
							</a>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="is-background-light p-3 is-flex is-flex-direction-column is-gap-1">
		<div class="is-flex" style="gap: 1px;">
			{#each colorGroups as cg, index (index)}
				<div class="is-flex-grow-1 bar" style="background: {cg}"></div>
			{/each}
		</div>
		<div class="is-flex light-text">
			<div class="is-flex-grow-1 is-flex is-flex-direction-column">
				<div class="is-size-7">No clean energy<br />equity</div>
				<div>0</div>
			</div>
			<div class="is-flex is-flex-direction-column has-text-right">
				<div class="is-size-7">High clean energy<br />equity</div>
				<div>1</div>
			</div>
		</div>
	</div>
	<Button title="Customize Data" isPrimary={false} onclick={() => (showCustomizeDataModal = true)}
	></Button>
	<Button
		title="SIMULATE"
		isPrimary={false}
		onclick={openSimulateModal}
		isDisabled={!layerDetails.isDataLoaded}
	></Button>
</div>

<ModalTemplate title="Simulate" bind:show={showSimulateModal}>
	{#snippet content()}
		<div class="is-flex is-flex-direction-column is-gap-2">
			<p class="is-flex-grow-1">
				Adjust indicator weights in the CEEI for automatic recalculation.
			</p>
			<div class="is-flex is-flex-direction-row is-gap-2">
				<div class="is-flex is-flex-direction-column is-gap-2">
					<div style="background: #ededed; padding: 0 0 0 0;">
						<div class="pillar-heading">
							<div
								class="indicator-pillar is-flex is-flex-direction-row is-justify-content-space-between"
							>
								<div class="pillar-name">Potential</div>
								<div class="pillar-value">{pillarSliders[0].percentage.toFixed(2)}%</div>
							</div>
							<div class="pillar-slider">
								<Slider
									values={[pillarSliders[0].percentage]}
									min={0}
									max={100}
									step={0.01}
									first="label"
									last="label"
									rest={false}
									pips={false}
									suffix="%"
									formatter={(value) => value.toFixed(2)}
									disabled={pillarSliders[0].locked}
									onchange={(values: number[]) => {
										let newValue = 0;
										if (values[0]) {
											newValue = values[0];
										}
										handlePillarSlider(1, newValue);
									}}
								/>
							</div>
						</div>
						<div style="background: #F7F7F7; padding: 8px 4px 8px 4px;">
							{#each sliders as { id, percentage, label, locked }, index (index)}
								{#if [1, 2, 3, 4].includes(id)}
									<div style="margin: auto;">
										<div class="slider-field-sm">
											<div class="label">{label}</div>
											<div class="value">
												{percentage.toFixed(2)}%

												<button onclick={() => toggleLocked(id)}>
													<span class="icon is-small">
														{#if locked}
															<i class="fa-solid fa-lock"></i>
														{:else}
															<i class="fa-solid fa-unlock"></i>
														{/if}
													</span>
												</button>
											</div>
										</div>
										<Slider
											values={[percentage]}
											min={0}
											max={100}
											step={0.01}
											first="label"
											last="label"
											rest={false}
											pips={false}
											suffix="%"
											formatter={(value) => value.toFixed(2)}
											disabled={locked}
											onchange={(values: number[]) => {
												let newValue = 0;
												if (values[0]) {
													newValue = values[0];
												}
												handleSlider(id, newValue);
											}}
										/>
									</div>
								{/if}
							{/each}
						</div>
					</div>

					<div style="padding: 0 0 0 0;">
						<div class="pillar-heading">
							<div
								class="indicator-pillar is-flex is-flex-direction-row is-justify-content-space-between"
							>
								<div class="pillar-name">Urgent</div>
								<div class="pillar-value">{pillarSliders[2].percentage.toFixed(2)}%</div>
							</div>
							<div class="pillar-slider">
								<Slider
									values={[pillarSliders[2].percentage]}
									min={0}
									max={100}
									step={0.01}
									first="label"
									last="label"
									rest={false}
									pips={false}
									suffix="%"
									formatter={(value) => value.toFixed(2)}
									disabled={pillarSliders[2].locked}
									onchange={(values: number[]) => {
										let newValue = 0;
										if (values[0]) {
											newValue = values[0];
										}
										handlePillarSlider(3, newValue);
									}}
								/>
							</div>
						</div>
						<div style="background: #F7F7F7; padding: 8px 4px 8px 4px;">
							{#each sliders as { id, percentage, label, locked }, index (index)}
								{#if [12, 13, 14, 15].includes(id)}
									<div style="margin: auto;">
										<div class="slider-field-sm">
											<div class="label">{label}</div>
											<div class="value">
												{percentage.toFixed(2)}%

												<button onclick={() => toggleLocked(id)}>
													<span class="icon is-small">
														{#if locked}
															<i class="fa-solid fa-lock"></i>
														{:else}
															<i class="fa-solid fa-unlock"></i>
														{/if}
													</span>
												</button>
											</div>
										</div>
										<Slider
											values={[percentage]}
											min={0}
											max={100}
											step={0.01}
											first="label"
											last="label"
											rest={false}
											pips={false}
											suffix="%"
											formatter={(value) => value.toFixed(2)}
											disabled={locked}
											onchange={(values: number[]) => {
												let newValue = 0;
												if (values[0]) {
													newValue = values[0];
												}
												handleSlider(id, newValue);
											}}
										/>
									</div>
								{/if}
							{/each}
						</div>
					</div>
				</div>
				<div style="background: #ededed; padding: 0 0 0 0;">
					<div class="pillar-heading">
						<div
							class="indicator-pillar is-flex is-flex-direction-row is-justify-content-space-between"
						>
							<div class="pillar-name">Means and Resources</div>
							<div class="pillar-value">{pillarSliders[1].percentage.toFixed(2)}%</div>
						</div>
						<div class="pillar-slider">
							<Slider
								values={[pillarSliders[1].percentage]}
								min={0}
								max={100}
								step={0.01}
								first="label"
								last="label"
								rest={false}
								pips={false}
								suffix="%"
								formatter={(value) => value.toFixed(2)}
								disabled={pillarSliders[1].locked}
								onchange={(values: number[]) => {
									let newValue = 0;
									if (values[0]) {
										newValue = values[0];
									}
									handlePillarSlider(2, newValue);
								}}
							/>
						</div>
					</div>
					<div style="background: #F7F7F7; padding: 8px 4px 8px 4px;">
						{#each sliders as { id, percentage, label, locked }, index (index)}
							{#if [5, 6, 7, 8, 9, 10, 11].includes(id)}
								<div style="margin: auto;">
									<div class="slider-field-sm">
										<div class="label">{label}</div>
										<div class="value">
											{percentage.toFixed(2)}%

											<button onclick={() => toggleLocked(id)}>
												<span class="icon is-small">
													{#if locked}
														<i class="fa-solid fa-lock"></i>
													{:else}
														<i class="fa-solid fa-unlock"></i>
													{/if}
												</span>
											</button>
										</div>
									</div>
									<Slider
										values={[percentage]}
										min={0}
										max={100}
										step={0.01}
										first="label"
										last="label"
										rest={false}
										pips={false}
										suffix="%"
										formatter={(value) => value.toFixed(2)}
										disabled={locked}
										onchange={(values: number[]) => {
											let newValue = 0;
											if (values[0]) {
												newValue = values[0];
											}
											handleSlider(id, newValue);
										}}
									/>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/snippet}
	{#snippet buttons()}
		<div style="display: flex;">
			<Button
				title="Reset"
				isPrimary={true}
				onclick={() => {
					resetSliders();
				}}
			></Button>
			<Button
				title="Apply"
				isPrimary={false}
				onclick={() => {
					applySimulation();
					closeSimulateModal();
				}}
			></Button>
		</div>
	{/snippet}
</ModalTemplate>

<ModalTemplate title="Customize data for {layerDetails.name}" bind:show={showCustomizeDataModal}>
	{#snippet content()}
		<div class="is-flex is-flex-direction-column is-gap-2">
			<div class="is-background-light p-4 is-flex is-flex-direction-column is-gap-1">
				<p>Download {layerDetails.name} data as a .csv file to customise it on your device.</p>
				<Button
					title={layerDetails.isDataLoaded ? 'Download' : 'NOT READY FOR DOWNLOAD'}
					isPrimary={false}
					isDisabled={!layerDetails.isDataLoaded}
					onclick={() => downloadData($mapStore, index)}
				></Button>
			</div>
			<div class="is-background-light p-4 is-flex is-flex-direction-column is-gap-1">
				<p>Upload your adjusted .csv file.</p>
				<Button
					title="Upload"
					isPrimary={false}
					isDisabled={!layerDetails.isDataLoaded}
					onclick={() => uploadData($mapStore, index)}
				></Button>
				{#if !layerDetails.isDataLoaded}
					<div class="is-flex is-justify-content-center is-align-items-center">
						<Loader />
					</div>
				{/if}
			</div>
		</div>
	{/snippet}
</ModalTemplate>

<ModalTemplate title="Edit layer name" bind:show={showEditLayerNameModal}>
	{#snippet content()}
		<div>
			<TextInput
				placeholder="Input new layer name..."
				label="Layer name"
				name="Edit layer name"
				bind:value={editLayerNameValue}
			/>
		</div>
	{/snippet}
	{#snippet buttons()}
		<div style="display: flex;">
			<Button
				title="Save"
				isPrimary={false}
				onclick={() => {
					editLayerName(index, editLayerNameValue);
					closeEditLayerNameModal();
				}}
			></Button>
		</div>
	{/snippet}
</ModalTemplate>

<ModalTemplate title="Customize color scale" bind:show={showEditColorScaleModel}>
	{#snippet content()}
		<div><ColorMapPicker bind:colorMapName /></div>
	{/snippet}
	{#snippet buttons()}
		<div style="display: flex;">
			<Button
				title="Save"
				isPrimary={false}
				onclick={() => {
					updatePaintOfLayer($mapStore, index, colorMapName);
					closeEditColorScaleModel();
					colorGroups = getColorGroups();
				}}
			></Button>
		</div>
	{/snippet}
</ModalTemplate>

<style lang="scss">
	.dropdown-content {
		max-width: 300px;
	}

	.pillar-heading {
		background-color: #454545;
		padding-bottom: 1px;
	}

	.indicator-pillar {
		padding: 12px;
		font-size: 16px;
		font-weight: 600;
		color: #fff;
	}

	.pillar-slider {
		padding: 0 4px;
	}

	.slider-field-sm {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 12px;
		font-size: 12px;
		.label {
			font-size: 12px;
			padding-top: 4px;
			flex-grow: 1;
			max-width: 200px;
		}
		.value {
			width: 70px;
			text-align: right;
		}
	}

	.a-card {
		border: 1px solid #d4d6d8;
		padding: 16px;
		font-style: 'ProximaNova';
	}

	.bar {
		height: 24px;
		border: 1px solid #d4d6d8;
	}

	.text-heavy {
		font-weight: 700;
	}

	.menu-button {
		border: none;
		background: transparent;
		cursor: pointer;
		box-shadow: none;
	}

	.disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
</style>
