<script lang="ts">
	import UserPermission from '$components/pages/data/datasets/UserPermission.svelte';
	import BackToPreviousPage from '$components/util/BackToPreviousPage.svelte';
	import { getAccessLevelIcon } from '$lib/helper';
	import type { PageData } from './$types';

	export let data: PageData;

	const accessIcon = getAccessLevelIcon(data.feature.properties.access_level, true);
</script>

<div class="m-4 py-5">
	<div class="is-flex">
		<p class="title is-3 px-2 m-0">
			{#if accessIcon}
				<i class="{accessIcon} p-1 pr-2" />
			{/if}
			{data.feature.properties.name}
		</p>
	</div>

	<div class="mt-2"><BackToPreviousPage defaultLink="/data/{data.feature.properties.id}" /></div>

	<UserPermission bind:dataset={data.feature} />
</div>
