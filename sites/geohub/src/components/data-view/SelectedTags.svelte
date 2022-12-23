<script lang="ts">
  import type { Tag } from '$lib/types/Tag'

  export let selectedTags: Tag[] = []
  export let isClearButtonShown = false

  const handleTagDeleted = (value: Tag) => {
    const tag = selectedTags?.find((t) => t.key === value.key && t.value === value.value)
    if (tag) {
      selectedTags.splice(selectedTags.indexOf(tag), 1)
      selectedTags = [...selectedTags]
    }
  }

  const handleClear = () => {
    selectedTags = []
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleClear()
    }
  }
</script>

{#if selectedTags.length > 0}
  <div class="container tag-container p-1 m-0 mb-2 pr-4">
    {#each selectedTags as tag}
      <span class="tag is-small m-1 {tag.color}">
        {tag.value}
        {#if isClearButtonShown}
          <button
            class="delete is-small"
            on:click={() => handleTagDeleted(tag)} />
        {/if}
      </span>
    {/each}
    <span
      class="icon close-button has-tooltip-arrow has-tooltip-left"
      data-tooltip="Delete all tags"
      role="button"
      tabindex="0"
      on:click={handleClear}
      on:keydown={handleKeydown}>
      <i class="fas fa-xmark fa-lg" />
    </span>
  </div>
{/if}

<style lang="scss">
  .tag-container {
    position: relative;
    border: 1px solid gray;
    border-radius: 25px;
    -moz-border-radius: 25px;
    -webkit-border-radius: 25px;

    .close-button {
      position: absolute;
      top: 8px;
      right: 10px;
      cursor: pointer;
      color: gray;
    }
  }
</style>
