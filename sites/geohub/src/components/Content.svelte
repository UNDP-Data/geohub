<script lang="ts">
  import DataView from '$components/DataView.svelte'
  import LayerList from '$components/LayerList.svelte'
  import { TabNames } from '$lib/constants'
  import { map, layerList } from '$stores'
  import BannerMessageControl from '$components/BannerMessageControl.svelte'
  import { Tabs } from '@undp-data/svelte-undp-design'
  import type { Tab } from '@undp-data/svelte-undp-design/interfaces'
  import ContentSidebar from './ContentSidebar.svelte'

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
