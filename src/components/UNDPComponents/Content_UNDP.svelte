<script lang="ts">
  import { onMount } from 'svelte'
  import Drawer, { AppContent, Content, Header } from '@smui/drawer'
  import LinearProgress from '@smui/linear-progress'

  import BucketView from '$components/BucketView.svelte'
  import LayerList from '$components/LayerList.svelte'
  import TagsView from '$components/TagsView.svelte'
  import { MARTIN_API_ENDPOINT, TabNames } from '$lib/constants'
  import { indicatorProgress, map, martinIndex } from '$stores'
  import BannerMessageControl from '$components/BannerMessageControl.svelte'
  import { fetchUrl } from '$lib/helper'
  import Tabs_UNDP from './Tabs_UNDP.svelte'

  export let drawerOpen = false

  let activeTab = TabNames.BUCKETS
  let drawerWidth = 355
  let hideLinearProgress = true
  let isResizingDrawer = false
  let tabs = [{ label: TabNames.BUCKETS }, { label: TabNames.TAGS }, { label: TabNames.LAYERS }]
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
    await getMartinIndex()
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
        <Header style="border-bottom: none;">
          <Tabs_UNDP bind:activeTab bind:tabs />
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
  .content-container {
    display: flex;
    flex-direction: column;
    height: 92vh;
    margin-top: 8vh;
    width: 100%;
  }
  :global(.app-content) {
    flex: auto;
    overflow: hidden;
    position: relative;
    height: 100%;
    flex-grow: 1;
    .main-content {
      overflow: hidden;
      display: flex;
      flex-grow: 1;
      z-index: -1;
      flex-direction: row;
      flex-wrap: wrap;
    }
  }

  $height: calc(100vh);

  @media (max-width: 768px) {
    $height: calc(100vh - 184px);
  }

  .content-container {
    position: absolute;
    display: flex;
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
