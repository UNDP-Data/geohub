<script lang="ts">
  import Drawer, { AppContent, Content, Header } from '@smui/drawer'
  import Tab, { Label } from '@smui/tab'
  import TabBar from '@smui/tab-bar'

  import LayerList from './LayerList.svelte'
  import TreeView from './TreeView.svelte'
  import { wtree } from '../stores/stores'

  export let open = false

  let active = 'Load'

  const TAB_LABEL_LOAD_DATA = 'Load data'
  const TAB_LABEL_LAYERS = 'Layers'
  const TAB_LABEL_ANALYZE = 'Analyze'
</script>

<div class="drawer-container">
  <Drawer variant="dismissible" bind:open>
    <Header>
      <TabBar tabs={[TAB_LABEL_LOAD_DATA, TAB_LABEL_LAYERS]} let:tab bind:active>
        <Tab {tab} class="tab">
          <Label>{tab}</Label>
        </Tab>
      </TabBar>
    </Header>

    <Content>
      {#if active === TAB_LABEL_LOAD_DATA}
        <TreeView tree={$wtree.tree} />
      {:else if active === TAB_LABEL_LAYERS}
        <LayerList />
      {:else if active === TAB_LABEL_ANALYZE}
        Analyze
      {/if}
    </Content>
  </Drawer>

  <AppContent class="app-content ">
    <main class="main-content">
      <slot />
    </main>
  </AppContent>
</div>

<style>
  :global(.s-k9Xq-arq2lfR) {
    font-family: Calibri, serif;
  }
  .drawer-container {
    position: absolute;
    display: flex;
    height: calc(100vh - calc(64px + 48px));
    width: 100%;
    overflow: auto;
    z-index: 0;
    flex-grow: 1;
  }
  :global(.app-content) {
    flex: auto;
    overflow: auto;
    position: relative;
    flex-grow: 1;
  }

  .main-content {
    overflow: hidden;
    display: flex;
    height: 100%;
    flex-grow: 1;
    z-index: -1;
    flex-direction: row;
    flex-wrap: wrap;
  }
  :global(.contracted-browser) {
    height: 60%;
  }
  :global(.expanded-browser) {
    height: 100%;
  }
  :global(.expanded) {
    display: inline-block;
    max-height: 40%;
    min-height: auto;
    /* height: 150px; */
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
    overflow: auto;
  }
</style>
