<script lang="ts">
	import { StoryMap } from '$lib/index.js';
	import '$lib/svelte-maplibre-storymap.scss';
	import type { PageData } from './$types.js';

	export let data: PageData;
</script>

<StoryMap bind:config={data.config} />
