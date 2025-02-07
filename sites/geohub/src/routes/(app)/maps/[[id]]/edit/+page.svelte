<script lang="ts">
	import Map from '$components/pages/map/Map.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data = $bindable() }: Props = $props();
</script>

<Map defaultStyle={data.config.DefaultMapStyle} />
