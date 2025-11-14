<script lang="ts">
	import ElectricityDataTimelineControl from './ElectricityDataTimelineControl.svelte';
	import ColormapChanger from './ColormapChanger.svelte';
	import { ELECTRICITY_DATATYPE_CONTEXT_KEY } from '../stores/electricityDataType';

	import { onDestroy, onMount, setContext } from 'svelte';
	import { loadAdmin, unloadAdmin } from '../utils/adminLayer';

	let { electricityDataType = $bindable() } = $props();

	setContext(ELECTRICITY_DATATYPE_CONTEXT_KEY, electricityDataType);

	onMount(() => {
		loadAdmin();
	});

	onDestroy(() => {
		unloadAdmin();
	});
</script>

<ElectricityDataTimelineControl bind:electricityDataType />
<ColormapChanger />
