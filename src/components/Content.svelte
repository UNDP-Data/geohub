<script lang="ts">
  import { onMount } from 'svelte'
  import Drawer, { AppContent, Content, Header } from '@smui/drawer'
  import LinearProgress from '@smui/linear-progress'
  import Tab, { Label } from '@smui/tab'
  import TabBar from '@smui/tab-bar'

  import BucketView from '$components/BucketView.svelte'
  import LayerList from '$components/LayerList.svelte'
  import TagsView from '$components/TagsView.svelte'
  import { MARTIN_API_ENDPOINT, TabNames } from '$lib/constants'
  import { layerList, indicatorProgress, map, martinIndex } from '$stores'
  import BannerMessageControl from './BannerMessageControl.svelte'
  import { fetchUrl } from '$lib/helper'

  export let drawerOpen = false

  let activeTab = TabNames.BUCKETS
  let drawerWidth = 355
  let hideLinearProgress = true
  let isResizingDrawer = false
  let tabs = [TabNames.BUCKETS, TabNames.TAGS, TabNames.LAYERS]

  $: hideLinearProgress = !$indicatorProgress
  $: {
    if (drawerOpen) {
      try {
        setContentContainerMargin(drawerWidth)
      } catch (e) {} // eslint-disable-line
    } else {
      setContentContainerMargin(0)
    }
  }

  onMount(async () => {
    document.addEventListener('mousemove', (e) => handleMousemove(e))
    document.addEventListener('mouseup', handleMouseup)
    getMartinIndex()
  })

  const setContentContainerMargin = (margin: number) => {
    document.querySelector<HTMLElement>('body > div > div.content-container > div').style.marginLeft = `${margin}px`
    $map.triggerRepaint()
    $map.resize()
  }

  const handleMousemove = (e: MouseEvent | TouchEvent) => {
    if (!isResizingDrawer) return

    if (e instanceof MouseEvent) drawerWidth = e.clientX
    if (e instanceof TouchEvent) drawerWidth = e.touches?.[0].pageX

    setContentContainerMargin(drawerWidth)
  }

  const handleMousedown = () => (isResizingDrawer = true)
  const handleMouseup = () => (isResizingDrawer = false)

  const getMartinIndex = async () => {
    if ($martinIndex) return
    const data = await fetchUrl(`${MARTIN_API_ENDPOINT}/index.json`)
    martinIndex.update(() => data)
  }
</script>

<div class="content-container">
  <Drawer
    variant="dismissible"
    bind:open={drawerOpen}
    style="width: {drawerWidth}px; max-width: {drawerWidth}px; overflow:visible;">
    <div class="drawer-container">
      <div class="drawer-content" style="width: {drawerWidth - 10}px; max-width: {drawerWidth - 10}px;">
        <LinearProgress indeterminate bind:closed={hideLinearProgress} />
        <Header style="margin-top: 10px;">
          <TabBar {tabs} let:tab bind:active={activeTab}>
            <Tab {tab} class="tab" style="height: 40px; font-family: ProximaNova, sans-serif;">
              <Label style="font-weight: normal; text-transform: capitalize;">
                {tab}
                {#if tab === TabNames.LAYERS && $layerList.length > 0}
                  ({$layerList.length})
                {/if}
              </Label>
            </Tab>
          </TabBar>
        </Header>
        <Content style="padding-right: 15px;">
          <div hidden={activeTab !== TabNames.BUCKETS}>
            <BucketView />
          </div>
          <div hidden={activeTab !== TabNames.TAGS}>
            <TagsView />
          </div>
          <div hidden={activeTab !== TabNames.LAYERS}>
            <LayerList />
          </div>
        </Content>
      </div>
      <div
        class="drawer-divider"
        on:mousedown={handleMousedown}
        on:touchstart={handleMousedown}
        on:mousemove={handleMousemove}
        on:touchmove={handleMousemove}
        on:mouseup={handleMouseup}
        on:touchend={handleMouseup}>
        <div class="custom-handle">||</div>
      </div>
    </div>
  </Drawer>

  <AppContent class="app-content">
    <BannerMessageControl />
    <main class="main-content">
      <slot />
    </main>
  </AppContent>
</div>

<style lang="scss">
  @import '../styles/bulma.css';

  :global(.app-content) {
    flex: auto;
    overflow: auto;
    position: relative;
    flex-grow: 1;

    .main-content {
      overflow: hidden;
      display: flex;
      height: 100%;
      flex-grow: 1;
      z-index: -1;
      flex-direction: row;
      flex-wrap: wrap;
    }
  }

  $height: calc(100vh - 64px);

  @media (max-width: 768px) {
    $height: calc(100vh - 184px);
  }

  .content-container {
    position: absolute;
    display: flex;
    height: $height;
    width: 100%;
    overflow: auto;
    z-index: 0;
    flex-grow: 1;

    .drawer-container {
      position: relative;
      display: flex;
      height: $height;
      overflow: hidden;

      .drawer-content {
        overflow: auto;
        display: flex;
        flex-direction: column;
        flex-basis: 100%;
        flex: 1;
      }
      ::-webkit-scrollbar {
        width: 2px;
        height: 2px;
      }
      ::-webkit-scrollbar-thumb {
        background-color: grey;
      }
      .drawer-divider {
        width: 9px;
        @media only screen and (max-width: 760px) {
          width: 15px;
        }

        background-color: #f4f7f9;
        cursor: ew-resize;
      }

      .custom-handle {
        position: relative;
        width: 8px;
        height: 100%;
        left: 25%;
        display: flex;
        align-items: center;
        pointer-events: none;
        color: black;
      }
    }
  }
</style>
