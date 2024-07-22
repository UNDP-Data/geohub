<script lang="ts">
	import { ModalTemplate, initTippy, initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { Button, Loader } from '@undp-data/svelte-undp-design';

	import type { Layer } from '../stores';

	import { Slider } from '@undp-data/svelte-undp-components';
	import {
		applyLayerSimulation,
		deleteLayer,
		downloadData,
		duplicateLayer,
		toggleLayerVisibility,
		uploadData,
		zoomToLayer
	} from '../utils/layerHelper';

	export let layerDetails: Layer;
	export let index: number;

	let showCustomizeDataModal = false;

	let showSimulateModal = false;

	const openSimulateModal = () => {
		showSimulateModal = true;
	};

	const closeSimulateModal = () => {
		showSimulateModal = false;
	};

	const tippy = initTippy();
	let tooltipContent: HTMLElement;

	const tippyTooltip = initTooltipTippy();

	let sliders = [
		{ id: 1, percentage: 7.1429, label: 'Solar Power Potential', locked: false },
		{ id: 2, percentage: 7.1429, label: 'Wind Speed', locked: false },
		{ id: 3, percentage: 7.1429, label: 'Geothermal Power Potential', locked: false },
		{ id: 4, percentage: 7.1429, label: 'Hydro Power Potential', locked: false },
		{ id: 5, percentage: 7.1429, label: 'Jobs in Renewable Energy Sector ', locked: false },
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
		{ id: 12, percentage: 7.1429, label: 'GHG emissions', locked: false },
		{ id: 13, percentage: 7.1429, label: 'Net Electricity Imports', locked: false },
		{
			id: 14,
			percentage: 7.1429,
			label: 'Fossil Fuel Share on Energy Capacity and Generation',
			locked: false
		}
	];

	const pillarTotal = (ids) => {
		let total = 0;
		sliders.forEach((slider) => {
			if (ids.includes(slider.id)) {
				total += slider.percentage;
			}
		});
		return total;
	};

	let potentialSum = 28.57;
	let meansAndResourcesSum = 50.0;
	let urgentSum = 21.43;

	const calculatePillarTotal = () => {
		potentialSum = pillarTotal([1, 2, 3, 4]);
		meansAndResourcesSum = pillarTotal([5, 6, 7, 8, 9, 10, 11]);
		urgentSum = pillarTotal([12, 13, 14]);
	};

	const toggleLocked = (sliderId) => {
		const slider = sliders.find((slider) => slider.id == sliderId);
		slider.locked = !slider.locked;
		sliders = sliders;
	};

	const resetSliders = () => {
		sliders = sliders.map((slider) => {
			slider.percentage = 100 / sliders.length;
			return slider;
		});

		applyLayerSimulation(index, null, null);
		calculatePillarTotal();
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

		applyLayerSimulation(index, sliders, multiplierMap);
	};

	const handleClicked = (callback: (index: number) => unknown, index: number) => () => {
		if (layerDetails.isDataLoaded) {
			callback(index);
		}
	};

	const handleKeydown =
		(callback: (index: number) => unknown, index: number) => (e: KeyboardEvent) => {
			if (layerDetails.isDataLoaded && e.key === 'Enter') {
				callback(index);
			}
		};
</script>

<div class="a-card is-flex is-flex-direction-column is-gap-1">
	<div class="is-flex is-gap-1">
		<div class="is-flex-grow-1 text-heavy">{layerDetails.name}</div>
		<div class="is-flex is-align-items-center is-gap-1">
			<button
				class="button menu-button px-0 py-0 is-flex is-align-items-center is-justify-content-center"
				class:disabled={!layerDetails.isDataLoaded}
				on:click={handleClicked(toggleLayerVisibility, index)}
				use:tippy={{ content: tooltipContent }}
				use:tippyTooltip={{ content: 'Change the layer visibility' }}
			>
				{#if layerDetails.isVisible}
					<i class="fa fa-eye" />
				{:else}
					<i class="fa fa-eye-slash" />
				{/if}
			</button>
			<div class="dropdown is-hoverable is-right">
				<div class="dropdown-trigger">
					<button
						class="button menu-button px-0 py-0 is-flex is-align-items-center is-justify-content-center"
					>
						<i class="fa fa-ellipsis" />
					</button>
				</div>
				<div class="dropdown-menu">
					<div class="dropdown-content">
						<!-- svelte-ignore a11y-missing-attribute -->
						<a
							role="button"
							tabindex="0"
							class="dropdown-item is-flex is-gap-2 is-align-items-center"
							on:click={handleClicked(zoomToLayer, index)}
							on:keydown={handleKeydown(zoomToLayer, index)}
							class:disabled={!layerDetails.isDataLoaded}
						>
							<i class="fa fa-search" aria-hidden="true"></i>
							<div>
								<p>Zoom to layer</p>
								<p class="is-size-7">Resizes map view to fit this layer</p>
							</div>
						</a>
						<!-- svelte-ignore a11y-missing-attribute -->
						<a
							role="button"
							tabindex="0"
							on:click={handleClicked(duplicateLayer, index)}
							on:keydown={handleKeydown(duplicateLayer, index)}
							class="dropdown-item is-flex is-gap-2 is-align-items-center"
							class:disabled={!layerDetails.isDataLoaded}
						>
							<i class="fa fa-copy"></i>
							<div>
								<p>Duplicate layer</p>
								<p class="is-size-7">Create a copy of this layer with seperate data</p>
							</div>
						</a>
						{#if index !== 0}
							<!-- svelte-ignore a11y-missing-attribute -->
							<a
								role="button"
								tabindex="0"
								class="dropdown-item is-flex is-gap-2 is-align-items-center"
								on:click={handleClicked(deleteLayer, index)}
								on:keydown={handleKeydown(deleteLayer, index)}
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
		<div class="text-heavy">Clean Energy Equity Index</div>
		<div class="bar"></div>
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
	<Button
		title="Customize Data"
		isPrimary={false}
		on:clicked={() => (showCustomizeDataModal = true)}
	></Button>
	<Button
		title="SIMULATE"
		isPrimary={false}
		on:clicked={openSimulateModal}
		isDisabled={!layerDetails.isDataLoaded}
	></Button>
</div>

<ModalTemplate title="Simulate" bind:show={showSimulateModal}>
	<div slot="content" class="is-flex is-flex-direction-row is-gap-2">
		<div class="is-flex is-flex-direction-column is-gap-2">
			<div style="background: #ededed; padding: 0 0 0 0;">
				<div
					class="indicator-pillar is-flex is-flex-direction-row is-justify-content-space-between"
				>
					<div class="pillar-name">Potential</div>
					<div class="pillar-value">{potentialSum.toFixed(2)}%</div>
				</div>
				<div style="background: #F7F7F7; padding: 8px 4px 8px 4px;">
					{#each sliders as { id, percentage, label, locked }}
						{#if [1, 2, 3, 4].includes(id)}
							<div style="margin: auto;">
								<div class="slider-field-sm">
									<div class="label">{label}</div>
									<div class="value">
										{percentage.toFixed(2)}%

										<button on:click={() => toggleLocked(id)}>
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
									on:change={(event) => {
										let newValue = 0;
										if (event?.detail?.values[0]) {
											newValue = event?.detail?.values[0];
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
				<div
					class="indicator-pillar is-flex is-flex-direction-row is-justify-content-space-between"
				>
					<div class="pillar-name">Urgent</div>
					<div class="pillar-value">{urgentSum.toFixed(2)}%</div>
				</div>
				<div style="background: #F7F7F7; padding: 8px 4px 8px 4px;">
					{#each sliders as { id, percentage, label, locked }}
						{#if [12, 13, 14, 15].includes(id)}
							<div style="margin: auto;">
								<div class="slider-field-sm">
									<div class="label">{label}</div>
									<div class="value">
										{percentage.toFixed(2)}%

										<button on:click={() => toggleLocked(id)}>
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
									on:change={(event) => {
										let newValue = 0;
										if (event?.detail?.values[0]) {
											newValue = event?.detail?.values[0];
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
			<div class="indicator-pillar is-flex is-flex-direction-row is-justify-content-space-between">
				<div class="pillar-name">Means and Resources</div>
				<div class="pillar-value">{meansAndResourcesSum.toFixed(2)}%</div>
			</div>
			<div style="background: #F7F7F7; padding: 8px 4px 8px 4px;">
				{#each sliders as { id, percentage, label, locked }}
					{#if [5, 6, 7, 8, 9, 10, 11].includes(id)}
						<div style="margin: auto;">
							<div class="slider-field-sm">
								<div class="label">{label}</div>
								<div class="value">
									{percentage.toFixed(2)}%

									<button on:click={() => toggleLocked(id)}>
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
								on:change={(event) => {
									let newValue = 0;
									if (event?.detail?.values[0]) {
										newValue = event?.detail?.values[0];
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
	<div slot="buttons" style="display: flex;">
		<Button
			title="Reset"
			isPrimary={true}
			on:clicked={() => {
				resetSliders();
				closeSimulateModal();
			}}
		></Button>
		<Button
			title="Apply"
			isPrimary={false}
			on:clicked={() => {
				applySimulation();
				closeSimulateModal();
			}}
		></Button>
	</div>
</ModalTemplate>

<ModalTemplate title="Customize data for {layerDetails.name}" bind:show={showCustomizeDataModal}>
	<div slot="content" class="is-flex is-flex-direction-column is-gap-2">
		<div class="is-background-light p-4 is-flex is-flex-direction-column is-gap-1">
			<p>Download {layerDetails.name} data as a .csv file to customise it on your device.</p>
			<Button
				title={layerDetails.isDataLoaded ? 'Download' : 'NOT READY FOR DOWNLOAD'}
				isPrimary={false}
				isDisabled={!layerDetails.isDataLoaded}
				on:clicked={() => downloadData(index)}
			></Button>
		</div>
		<div class="is-background-light p-4 is-flex is-flex-direction-column is-gap-1">
			<p>Upload your adjusted .csv file.</p>
			<Button
				title="Upload"
				isPrimary={false}
				isDisabled={!layerDetails.isDataLoaded}
				on:clicked={() => uploadData(index)}
			></Button>
			{#if !layerDetails.isDataLoaded}
				<div class="is-flex is-justify-content-center is-align-items-center">
					<Loader />
				</div>
			{/if}
		</div>
	</div>
</ModalTemplate>

<style lang="scss">
	.dropdown-content {
		max-width: 300px;
	}

	.indicator-pillar {
		padding: 12px 16px;
		font-size: 16px;
		font-weight: 600;
		color: #fff;
		background-color: #454545;
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
			width: 50px;
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
		background: linear-gradient(90deg, #a50026, #f46d43, #fee090, #e0f3f8, #74add1);
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
