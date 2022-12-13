<script lang="ts">
  import { LegendPanel } from '@watergis/svelte-maplibre-legend'
  import { map, layerList } from '$stores'
  import type { StyleSpecification } from 'maplibre-gl'
  import PanelButton from '$components/controls/PanelButton.svelte'
  import { clean } from '$lib/helper'

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

<PanelButton
  icon="fa-solid fa-arrow-down-up-across-line"
  iconDisabled="fa-solid fa-arrow-down-up-lock"
  tooltip="Change layer order"
  position="left"
  width="300px"
  disabled={$layerList?.length < 2}>
  <p class="title is-5 mx-2 mt-0 mb-2 p-0">Layer order settings</p>
  <p class="mx-2 mb-1">Drag and drop to change layer order for rendering in the map.</p>

  <div class="header mx-2 mt-1 mb-2 pb-2">
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

  <div class="layer-order">
    <LegendPanel
      bind:map={$map}
      {style}
      bind:onlyRendered
      bind:onlyRelative
      bind:enableLayerOrder
      bind:relativeLayers />
  </div>
</PanelButton>

<style lang="scss">
  @use '../styles/undp-design/base-minimal.min.css';
  @use '../styles/undp-design/checkbox.min.css';

  .header {
    border-bottom: 1px solid gray;
  }

  .layer-order {
    overflow-y: auto;
    max-height: 300px;
  }

  :global(.legend) {
    display: none;
  }

  :global(.layer-position) {
    margin-right: 1rem;
  }
</style>
