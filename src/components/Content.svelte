<script lang="ts">
  import DataView from '$components/DataView.svelte'
  import LayerList from '$components/LayerList.svelte'
  import { TabNames } from '$lib/constants'
  import { map } from '$stores'
  import BannerMessageControl from '$components/BannerMessageControl.svelte'
  import Tabs from './controls/Tabs.svelte'
  import ContentSidebar from './ContentSidebar.svelte'

  export let drawerOpen = false

  let tabs = [{ label: TabNames.DATA }, { label: TabNames.LAYERS }]
  let activeTab: string = tabs[0].label
</script>

<ContentSidebar
  bind:map={$map}
  bind:isMenuShown={drawerOpen}>
  <div slot="primary">
    <div class="drawer-content">
      <Tabs
        bind:tabs
        bind:activeTab>
        <div class="container p-0 m-0">
          {#if activeTab === TabNames.DATA}
            <DataView />
          {:else if activeTab === TabNames.LAYERS}
            <LayerList />
          {/if}
        </div>
      </Tabs>
    </div>
  </div>
  <div slot="secondary">
    <BannerMessageControl>
      <slot />
    </BannerMessageControl>
  </div>
</ContentSidebar>
