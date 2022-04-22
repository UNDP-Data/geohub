<script lang="ts">
  import { onMount } from 'svelte'
  import Drawer, { AppContent, Content, Header } from '@smui/drawer'
  import { map } from '../stores'
  import Ripple from '@smui/ripple'
  import { fetchUrl } from '$lib/helper'
  import type { RasterLayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'

  const BingMapsKey = import.meta.env.VITE_BINGMAP_KEY
  const aerialBingUrl = 'http://ecn.t3.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=1'

  export let drawerOpen = false

  let drawerWidth = 355
  let isResizingDrawer = false
  let bingAerialLayerMeta = undefined
  let aerialBingTiles = []

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

  const addBingAerialLayer = async () => {
    if (aerialBingTiles.length == 0) {
      bingAerialLayerMeta = await fetchUrl(
        `https://dev.virtualearth.net/REST/v1/Imagery/Metadata/Aerial?key=${BingMapsKey}`,
      )
      const { estimatedTotal, resources } = bingAerialLayerMeta.resourceSets[0]
      const imageUrlSubdomains = resources[0].imageUrlSubdomains
      aerialBingTiles = imageUrlSubdomains.map((el) => {
        return aerialBingUrl.replace('{subdomain}', el)
      })
    }
    const layerSource = {
      type: 'raster',
      tiles: aerialBingTiles,
      tileSize: 256,
      attribution: 'Layer powered by Microsoft',
    }
    if (!('BING' in $map.getStyle().sources)) {
      console.log('adding Bing aerial')
      $map.addSource('BING', layerSource)

      const layerDefinition: RasterLayerSpecification = {
        id: 'bing',
        type: 'raster',
        source: 'BING',
        minzoom: 0,
        maxzoom: 22,
        layout: {
          visibility: 'visible',
        },
      }
      $map.addLayer(layerDefinition)
    } else {
      const vis = $map.getLayoutProperty('bing', 'visibility')
      const visibility = vis === 'visible' ? 'none' : 'visible'
      console.log(vis, visibility)
      $map.setLayoutProperty('bing', 'visibility', visibility)
    }
  }
</script>

<div class="content-container">
  <Drawer
    variant="dismissible"
    bind:open={drawerOpen}
    style="width: {drawerWidth}px; max-width: {drawerWidth}px; overflow:visible;">
    <div class="drawer-container">
      <div class="drawer-content" style="width: {drawerWidth - 10}px; max-width: {drawerWidth - 10}px;">
        <Header>
          <p use:Ripple={{ surface: true, color: 'primary' }} tabindex="0" on:click={addBingAerialLayer}>Whatever</p>
        </Header>
        <Content style="padding-right: 15px; overflow: visible;">
          <div />
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
    <main class="main-content">
      <slot />
    </main>
  </AppContent>
</div>

<style lang="scss">
  @import '../../styles/bulma.css';
  @import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';

  p {
    padding: 10px;
    border-radius: 5px;
  }

  [tabindex='0'] {
    cursor: pointer;
  }

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
