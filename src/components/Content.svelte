<script lang="ts">
  import { onMount } from 'svelte'
  import Drawer, { AppContent, Content } from '@smui/drawer'
  import Tab, { Label } from '@smui/tab'
  import TabBar from '@smui/tab-bar'

  import LayerList from './LayerList.svelte'
  import TreeView from './TreeView.svelte'
  import { wtree } from '../stores/stores'
  import { TabNames } from '../lib/constants'

  export let drawerOpen = false
  let activeTab = TabNames.LoadData
  let isResizingDrawer = false
  let drawerWidth = 300

  $: {
    if (drawerOpen) {
      try {
        setContentContainerMargin(drawerWidth)
      } catch (e) {} // eslint-disable-line
    } else {
      setContentContainerMargin(0)
    }
  }

  onMount(() => {
    document.addEventListener('mousemove', (e) => handleMousemove(e))
    document.addEventListener('mouseup', handleMouseup)
  })

  const handleMousemove = (e: MouseEvent) => {
    if (!isResizingDrawer) return
    drawerWidth = e.clientX
    setContentContainerMargin(drawerWidth)
  }

  const handleMousedown = () => (isResizingDrawer = true)
  const handleMouseup = () => (isResizingDrawer = false)
  const setContentContainerMargin = (margin: number) =>
    (document.querySelector<HTMLElement>('body > div > div.content-container > div').style.marginLeft = `${margin}px`)
</script>

<div class="content-container">
  <Drawer variant="dismissible" bind:open={drawerOpen} style="width: {drawerWidth}px;" on:op>
    <div class="drawer-container">
      <div class="drawer-content" style="width: {drawerWidth}px;">
        <TabBar tabs={[TabNames.LoadData, TabNames.Layers]} let:tab bind:active={activeTab}>
          <Tab {tab} class="tab">
            <Label>{tab}</Label>
          </Tab>
        </TabBar>
        <Content>
          {#if activeTab === TabNames.LoadData}
            <TreeView tree={$wtree.tree} />
          {:else if activeTab === TabNames.Layers}
            <LayerList />
          {:else if activeTab === TabNames.Analyze}
            Analyze
          {/if}
        </Content>
      </div>
      <div
        class="drawer-divider"
        on:mousedown={handleMousedown}
        on:mousemove={handleMousemove}
        on:mouseup={handleMouseup}
      >
        <div class="custom-handle">||</div>
      </div>
    </div>
  </Drawer>

  <AppContent class="app-content">
    <main class="main-content">
      <slot />
    </main>
  </AppContent>
</div>

<style>
  :global(.s-k9Xq-arq2lfR) {
    font-family: Calibri, serif;
  }
  .content-container {
    position: absolute;
    display: flex;
    height: calc(100vh - 64px);
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

    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
    overflow: auto;
  }
  .drawer-content {
    display: flex;
    flex-direction: column;
    flex-basis: 100%;
    flex: 1;
  }
  .drawer-divider {
    width: 9px;
    background-color: #f4f7f9;
    cursor: ew-resize;
  }
  .drawer-container {
    display: flex;
    height: calc(100vh - 64px);
  }
  .custom-handle {
    position: relative;
    width: 8px;
    height: 100%;
    left: 25%;
    display: flex;
    align-items: center;
    pointer-events: none;
  }
</style>
