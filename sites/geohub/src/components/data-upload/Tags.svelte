<script lang="ts">
  import type { Tag } from '$lib/types/Tag'
  import TagInput from './TagInput.svelte'

  let tags: Tag[] = []
  let inputTag: Tag = {
    key: '',
    value: '',
  }

  const handleTagAdded = (e) => {
    const addedTag = e.detail.tag
    tags = [...tags, addedTag]

    inputTag = { key: '', value: '' }
  }

  const handleTagDeleted = (e) => {
    const deletedTag = e.detail.tag
    const index = tags.findIndex((t) => {
      t.key === deletedTag.key && t.value === deletedTag.value
    })
    if (index === -1) return
    tags.splice(index, 1)
  }

  let addButonDisable = false
  $: tags, setAddButtonDisable()
  const setAddButtonDisable = () => {
    if (tags.length > 0) {
      const last = tags[tags.length - 1]
      if (last.key.length === 0 && last.value.length === 0) {
        addButonDisable = true
        return
      }
    }
    addButonDisable = false
  }
</script>

<div class="field">
  <!-- <div class="is-flex is-flex-direction-row is-align-items-center"> -->
  <label class="label">Tags</label>

  <!-- <button
      class="button add-button"
      disabled={addButonDisable}
      on:click={addTagInput}>
      <span class="icon is-small">
        <i class="fa-solid fa-plus" />
      </span>
    </button> -->
  <!-- </div> -->

  <div class="control">
    {#each tags as tag}
      <TagInput
        bind:tag
        on:deleted={handleTagDeleted} />
    {/each}
    <TagInput
      bind:tag={inputTag}
      isAdd={true}
      on:added={handleTagAdded} />
  </div>
</div>

<style lang="scss">
  .add-button {
    margin-left: auto;
  }
</style>
