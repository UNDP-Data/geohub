<script context="module" lang="ts">
	export enum LegendType {
		LINEAR = 'Linear',
		CATEGORISED = 'Categorised'
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let legendType: LegendType = LegendType.LINEAR;

	const handleChanged = () => {
		dispatch('change', { legendType });
	};
</script>

<div class="select is-fullwidth">
	<select bind:value={legendType} on:change={handleChanged}>
		<option value={LegendType.LINEAR}>Use a linear colormap</option>
		<option value={LegendType.CATEGORISED}>Use advanced classification</option>
	</select>
</div>
