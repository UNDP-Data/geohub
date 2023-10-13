<script lang="ts">
	import LayerHeader from '$components/pages/map/layers/header/LayerHeader.svelte';
	import type { Layer } from '$lib/types';
	import { fade } from 'svelte/transition';

	export let layer: Layer;

	let isContentVisible = true;
</script>

<div class="has-background-white-bis" transition:fade|global>
	<nav class="panel">
		<p class="panel-heading has-background-grey-lighter p-2">
			<LayerHeader {layer} bind:isVisible={isContentVisible} />
		</p>

		<div hidden={!isContentVisible}>
			<slot />
		</div>
	</nav>
</div>
