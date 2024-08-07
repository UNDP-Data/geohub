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
		Urgent: [
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

	let featureMetrics = {
		'Solar Power Potential': 'kWh/kWp',
		'Wind Speed': 'm/s',
		'Geothermal Power Potential': 'unitless (index, 0 to 1)',
		'Hydro Power Potential': 'MWH/year',
		'GHG Emissions': 'm/km²',
		'Net Electricity Imports': 'MwH, per capita',
		'Fossil Fuel Share on Energy Capacity and Generation': '%',
		'Relative Wealth Index': 'unitless (index, -1 to 1)',
		'Grid Density': 'm/km²',
		'Access to electricity': '% of population',
		'Households with access to loans from commercial banks': '% of GDP',
		'Jobs in Renewable Energy Sector': 'jobs, per 1000hab',
		'Public and foreign (aid) investments on renewable energy': 'USD, per capita',
		'Education Index': 'unitless (index, 0-1)'
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
				<tr>
					<th colspan={formattedFeatures.length + 1}>{pgName}</th>
				</tr>
				{#each pgMembers as key}
					<tr>
						<td class="pillar-group-key">
							<div>
								{key}
								<span class="is-italic">({featureMetrics[key]})</span>
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
			{/each}
		</tbody>
	</table>
</div>

<style>
	:root {
		font-family: ProximaNova, sans-serif !important;
	}

	.pillar-group-key {
		max-width: 200px;
	}
</style>
