<script lang="ts">
	// imports
	import chroma from 'chroma-js';

	// export vars
	export let electricitySelected: string;

	// const vars
	const mlScale = chroma.scale('RdYlBu').colors();
</script>

{#if electricitySelected == 'ML'}
	<!-- eslint-disable svelte/no-object-in-text-mustaches -->
	<div class="legend" style="background: linear-gradient(to right, {[...mlScale]});" />
	<div style="display: flex; align-items: center; justify-content: space-between">
		<span>0%</span><span>100%</span>
	</div>
{/if}

{#if electricitySelected == 'HREA'}
	<div style="display:flex; padding-top:5%">
		<div
			style="background-color:rgba(12, 12, 12, 255); height:20px; width:20px; border: 1px solid rgba(242, 166, 4, 255)"
		/>
		&nbsp;-&nbsp;<span>without electricity</span>
		<div
			style="background-color:rgba(242, 166, 4, 255); height:20px; width:20px;  margin-left:10px; border: 1px solid rgba(12, 12, 12, 255)"
		/>
		&nbsp;-&nbsp;<span>electrified</span>
	</div>
{/if}

<style lang="scss">
	.legend {
		height: 20px;
		width: 100%;
		margin-top: 5%;
	}
</style>
