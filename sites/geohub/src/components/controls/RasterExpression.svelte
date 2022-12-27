<script lang="ts">
  import type { Layer } from '$lib/types'
  import RasterFilter from '$components/controls/RasterFilter.svelte'
  import RasterFilterSimple from '$components/controls/RasterFilterSimple.svelte'
  import { Tabs } from '@undp-data/svelte-undp-design'

  export let layer: Layer

  let activeTab = 'Simple'
  let isAdvancedPanelVisible = false
  let isSimplePanelVisible = false

  $: {
    isAdvancedPanelVisible = false
    isSimplePanelVisible = false

    switch (activeTab) {
      case 'Advanced':
        isAdvancedPanelVisible = true
        isSimplePanelVisible = false
        break
      case 'Simple':
        isSimplePanelVisible = true
        isAdvancedPanelVisible = false
        break

      default:
        break
    }
  }

  let tabs = [
    { label: 'Simple', icon: 'fa-solid fa-thumbs-up' },
    { label: 'Advanced', icon: 'fa-solid fa-magnifying-glass-plus' },
  ]
</script>

<nav class="block">
  <Tabs
    bind:tabs
    bind:activeTab
    fontSize="small" />

  <div class="block" />
  <p>
    {#if isSimplePanelVisible === true}
      <RasterFilterSimple bind:layer />
    {/if}
    {#if isAdvancedPanelVisible}
      <RasterFilter bind:layer />
    {/if}
  </p>
</nav>
