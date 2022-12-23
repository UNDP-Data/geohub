<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import DataView from '$components/DataView.svelte'
  import LayerList from '$components/LayerList.svelte'
  import { TabNames } from '$lib/constants'
  import { map, layerList, indicatorProgress } from '$stores'
  import BannerMessageControl from '$components/BannerMessageControl.svelte'
  import { Tabs } from '@undp-data/svelte-undp-design'
  import type { Tab } from '@undp-data/svelte-undp-design/interfaces'
  import ContentSidebar from './ContentSidebar.svelte'
  import { onMount } from 'svelte'
  import type { StyleSpecification } from 'maplibre-gl'

  export let drawerOpen = false
  export let headerHeight: number = undefined
  let tabsHeight: number

  let tabs: Tab[] = [
    {
      label: TabNames.DATA,
      icon: 'fas fa-database',
    },
    {
      label: TabNames.LAYERS,
      icon: 'fas fa-layer-group',
      labelFunction: (label: string) => {
        if ($layerList.length === 0) {
          return label
        } else {
          return `${label} (${$layerList.length})`
        }
      },
    },
  ]
  let activeTab: string = tabs[0].label

  onMount(async () => {
    try {
      $indicatorProgress = true
      const styleId = $page.url.searchParams.get('style')
      if (!(styleId && $layerList.length === 0)) return
      const res = await fetch(`/api/style/${styleId}`)
      if (!res.ok) {
        $page.url.searchParams.delete('style')
        goto(`?${$page.url.searchParams.toString()}`)
        return
      }
      const styleInfo = await res.json()
      if (styleInfo.layers) {
        $layerList = styleInfo.layers
        const style: StyleSpecification = styleInfo.style
        $map.setStyle(style)
        $map.flyTo({
          center: [style.center[0], style.center[1]],
          zoom: style.zoom,
          bearing: style.bearing,
          pitch: style.pitch,
        })
        activeTab = TabNames.LAYERS
      }
    } finally {
      $indicatorProgress = false
    }
  })
</script>

<ContentSidebar
  bind:map={$map}
  bind:isMenuShown={drawerOpen}>
  <div slot="primary">
    <div class="drawer-content">
      {#key $layerList}
        <Tabs
          bind:tabs
          bind:activeTab
          fontSize="large"
          bind:height={tabsHeight} />
      {/key}

      <div class="container p-0 m-0">
        <div hidden={activeTab !== TabNames.DATA}>
          <DataView
            bind:headerHeight
            bind:tabsHeight />
        </div>
        <div hidden={activeTab !== TabNames.LAYERS}>
          <LayerList
            bind:headerHeight
            bind:tabsHeight />
        </div>
      </div>
    </div>
  </div>
  <div slot="secondary">
    <BannerMessageControl>
      <slot />
    </BannerMessageControl>
  </div>
</ContentSidebar>
