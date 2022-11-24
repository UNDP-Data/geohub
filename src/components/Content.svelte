<script lang="ts">
  import BucketView from '$components/BucketView.svelte'
  import DataView from '$components/DataView.svelte'
  import LayerList from '$components/LayerList.svelte'
  import TagsView from '$components/TagsView.svelte'
  import { TabNames } from '$lib/constants'
  import { map } from '$stores'
  import BannerMessageControl from '$components/BannerMessageControl.svelte'
  import Tabs from './Tabs.svelte'
  import ContentSidebar from './ContentSidebar.svelte'

  export let drawerOpen = false

  let activeTab = TabNames.DATA
  let tabs = [
    // { label: TabNames.BUCKETS },
    { label: TabNames.DATA },
    // { label: TabNames.TAGS },
    { label: TabNames.LAYERS },
  ]
</script>

<ContentSidebar
  bind:map={$map}
  bind:isMenuShown={drawerOpen}>
  <div slot="primary">
    <div class="drawer-content">
      <nav class="panel">
        <div class="panel-block">
          <Tabs
            bind:activeTab
            bind:tabs />
        </div>
        <div class="container p-0 m-0">
          <!-- <div hidden={activeTab !== TabNames.BUCKETS}>
            <BucketView />
          </div> -->
          <div hidden={activeTab !== TabNames.DATA}>
            <DataView />
          </div>
          <!-- <div hidden={activeTab !== TabNames.TAGS}>
            <TagsView />
          </div> -->
          <div hidden={activeTab !== TabNames.LAYERS}>
            <LayerList />
          </div>
        </div>
      </nav>
    </div>
  </div>
  <div slot="secondary">
    <BannerMessageControl>
      <slot />
    </BannerMessageControl>
  </div>
</ContentSidebar>
