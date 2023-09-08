<script lang="ts">
	import LayerHeader from '$components/LayerHeader.svelte';
	import type { Layer } from '$lib/types';
	import { fade } from 'svelte/transition';

	export let layer: Layer;

	let isContentVisible = true;
</script>

<div class="card" transition:fade|global>
	<LayerHeader {layer} bind:isVisible={isContentVisible} />

	<div class="card-content p-1" hidden={!isContentVisible}>
		<slot />
	</div>
</div>
