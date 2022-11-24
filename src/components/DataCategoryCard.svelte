<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  import type { DataCategory } from '$lib/types'

  export let category: DataCategory
  export let size: 'small' | 'medium' = 'medium'

  const handleClick = () => {
    dispatch('clicked')
  }
</script>

{#if category}
  <div
    class="category border p-2"
    on:click={handleClick}>
    <figure class="image center {size === 'medium' ? 'is-64x64' : 'is-48x48'}">
      {#if category.icon.startsWith('fa')}
        <i class="{category.icon} fa-4x" />
      {:else}
        <img
          src={category.icon}
          alt="{category.name}_image" />
      {/if}
    </figure>
    {#if category.name}
      <p class="title is-5 center pt-2">{category.name}</p>
    {/if}
  </div>
{/if}

<style lang="scss">
  .category {
    cursor: pointer;
  }

  .border {
    border: 0.1em solid gray;

    .center {
      text-align: center;
      display: block;
      margin: 0 auto;
    }
  }
</style>
