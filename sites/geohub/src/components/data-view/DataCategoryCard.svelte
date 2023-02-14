<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  import type { Breadcrumb } from '@undp-data/svelte-undp-design/package/interfaces'

  export let category: Breadcrumb
  export let size: 'small' | 'medium' = 'medium'

  const handleClick = () => {
    dispatch('clicked')
  }
</script>

{#if category}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="container p-2 is-flex is-flex-direction-column is-justify-content-center"
    on:click={handleClick}>
    <figure class="category image center {size === 'medium' ? 'is-64x64' : 'is-48x48'}">
      {#if category.icon.startsWith('fa')}
        <i class="{category.icon} fa-4x" />
      {:else}
        <img
          src={category.icon}
          alt="{category.name}_image" />
      {/if}
    </figure>
    {#if category.name}
      <p class="category {`${size === 'medium' ? 'title is-5' : 'subtitle is-6 '}`} center pt-2 has-text-weight-bold">
        {category.name}
      </p>
    {/if}
  </div>
{/if}

<style lang="scss">
  .container {
    .category {
      cursor: pointer;
    }

    .center {
      text-align: center;
      display: block;
      margin: 0 auto;
    }
  }
</style>
