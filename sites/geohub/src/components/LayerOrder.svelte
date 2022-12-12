<script lang="ts">
  import { LegendPanel } from '@watergis/svelte-maplibre-legend'
  import { map, layerList } from '$stores'
  import type { StyleSpecification } from 'maplibre-gl'
  import { clean } from '$lib/helper'

  export let headerHeight: number = undefined
  export let tabsHeight: number = undefined
  let layerOrderHeaderHeight: number
  let totalHeaderHeight: number
  let marginTop = 5
  $: headerHeight, setTotalHeaderHeight()
  $: tabsHeight, setTotalHeaderHeight()
  $: totalHeaderHeight, setTotalHeaderHeight()

  let style: StyleSpecification
  let onlyRendered = false
  let onlyRelative = false
  let enableLayerOrder = true
  let relativeLayers: { [key: string]: string } = {}

  $: if ($map) {
    $map.on('sourcedata', function (e) {
      if (e.isSourceLoaded) {
        updateLayerOrderList()
      }
    })
  }

  $: if ($map && $layerList) {
    updateLayerOrderList()
  }

  const setTotalHeaderHeight = () => {
    totalHeaderHeight = headerHeight + tabsHeight + layerOrderHeaderHeight + marginTop
    return totalHeaderHeight
  }

  const updateLayerOrderList = () => {
    if ($map && $map.isStyleLoaded() && $layerList) {
      style = $map.getStyle()

      relativeLayers = {}
      $layerList.forEach((layer) => {
        relativeLayers[layer.id] = clean(layer.name)

        layer.children?.forEach((child) => {
          relativeLayers[child.id] = `${clean(layer.name)} label`
        })
      })

      if (Object.keys(relativeLayers).length > 0) {
        onlyRelative = true
      }
    }
  }
</script>

<div
  class="header mx-4 mt-1"
  bind:clientHeight={layerOrderHeaderHeight}>
  <div class="form-check">
    <input
      type="checkbox"
      id="bbox-filter-checkbox"
      name="bbox-filter-checkbox"
      bind:checked={onlyRelative} />
    <label for="bbox-filter-checkbox">
      <b>Show only GeoHub layers</b>
    </label>
  </div>
</div>

<div
  class="layer-order mx-2"
  style="height: calc(100vh - {totalHeaderHeight}px); margin-top: {marginTop}px;">
  <LegendPanel
    bind:map={$map}
    {style}
    bind:onlyRendered
    bind:onlyRelative
    bind:enableLayerOrder
    bind:relativeLayers />
</div>

<style lang="scss">
  @use '../styles/undp-design/base-minimal.min.css';
  @use '../styles/undp-design/checkbox.min.css';

  .layer-order {
    overflow-y: auto;

    :global(.legend) {
      display: none;
    }
  }
</style>
