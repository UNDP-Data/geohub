<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { TagSearchKeys } from '$lib/config/AppConfig';
	import { getSelectedTagsFromUrl } from '$lib/helper';
	import type { Tag } from '$lib/types/Tag';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let selectedTags: Tag[] = getSelectedTagsFromUrl($page.url);
	export let isClearButtonShown = false;

	const handleTagDeleted = async (value: Tag) => {
		const tag = selectedTags?.find((t) => t.key === value.key && t.value === value.value);
		if (tag) {
			selectedTags.splice(selectedTags.indexOf(tag), 1);
			selectedTags = [...selectedTags];
		}

		const apiUrl = $page.url;
		TagSearchKeys.forEach((key) => {
			apiUrl.searchParams.delete(key.key);
		});
		selectedTags?.forEach((t) => {
			apiUrl.searchParams.append(t.key, t.value);
		});

		history.replaceState({}, null, apiUrl.toString());
		await invalidateAll();

		dispatch('change', {
			tags: selectedTags,
			reload: false
		});
	};

	const handleClear = () => {
		selectedTags = [];
		dispatch('change', {
			tags: selectedTags,
			reload: true
		});
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleClear();
		}
	};
</script>

{#if selectedTags.length > 0}
	<div class="container tag-container tags p-1 m-0 mb-2 pr-4">
		{#key selectedTags}
			{#each selectedTags as tag}
				<div class="tags has-addons p-0 pt-1 m-0">
					<div class="tag {tag.color}">{tag.value}</div>
					{#if isClearButtonShown}
						<div
							class="tag is-delete tag-delete"
							role="button"
							tabindex="0"
							on:click={() => handleTagDeleted(tag)}
							on:keydown={handleKeydown}
						/>
					{/if}
				</div>
			{/each}
		{/key}
		<div
			class="icon close-button"
			role="button"
			tabindex="0"
			on:click={handleClear}
			on:keydown={handleKeydown}
		>
			<i class="fas fa-xmark fa-lg" />
		</div>
	</div>
{/if}

<style lang="scss">
	.tag-container {
		position: relative;
		border: 1px solid gray;
		border-radius: 5px;
		-moz-border-radius: 5px;
		-webkit-border-radius: 5px;

		.close-button {
			position: absolute;
			top: 5px;
			right: 5px;
			cursor: pointer;
			color: gray;
		}
	}
</style>
