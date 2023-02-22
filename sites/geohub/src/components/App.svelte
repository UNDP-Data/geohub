<script lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl'
  import { Split } from '@geoffcox/svelte-splitter/src'
  import Header from '$components/Header.svelte'
  import BannerMessageControl from '$components/BannerMessageControl.svelte'
  import Map from '$components/Map.svelte'
  import Content from './Content.svelte'
  import { map as mapStore, indicatorProgress } from '$stores'
  import SplitterControl from '$components/SplitterControl.svelte'

  let map: MaplibreMap
  let headerHeight: number
  let isMenuShown = true

  let innerWidth: number
  let innerHeight: number
  let settings = {
    sideBarPosition: 'left',
  }
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift()
  }

  let sideBarPosition: 'left' | 'right' = JSON.parse(getCookie('settings') || '{}').sideBarPosition || 'left'
  $: isMobile = innerWidth < 768
  $: splitHeight = innerHeight - headerHeight
  $: console.log(document.cookie)

  let splitControl: Split
</script>

<SplitterControl
  bind:map={$mapStore}
  bind:sideBarPosition>
  <div slot="sidebar">
    <Content bind:splitterHeight={splitHeight} />
  </div>
  <div slot="map">
    <Map bind:map={$mapStore} />
  </div>
</SplitterControl>
