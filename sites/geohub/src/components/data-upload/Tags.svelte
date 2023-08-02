<script lang="ts">
	import type { Tag } from '$lib/types/Tag';
	import TagInput from './TagInput.svelte';

	export let tags: Tag[] = [];
	let inputTag: Tag = {
		key: '',
		value: ''
	};

	const handleTagAdded = (e) => {
		const addedTag = e.detail.tag;
		tags = [...tags, addedTag];

		inputTag = { key: '', value: '' };
	};

	const handleTagDeleted = (e) => {
		const deletedTag = e.detail.tag;
		const index = tags.findIndex((t) => {
			return t.key === deletedTag.key && t.value === deletedTag.value;
		});
		if (index > -1) {
			tags.splice(index, 1);
			tags = [...tags];
		}
	};

	// `addButonDisable` looks not being used. I comment the following code block.
	// let addButonDisable = false
	// $: tags, setAddButtonDisable()
	// const setAddButtonDisable = () => {
	//   if (tags.length > 0) {
	//     const last = tags[tags.length - 1]
	//     if (last.key.length === 0 && last.value.length === 0) {
	//       addButonDisable = true
	//       return
	//     }
	//   }
	//   addButonDisable = false
	// }
</script>

{#each tags as tag}
	<TagInput bind:tag on:deleted={handleTagDeleted} />
{/each}
<TagInput bind:tag={inputTag} isAdd={true} on:added={handleTagAdded} />
