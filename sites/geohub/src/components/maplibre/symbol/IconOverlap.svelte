<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;

	const choices = ['never', 'always', 'cooperative'];
	const propertyName = 'icon-overlap';
	let selected = $map.getLayoutProperty(layerId, propertyName) ?? choices[0];

	$: selected, setIconOverlap();

	const setIconOverlap = () => {
		map.setLayoutProperty(layerId, propertyName, selected);
	};
</script>

<div data-testid="icon-overlap-slider" class="select is-fullwidth">
	<select bind:value={selected}>
		{#each choices as choice}
			<option value={choice}
				>{choice.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase())}</option
			>
		{/each}
	</select>
</div>
