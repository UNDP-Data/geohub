<script lang="ts">
	import { ColorMapPicker } from '@undp-data/svelte-undp-components';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	// export vars
	export let electricitySelected: string;

	let colorMapNameStore: string = 'pubu';

	const colorPickerChangeHandler = (e) => {
		colorMapNameStore = e.detail.colorMapName;
		dispatch('onRasterColorMapChange', {
			rasterColorMapName: colorMapNameStore
		});
	};
</script>

{#if electricitySelected == 'ML'}
	<!-- eslint-disable svelte/no-object-in-text-mustaches -->
	<div class="p-4 has-background-light">
		<p class="mb-2">Electricity access</p>
		<ColorMapPicker colorMapName={colorMapNameStore} on:change={colorPickerChangeHandler} />
	</div>
{/if}

{#if electricitySelected == 'HREA'}
	<div style="display:flex; flex-direction: column; margin-top:5%; background-color: #F7F7F7">
		<div style="display:flex; padding: 12px; border-bottom: 1px solid #D4D6D8">
			<div style="background-color:#A3A4A6; height:20px; width:20px;" />
			&nbsp;-&nbsp;<span>without electricity</span>
		</div>
		<div style="display:flex; padding: 12px">
			<div style="background-color:#006EB5; height:20px; width:20px;" />
			&nbsp;-&nbsp;<span>electrified</span>
		</div>
	</div>
{/if}
