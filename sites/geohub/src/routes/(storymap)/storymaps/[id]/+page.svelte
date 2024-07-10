<script lang="ts">
	import { StoryMap } from '@undp-data/svelte-maplibre-storymap';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<StoryMap bind:config={data.storymap} bind:template={data.storymap.template_id} />
