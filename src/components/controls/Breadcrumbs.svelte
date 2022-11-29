<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { DataCategory } from '$lib/types'

  const dispatch = createEventDispatcher()

  export let breadcrumbs: DataCategory[]

  const handleClicked = (index: number) => {
    const breadcrumb = breadcrumbs[index]
    dispatch('clicked', {
      index,
      breadcrumb,
    })
  }
</script>

{#if breadcrumbs && breadcrumbs.length > 0}
  <nav
    aria-label="breadcrumb"
    data-viewport="true"
    class="breadcrumb-undp inviewport">
    <ul>
      {#each breadcrumbs as breadcrumb, index}
        {#if index < breadcrumbs.length - 1}
          <li>
            <!-- svelte-ignore a11y-missing-attribute -->
            <a
              aria-label={breadcrumb.name}
              on:click={() => handleClicked(index)}>{breadcrumb.name}</a>
          </li>
        {:else}
          <li>{breadcrumb.name}</li>
        {/if}
      {/each}
    </ul>
  </nav>
{/if}

<style lang="scss">
  @use '../../styles/undp-design/base-minimal.min.css';
  @use '../../styles/undp-design/breadcrumbs.min.css';
</style>
