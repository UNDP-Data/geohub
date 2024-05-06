<script lang="ts">
	import { hrea, ml } from '../stores';

	export let showIntro: boolean;
	const hideIntro = () => {
		showIntro = false;
	};

	$: disabled = !($hrea?.length > 0 && $ml?.length > 0);
</script>

{#if showIntro}
	<div class="box has-text-justified">
		<p role="article">
			Welcome to the UNDP GeoHub dashboard. Presented here are two raster layers that display the
			likelihood of full electrification for a given area: <a
				href="https://planetarycomputer.microsoft.com/dataset/hrea"
				>High Resolution Electricity Access (HREA)</a
			> and Machine Learning (ML). These are created by the University of Michigan, used to support the
			2030 Social Development Goal (SDG) 7: ensuring access to affordable, reliable, sustainable and
			modern energy for all.
		</p>
		<p role="article">
			Two layers can be overlaid on top of the raw data: a summary of HREA electrification by
			administrative areas, and a heatmap of poverty. Admin data is sourced from a dataset
			containing OCHA's <a href="https://fieldmaps.io/data">Common Operational Datasets (CODs)</a>,
			using a custom population raster to calculate the percentage of population with electricity
			access in each area. Poverty data is sourced from Meta's
			<a href="https://dataforgood.facebook.com/dfg/tools/relative-wealth-index"
				>Relative Wealth Index (RWI)</a
			>, showing areas with poverty relative to each country's own average wealth.
		</p>
		<p role="article">
			Layer statistics can be explored in two ways: by hovering over the map, or by clicking
			anywhere. Hovering displays population percentages with full electrification over time.
			Clicking displays the likelihood of full electrification for a single pixel only.
		</p>
		<br />

		<button
			class="button is-primary is-normal is-fullwidth is-uppercase has-text-weight-bold {disabled
				? 'is-loading'
				: ''}"
			on:click={hideIntro}
			{disabled}
		>
			Explore Data
		</button>
	</div>
{/if}

<style lang="scss">
	p {
		padding: 10px;
		border-radius: 5px;
		font-size: small;
	}
</style>
