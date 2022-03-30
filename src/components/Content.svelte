<script lang="ts">
  import { onMount } from 'svelte'
  import { slide } from 'svelte/transition'
  import Banner, { Label as LabelBanner } from '@smui/banner'
  import Button from '@smui/button'
  import Drawer, { AppContent, Content, Header } from '@smui/drawer'
  import LinearProgress from '@smui/linear-progress'
  import Tab, { Label } from '@smui/tab'
  import TabBar from '@smui/tab-bar'
  import Fa from 'svelte-fa'
  import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'

  import LayerList from './LayerList.svelte'
  import TreeView from './TreeView.svelte'
  import { layerList, indicatorProgress } from '../stores'
  import { BannerTypes, ErrorCodes, LayerIconTypes, TabNames } from '../lib/constants'
  import type { Error } from '../lib/types'

  export let drawerOpen = false

  let activeTab = TabNames.LOAD_DATA
  let bannerType = ''
  let bannerMessage = ''
  let drawerWidth = 355
  let hideLinearProgress = true
  let isResizingDrawer = false
  let showBanner = false

  $: treeLgendExpanded = true
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

  onMount(() => {
    document.addEventListener('mousemove', (e) => handleMousemove(e))
    document.addEventListener('mouseup', handleMouseup)

    setTimeout(() => {
      treeLgendExpanded = false
    }, 5000)
  })

  const setContentContainerMargin = (margin: number) =>
    (document.querySelector<HTMLElement>('body > div > div.content-container > div').style.marginLeft = `${margin}px`)

  const handleMousemove = (e: MouseEvent | TouchEvent) => {
    if (!isResizingDrawer) return

    if (e instanceof MouseEvent) drawerWidth = e.clientX
    if (e instanceof TouchEvent) drawerWidth = e.touches?.[0].pageX

    setContentContainerMargin(drawerWidth)
  }

  const handleMousedown = () => (isResizingDrawer = true)
  const handleMouseup = () => (isResizingDrawer = false)

  const handlErrorCallback = (error: Error) => {
    bannerType = BannerTypes.ERROR
    bannerMessage = ErrorCodes[error.code]
    showBanner = true
  }
</script>

<div class="content-container">
  <Drawer variant="dismissible" bind:open={drawerOpen} style="width: {drawerWidth}px; max-width: {drawerWidth}px;">
    <div class="drawer-container">
      <div class="drawer-content" style="width: {drawerWidth - 10}px; max-width: {drawerWidth - 10}px;">
        <LinearProgress indeterminate bind:closed={hideLinearProgress} />
        <Header>
          <TabBar tabs={[TabNames.LOAD_DATA, TabNames.LAYERS]} let:tab bind:active={activeTab}>
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
        <Content style="padding-right: 15px;">
          <div hidden={activeTab !== TabNames.LOAD_DATA}>
            <TreeView {handlErrorCallback} />
            <div style="padding: 15px; padding-right: 0;">
              <div class="layer-actions" style="height: 20px;">
                <div transition:slide class="action">
                  <div class="header">
                    <div class="name" style="font-size: 11px;">Legend</div>
                    <div class="close" style="margin-right: 5px;">
                      {#if treeLgendExpanded === false}
                        <div on:click={() => (treeLgendExpanded = true)}>
                          <Fa icon={faChevronRight} size="sm" style="cursor: pointer;" />
                        </div>
                      {:else}
                        <div on:click={() => (treeLgendExpanded = false)}>
                          <Fa icon={faChevronRight} size="sm" style="cursor: pointer; transform: rotate(90deg);" />
                        </div>
                      {/if}
                    </div>
                  </div>

                  {#if treeLgendExpanded === true}
                    <div class="legend" transition:slide>
                      {#each LayerIconTypes as iconType}
                        <span style="margin-right: 10px;">
                          <Fa icon={iconType.icon} size="sm" primaryColor={iconType.color} />&nbsp;&nbsp; {iconType.label}
                        </span>
                      {/each}
                    </div>
                  {/if}
                </div>
              </div>
            </div>
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
    <Banner bind:open={showBanner} fixed mobileStacked content$style="max-width: max-content;">
      <LabelBanner slot="label" style="font-family: ProximaNova, sans-serif; font-size: 13px;">
        <span style="font-weight: bold;">{bannerType}:</span>
        {bannerMessage}
      </LabelBanner>
      <Button slot="actions">Dismiss</Button>
    </Banner>

    <main class="main-content">
      <slot />
    </main>
  </AppContent>
</div>

<style lang="scss">
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

  .layer-actions {
    margin-top: 10px;

    .action {
      margin-bottom: 25px;

      .header {
        display: flex;
        justify-content: left;
        align-items: center;
        margin-top: 15px;
        background: #f0f0f0;
        border-radius: 7.5px;
        padding: 2.5px;
        padding-left: 7.5px;
        margin-bottom: 10px;

        .name {
          width: 100%;
        }

        @media (prefers-color-scheme: dark) {
          background: #323234;
          border-color: #30363d;
          color: white;
        }
      }

      .legend {
        display: flex;
        justify-content: left;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        padding-left: 10px;

        @media (prefers-color-scheme: dark) {
          color: white;
        }
      }
    }
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
      display: flex;
      height: $height;

      .drawer-content {
        display: flex;
        flex-direction: column;
        flex-basis: 100%;
        flex: 1;
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
