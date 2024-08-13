<script lang="ts">
	import { layers as layersStore } from '../stores';
	export let id;

	let formattedFeatures = $layersStore
		.filter((l) => l.isVisible)
		.map((l) => {
			return {
				name: l.name,
				...l.data.find((d) => d.adminid === id)
			};
		});

	let [{ Country: country, 'District Name': district }] = formattedFeatures;

	let pillarGroups = {
		Potential: [
			'Solar Power Potential',
			'Wind Speed',
			'Geothermal Power Potential',
			'Hydro Power Potential'
		],
		Urgency: [
			'GHG Emissions',
			'Net Electricity Imports',
			'Fossil Fuel Share on Energy Capacity and Generation'
		],
		'Means and Resources': [
			'Relative Wealth Index',
			'Grid Density',
			'Access to electricity',
			'Households with access to loans from commercial banks',
			'Jobs in Renewable Energy Sector',
			'Public and foreign (aid) investments on renewable energy',
			'Education Index'
		]
	};

	let showPillars = Object.keys(pillarGroups).reduce(
		(prev, curr) => ((prev[curr] = true), prev),
		{}
	);

	let featureDetails = {
		'Solar Power Potential': { unit: 'kWh/kWp', refYear: 2023 },
		'Wind Speed': { unit: 'm/s', refYear: 2023 },
		'Geothermal Power Potential': { unit: 'unitless (index, 0 to 1)', refYear: 2019 },
		'Hydro Power Potential': { unit: 'MWH/year', refYear: 2010 },
		'GHG Emissions': { unit: 'm/km²', refYear: 2021 },
		'Net Electricity Imports': { unit: 'MwH, per capita', refYear: 2022 },
		'Fossil Fuel Share on Energy Capacity and Generation': { unit: '%', refYear: 2022 },
		'Relative Wealth Index': { unit: 'unitless (index, -1 to 1)', refYear: 2021 },
		'Grid Density': { unit: 'm/km²', refYear: 2021 },
		'Access to electricity': { unit: '% of population', refYear: 2020 },
		'Households with access to loans from commercial banks': { unit: '% of GDP', refYear: 2022 },
		'Jobs in Renewable Energy Sector': { unit: 'jobs, per 1000hab', refYear: 2021 },
		'Public and foreign (aid) investments on renewable energy': {
			unit: 'USD, per capita',
			refYear: 2021
		},
		'Education Index': { unit: 'unitless (index, 0-1)', refYear: 2021 }
	};

	const handleAccordionSelect = (pillar) => {
		showPillars[pillar] = !showPillars[pillar];
	};
</script>

<div class="mb-4 is-size-6 has-text-weight-bold">{district}, {country}</div>
<div class="table-container">
	<table class="table is-narrow is-fullwidth">
		<thead>
			<tr>
				<th></th>
				{#each formattedFeatures as feature}
					<th class="has-text-right">{feature.name}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			<tr class="my-4">
				<th>CEEI</th>
				{#each formattedFeatures as feature}
					{@const prop = feature['CEEI']}
					<th class="has-text-right">
						{typeof prop === 'number' ? prop.toFixed(2) : prop}
					</th>
				{/each}
			</tr>
			{#each Object.entries(pillarGroups) as [pgName, pgMembers]}
				<tr on:click={() => handleAccordionSelect(pgName)}>
					<th colspan={formattedFeatures.length + 1}>
						<div class="is-flex is-gap-1 accordion-button" class:clicked={showPillars[pgName]}>
							{pgName}
						</div>
					</th>
				</tr>
				{#if showPillars[pgName]}
					{#each pgMembers as key}
						<tr>
							<td class="pillar-group-key">
								<div>
									{key}
								</div>
								<div class="is-italic is-size-7">
									{featureDetails[key].unit} ({featureDetails[key].refYear})
								</div>
							</td>
							{#each formattedFeatures as feature}
								{@const prop = feature[key]}
								<td class="has-text-right">
									{typeof prop === 'number' ? prop.toFixed(2) : prop}
								</td>
							{/each}
						</tr>
					{/each}
				{/if}
			{/each}
		</tbody>
	</table>
</div>

<style>
	.pillar-group-key {
		max-width: 200px;
	}

	.table-container {
		max-height: 300px;
		overflow-y: auto;
	}

	.accordion-button {
		cursor: pointer;
	}

	.accordion-button:before {
		content: '\f077';
		font-family: 'Font Awesome 5 Free';
		font-weight: 900;

		-webkit-transition: all 0.3s ease;
		-moz-transition: all 0.3s ease;
		-ms-transition: all 0.3s ease;
		-o-transition: all 0.3s ease;
		transition: all 0.3s ease;
	}

	.accordion-button.clicked:before {
		-webkit-transform: rotate(180deg);
		-moz-transform: rotate(180deg);
		-ms-transform: rotate(180deg);
		-o-transform: rotate(180deg);
		transform: rotate(180deg);
		transition: rotateZ(180deg);
	}
</style>
