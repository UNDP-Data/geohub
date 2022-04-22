<script lang="ts">
  import { onMount } from 'svelte'
  import Banner, { Label as LabelBanner } from '@smui/banner'
  import Button from '@smui/button'
  import Drawer, { AppContent, Content, Header } from '@smui/drawer'
  import LinearProgress from '@smui/linear-progress'
  import Tab, { Label } from '@smui/tab'
  import TabBar from '@smui/tab-bar'
  import Fa from 'svelte-fa'
  import { faCircleInfo } from '@fortawesome/free-solid-svg-icons/faCircleInfo'
  import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'

  import BucketView from '$components/BucketView.svelte'
  import LayerList from '$components/LayerList.svelte'
  import TreeView from '$components/TreeView.svelte'
  import { layerList, indicatorProgress, map, bannerMessages } from '$stores'
  import { StatusTypes, TabNames } from '$lib/constants'

  export let drawerOpen = false

  let activeTab = TabNames.LOAD_DATA
  let drawerWidth = 355
  let hideLinearProgress = true
  let isResizingDrawer = false
  let showBanner = false
  let tabs = [TabNames.LOAD_DATA, TabNames.BUCKETS, TabNames.LAYERS]

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

  // show banner when content store available
  $: {
    if ($bannerMessages.length > 0) {
      showBanner = false
      setTimeout(() => {
        showBanner = true
      }, 500)
    }
  }

  onMount(() => {
    document.addEventListener('mousemove', (e) => handleMousemove(e))
    document.addEventListener('mouseup', handleMouseup)
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

  const hideBanner = () => {
    setTimeout(() => {
      showBanner = false
    }, 350)
    $bannerMessages = []
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
        <Header>
          <TabBar {tabs} let:tab bind:active={activeTab}>
            <Tab {tab} class="tab">
              <Label>
                {tab}
                {#if tab === TabNames.LAYERS}
                  ({$layerList.length})
                {/if}
              </Label>
            </Tab>
          </TabBar>
        </Header>
        <Content style="padding-right: 15px; overflow: visible;">
          <div hidden={activeTab !== TabNames.LOAD_DATA}>
            <TreeView />
          </div>
          <div hidden={activeTab !== TabNames.BUCKETS}>
            <BucketView />
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
    <Banner bind:open={showBanner} fixed mobileStacked content$style={`max-width: max-content; height:`}>
      <LabelBanner
        slot="label"
        style={`font-family: ProximaNova, sans-serif; font-size: 13px; max-width: 600px; min-height: 60px;`}>
        {#each $bannerMessages as row}
          <div class="banner-container">
            <div class="icon">
              {#if row.type === StatusTypes.INFO}
                <Fa icon={faCircleInfo} size="2x" primaryColor="hsl(204, 86%, 53%)" />
              {:else if row.type === StatusTypes.DANGER}
                <Fa icon={faBan} size="2x" primaryColor="hsl(348, 100%, 61%)" />
              {/if}
            </div>
            <div class="content">
              <div class="subtitle">{row.title}</div>
              <div class="message">{row.message}</div>
            </div>
          </div>
        {/each}
      </LabelBanner>
      <Button slot="actions" on:click={() => hideBanner()}>Dismiss</Button>
    </Banner>

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
      .drawer -divider {
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

  .banner-container {
    align-items: center;
    display: flex;
    gap: 20px;
    justify-content: left;
    margin-bottom: 20px;

    .content {
      .subtitle {
        margin: 0;
        margin-bottom: 10px;

        @media (prefers-color-scheme: dark) {
          color: white;
        }
      }

      .message {
        background: #fff;

        @media (prefers-color-scheme: dark) {
          background: #212125;
          color: white;
        }
      }
    }
  }
</style>
