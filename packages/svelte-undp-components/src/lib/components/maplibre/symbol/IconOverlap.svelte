<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
	}

	let { layerId = $bindable() }: Props = $props();

	const choices = ['never', 'always', 'cooperative'];
	const propertyName = 'icon-overlap';
	let selected = $state($map.getLayoutProperty(layerId, propertyName) ?? choices[0]);

	const setIconOverlap = () => {
		map.setLayoutProperty(layerId, propertyName, selected);
	};
	onMount(() => {
		setIconOverlap();
	});
</script>

<div data-testid="icon-overlap-slider" class="select is-fullwidth">
	<select bind:value={selected} onchange={setIconOverlap}>
		{#each choices as choice}
			<option value={choice}
				>{choice.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase())}</option
			>
		{/each}
	</select>
</div>
