<script lang="ts">
  import DataView from '$components/DataView.svelte'
  import LayerList from '$components/LayerList.svelte'
  import { TabNames } from '$lib/constants'
  import { layerList } from '$stores'
  import { Tabs } from '@undp-data/svelte-undp-design'
  import type { Tab } from '@undp-data/svelte-undp-design/dist/interfaces'

  export let splitterHeight: number
  let tabsHeight: number
  $: contentHeight = splitterHeight - tabsHeight

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
      <DataView bind:contentHeight />
    </div>
    <div hidden={activeTab !== TabNames.LAYERS}>
      <LayerList
        bind:contentHeight
        bind:activeTab />
    </div>
  </div>
</div>
