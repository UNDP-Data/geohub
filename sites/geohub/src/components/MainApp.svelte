<script lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl'
  import { Split } from '@geoffcox/svelte-splitter/src'
  import Header from '$components/Header.svelte'
  import BannerMessageControl from '$components/BannerMessageControl.svelte'
  import Map from '$components/Map.svelte'
  import Content from './Content.svelte'
  import { map as mapStore, indicatorProgress } from '$stores'

  let map: MaplibreMap
  let headerHeight: number
  let isMenuShown = true

  let innerWidth: number
  let innerHeight: number
  $: isMobile = innerWidth < 768
  $: splitHeight = innerHeight - headerHeight

  let initialPrimaryWidth = 360
  let minPrimaryWidth = `${initialPrimaryWidth}px`
  let minSecondaryWidth = '50%'
  let defaultsplitterSize = '10px'
  let widthPecent = 0
  let sidebarPosition = 'left' // Default Position of the sidebar

  let splitControl: Split
  let splitterSize = defaultsplitterSize

  $: innerWidth, resizeMap()
  $: innerHeight, resizeMap()

  $: if (map) {
    mapStore.update(() => map)
    // setSplitControl()
  }

  const setWidthPercent = () => {
    widthPecent = (initialPrimaryWidth / innerWidth) * 100
  }

  const resizeMap = () => {
    if (!map) return
    // repaintMap()
    map.resize()
  }

  const repaintMap = () => {
    if (!map) return
    map.triggerRepaint()
  }

  const setSplitControl = () => {
    if (!splitControl) return
    if (isMenuShown === true) {
      if (isMobile) {
        splitControl.setPercent(100)
        splitterSize = '0px'
      } else {
        const widthPecent = (initialPrimaryWidth / innerWidth) * 100
        setWidthPercent()
        splitControl.setPercent(widthPecent)
        splitterSize = defaultsplitterSize
      }
    } else {
      splitControl.setPercent(0)
      splitterSize = '0px'
    }
    repaintMap()
  }

  $: isMenuShown, opened()
  $: sidebarPosition, setWidths()
  const opened = () => {
    setSplitControl()
  }

  const setWidths = () => {
    if (sidebarPosition === 'left') {
      minPrimaryWidth = `${initialPrimaryWidth}px`
      minSecondaryWidth = '50%'
    } else {
      minPrimaryWidth = `${innerWidth - initialPrimaryWidth}px`
      minSecondaryWidth = `${initialPrimaryWidth}px`
    }
    resizeMap()
    repaintMap()
  }
  const splitterChanged = () => {
    resizeMap()
  }

  $: if (splitControl) {
    setSplitControl()
  }
</script>

<svelte:window
  bind:innerWidth
  bind:innerHeight />

<Header
  bind:drawerOpen={isMenuShown}
  bind:height={headerHeight} />

