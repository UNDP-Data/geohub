<script lang="ts">
	import Map from '$components/pages/map/Map.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Map bind:defaultStyle={data.config.DefaultMapStyle} />
