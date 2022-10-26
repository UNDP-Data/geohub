<script lang="ts">
  import { onMount } from 'svelte'
  import BucketView from '$components/BucketView.svelte'
  import LayerList from '$components/LayerList.svelte'
  import TagsView from '$components/TagsView.svelte'
  import { PUBLIC_MARTIN_API_ENDPOINT } from '$lib/variables/public'
  import { TabNames } from '$lib/constants'
  import { map, martinIndex } from '$stores'
  import BannerMessageControl from '$components/BannerMessageControl.svelte'
  import { fetchUrl } from '$lib/helper'
  import Tabs from './Tabs.svelte'
  import ContentSidebar from './ContentSidebar.svelte'

  export let drawerOpen = false

  let activeTab = TabNames.BUCKETS
  let tabs = [{ label: TabNames.BUCKETS }, { label: TabNames.TAGS }, { label: TabNames.LAYERS }]

  onMount(async () => {
    await getMartinIndex()
  })

  const getMartinIndex = async () => {
    if ($martinIndex) return
    const data = await fetchUrl(`${PUBLIC_MARTIN_API_ENDPOINT}/index.json`)
    martinIndex.update(() => data)
  }
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
          <div hidden={activeTab !== TabNames.BUCKETS}>
            <BucketView />
          </div>
          <div hidden={activeTab !== TabNames.TAGS}>
            <TagsView />
          </div>
          <div hidden={activeTab !== TabNames.LAYERS}>
            <LayerList />
          </div>
        </div>
      </nav>
    </div>
  </div>
  <div slot="secondary">
    <BannerMessageControl />
    <slot />
  </div>
</ContentSidebar>
