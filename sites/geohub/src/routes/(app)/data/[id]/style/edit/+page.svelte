<script lang="ts">
	import { getAccessLevelIcon } from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import type { PageData } from './$types';

	export let data: PageData;

	let feature: DatasetFeature = data.feature;

	const accessIcon = getAccessLevelIcon(feature.properties.access_level, true);
</script>

<div class="m-4 py-5">
	<div class="is-flex">
		<p class="title is-3 px-2 m-0">
			{#if accessIcon}
				<i class="{accessIcon} p-1 pr-2" />
			{/if}
			{feature.properties.name}
		</p>
	</div>
</div>
