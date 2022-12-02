<script lang="ts">
  import DataView from '$components/DataView.svelte'
  import LayerList from '$components/LayerList.svelte'
  import { TabNames } from '$lib/constants'
  import { map } from '$stores'
  import BannerMessageControl from '$components/BannerMessageControl.svelte'
  import Tabs from './controls/Tabs.svelte'
  import ContentSidebar from './ContentSidebar.svelte'
  import type { Tab } from '$lib/types'

  export let drawerOpen = false
  export let headerHeight: number
  let tabsHeight: number

  let tabs: Tab[] = [
    { label: TabNames.DATA, icon: 'fas fa-database' },
    { label: TabNames.LAYERS, icon: 'fas fa-layer-group' },
  ]
  let activeTab: string = tabs[0].label
</script>

<ContentSidebar
  bind:map={$map}
  bind:isMenuShown={drawerOpen}
  bind:headerHeight>
  <div slot="primary">
    <div class="drawer-content">
      <Tabs
        bind:tabs
        bind:activeTab
        bind:height={tabsHeight} />

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