<div
  class="split-container"
  style="height:{splitHeight}px;">
  <!--{#if sidebarPosition === 'left'}-->
  <Split
    initialPrimarySize={`${widthPecent}%`}
    minPrimarySize={isMenuShown ? `${minPrimaryWidth}` : '0px'}
    minSecondarySize={isMobile ? '0px' : minSecondaryWidth}
    {splitterSize}
    on:changed={splitterChanged}
    bind:this={splitControl}>
    <div
      slot="primary"
      class="primary-content">
      {#if sidebarPosition === 'left'}
        {#if isMobile}
          <!--           svelte-ignore a11y-click-events-have-key-events -->
          <span
            class="span close-icon"
            on:click={() => {
              isMenuShown = false
            }}>
            <i
              class="fa-solid fa-circle-xmark fa-2x"
              style="color:#1c1c1c;" />
          </span>
        {/if}
        <Content
          bind:sidebarPosition
          bind:splitterHeight={splitHeight} />
      {:else}
        <BannerMessageControl>
          <progress
            style="height:0.2rem; opacity:{$indicatorProgress == true
              ? 1
              : 0}; z-index:1; position:absolute; top:{splitHeight}px;"
            class="progress is-large is-info "
            max={100} />
          <Map bind:map />
        </BannerMessageControl>
      {/if}
    </div>
    <div
      slot="secondary"
      class="secondary-content">
      {#if sidebarPosition === 'left'}
        <BannerMessageControl>
          <progress
            style="height:0.2rem; opacity:{$indicatorProgress == true
              ? 1
              : 0}; z-index:1; position:absolute; top:{splitHeight}px;"
            class="progress is-large is-info "
            max={100} />
          <slot name="map" />
          <Map bind:map />
        </BannerMessageControl>
      {:else}
        {#if isMobile}
          <!--           svelte-ignore a11y-click-events-have-key-events -->
          <span
            class="span close-icon"
            on:click={() => {
              isMenuShown = false
            }}>
            <i
              class="fa-solid fa-circle-xmark fa-2x"
              style="color:#1c1c1c;" />
          </span>
        {/if}
        <Content
          bind:sidebarPosition
          bind:splitterHeight={splitHeight} />
      {/if}
      <!--      <BannerMessageControl>-->
      <!--        <progress-->
      <!--          style="height:0.2rem; opacity:{$indicatorProgress == true-->
      <!--            ? 1-->
      <!--            : 0}; z-index:1; position:absolute; top:{splitHeight}px;"-->
      <!--          class="progress is-large is-info "-->
      <!--          max={100} />-->
      <!--        <Map-->
      <!--          bind:this={mapDiv}-->
      <!--          bind:map />-->
      <!--      </BannerMessageControl>-->
    </div>
  </Split>
  <!--{:else}-->
  <!--  <Split-->
  <!--    initialPrimarySize={`${widthPecent}%`}-->
  <!--    minPrimarySize={isMenuShown ? `${minPrimaryWidth}` : '0px'}-->
  <!--    minSecondarySize={isMobile ? '0px' : minSecondaryWidth}-->
  <!--    {splitterSize}-->
  <!--    on:changed={splitterChanged}-->
  <!--    bind:this={splitControl}>-->
  <!--    <div-->
  <!--      slot="primary"-->
  <!--      class="primary-content">-->
  <!--      <BannerMessageControl>-->
  <!--        <progress-->
  <!--          style="height:0.2rem; opacity:{$indicatorProgress == true-->
  <!--            ? 1-->
  <!--            : 0}; z-index:1; position:absolute; top:{splitHeight}px;"-->
  <!--          class="progress is-large is-info "-->
  <!--          max={100} />-->
  <!--        <Map bind:this={mapDiv} bind:map />-->
  <!--      </BannerMessageControl>-->
  <!--    </div>-->
  <!--    <div-->
  <!--      slot="secondary"-->
  <!--      class="secondary-content">-->
  <!--      {#if isMobile}-->
  <!--        &lt;!&ndash; svelte-ignore a11y-click-events-have-key-events &ndash;&gt;-->
  <!--        <span-->
  <!--          class="span close-icon"-->
  <!--          on:click={() => {-->
  <!--            isMenuShown = false-->
  <!--          }}>-->
  <!--          <i-->
  <!--            class="fa-solid fa-circle-xmark fa-2x"-->
  <!--            style="color:#1c1c1c;" />-->
  <!--        </span>-->
  <!--      {/if}-->
  <!--      <Content-->
  <!--        bind:sidebarPosition-->
  <!--        bind:splitterHeight={splitHeight} />-->
  <!--    </div>-->
  <!--  </Split>-->
  <!--{/if}-->
</div>

<style lang="scss">
  .split-container {
    .primary-content {
      position: relative;

      .close-icon {
        position: absolute;
        top: 0.5rem;
        right: 0.6rem;
        cursor: pointer;
        z-index: 5;
      }
    }

    .secondary-content {
      position: relative;
      width: 100%;
      height: 100%;
    }
  }
</style>
