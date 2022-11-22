<script lang="ts">
  import type { DataCategory } from '$lib/types'

  export let category: DataCategory
  export let size: 'small' | 'medium' = 'medium'
</script>

{#if category}
  <div class="category border p-2">
    <figure class="image center {size === 'medium' ? 'is-64x64' : 'is-48x48'}">
      <img
        src={category.icon}
        alt="{category.name}_image" />
    </figure>
    {#if category.name}
      <p class="title is-5 center">{category.name}</p>
    {/if}
  </div>
{/if}

<style lang="scss">
  .category {
    cursor: pointer;
  }

  .border {
    border: 0.1em solid #000000;

    .center {
      text-align: center;
      display: block;
      margin: 0 auto;
    }
  }
</style>
