<script lang="ts">
	import { ClassificationMethods } from '$lib/config/AppConfig';
	import type { ClassificationMethodStore } from '$stores';
	import { createEventDispatcher, getContext } from 'svelte';

	export let contextKey: string;

	const classificationMethodStore: ClassificationMethodStore = getContext(contextKey);

	const dispatch = createEventDispatcher();

	let classificationMethods = ClassificationMethods;

	const handleClassificationChange = () => {
		dispatch('change', {
			classification_method: $classificationMethodStore
		});
	};
</script>

<div class="select is-normal is-fullwidth">
	<select bind:value={$classificationMethodStore} on:change={handleClassificationChange}>
		{#each classificationMethods as classificationMethod}
			<option class="legend-text" title="Classification Method" value={classificationMethod.code}
				>{classificationMethod.name}</option
			>
		{/each}
	</select>
</div>
