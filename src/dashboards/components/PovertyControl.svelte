<script lang="ts">
  import { LayerTypes } from '$lib/constants'
  import { map } from '../stores'
  import FormField from '@smui/form-field'
  import Checkbox from '@smui/checkbox'
  import type { HeatmapLayerSpecification, VectorSourceSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import RangeSlider from 'svelte-range-slider-pips'

  const AZURE_URL = import.meta.env.VITE_AZURE_URL
  const POVERTY_URL = [`${AZURE_URL}/admin/poverty_points/{z}/{x}/{y}.pbf`]

  export let POVERTY_ID = 'poverty'
  let heatmapChecked = false
  $: heatmapChecked, loadHeatmap()

  let layerOpacity = 1
  let rangeSliderValues = [layerOpacity * 100]
  $: layerOpacity = rangeSliderValues[0] / 100
  $: layerOpacity, setLayerOpacity()

  const setLayerOpacity = () => {
    if ($map && $map.getLayer(POVERTY_ID)) {
      $map.setPaintProperty(POVERTY_ID, 'heatmap-opacity', layerOpacity)
    }
  }

  const initHeatmap = () => {
    if (!$map.getSource(POVERTY_ID)) {
      const layerSource: VectorSourceSpecification = {
        type: 'vector',
        tiles: POVERTY_URL,
        maxzoom: 10,
      }
      $map.addSource(POVERTY_ID, layerSource)
    }

    if (!$map.getLayer(POVERTY_ID)) {
      const layerDefinition: HeatmapLayerSpecification = {
        id: POVERTY_ID,
        type: LayerTypes.HEATMAP,
        source: POVERTY_ID,
        'source-layer': POVERTY_ID + '_points',
        layout: { visibility: 'none' },
        paint: {
          'heatmap-weight': ['interpolate', ['exponential', 2], ['get', POVERTY_ID], 0, 0, 2.022, 1],
          'heatmap-intensity': ['interpolate', ['exponential', 2], ['zoom'], 0, 0, 10, 5],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 0, 10, 30],
        },
      }
      $map.addLayer(layerDefinition)
    }
  }

  const moveHeatmap = () => {
    if (!$map) return
    let firstSymbolId = undefined
    for (const layer of $map.getStyle().layers) {
      if (layer.type === 'symbol') {
        firstSymbolId = layer.id
        break
      }
    }
    $map.moveLayer(POVERTY_ID, firstSymbolId)
  }

  export function loadHeatmap() {
    if (!$map) return
    initHeatmap()
    $map.setLayoutProperty(POVERTY_ID, 'visibility', heatmapChecked ? 'visible' : 'none')
    $map.setPaintProperty(POVERTY_ID, 'heatmap-opacity', layerOpacity)
    moveHeatmap()
  }
</script>

<FormField>
  <Checkbox bind:checked={heatmapChecked} />
  <span slot="label"><p class="title-text">Poverty</p></span>
</FormField>
{#if heatmapChecked}
  <div class="action">
    <div class="slider">
      <RangeSlider
        bind:values={rangeSliderValues}
        float
        min={0}
        max={100}
        step={1}
        pips
        first="label"
        last="label"
        rest={false}
        suffix="%" />
    </div>
  </div>
{/if}

<style lang="scss">
  .title-text {
    font-size: 14px;
    color: rgb(1, 1, 1, 0.6);
    font-weight: normal;

    @media (prefers-color-scheme: dark) {
      color: white;
    }
  }
</style>
