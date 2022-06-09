<script lang="ts">
  import SegmentedButton, { Segment, Label } from '@smui/segmented-button'
  import Fa from 'svelte-fa'
  import { faDiceD6 } from '@fortawesome/free-solid-svg-icons/faDiceD6'
  import { faHandHoldingUsd } from '@fortawesome/free-solid-svg-icons/faHandHoldingUsd'
  import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'
  import { LayerTypes } from '$lib/constants'
  import { map } from '../stores'
  import type { HeatmapLayerSpecification, VectorSourceSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'
  import RangeSlider from 'svelte-range-slider-pips'
  import PovertyLegend1 from './PovertyLegend1.svelte'
  import PovertyLegend2 from './PovertyLegend2.svelte'
  import { loadAdmin, setInteraction, removeInteraction } from '../utils/adminLayer'

  const AZURE_URL = import.meta.env.VITE_ADMIN_URL
  const POVERTY_URL = [`${AZURE_URL}/admin/poverty_points/{z}/{x}/{y}.pbf`]
  const OVERLAY_ID = 'overlay'
  const ADMIN_ID = 'adm'
  export let POVERTY_ID = 'poverty'
  const NONE_ID = 'none'

  let overlayChoices = [
    { name: ADMIN_ID, icon: faDiceD6 },
    { name: POVERTY_ID, icon: faHandHoldingUsd },
    { name: NONE_ID, icon: faBan },
  ]
  export let overlaySelected = overlayChoices[0]

  let layerOpacity = 1
  let rangeSliderValues = [layerOpacity * 100]
  $: layerOpacity = rangeSliderValues[0] / 100
  $: layerOpacity, setLayerOpacity()
  $: overlaySelected, loadLayer()

  const setLayerOpacity = () => {
    if ($map && $map.getLayer(OVERLAY_ID)) {
      $map.setPaintProperty(OVERLAY_ID, 'heatmap-opacity', layerOpacity)
    }
    if ($map && $map.getLayer('admin')) {
      $map.setPaintProperty('admin', 'fill-opacity', layerOpacity)
    }
  }

  const loadLayer = () => {
    $map.getLayer(OVERLAY_ID) && $map.removeLayer(OVERLAY_ID)
    $map.getSource(OVERLAY_ID) && $map.removeSource(OVERLAY_ID)
    if (overlaySelected.name === ADMIN_ID) {
      setInteraction()
      loadAdmin(true)
      setLayerOpacity()
    } else if (overlaySelected.name === POVERTY_ID) {
      loadAdmin(false)
      removeInteraction()
      initHeatmap()
      setLayerOpacity()
    } else {
      loadAdmin(false)
      removeInteraction()
    }
  }

  const initHeatmap = () => {
    if (!$map.getSource(OVERLAY_ID)) {
      const layerSource: VectorSourceSpecification = {
        type: 'vector',
        tiles: POVERTY_URL,
        maxzoom: 10,
      }
      $map.addSource(OVERLAY_ID, layerSource)
    }

    if (!$map.getLayer(OVERLAY_ID)) {
      const layerDefinition: HeatmapLayerSpecification = {
        id: OVERLAY_ID,
        type: LayerTypes.HEATMAP,
        source: OVERLAY_ID,
        'source-layer': 'poverty_points',
        paint: {
          'heatmap-weight': ['interpolate', ['exponential', 2], ['get', 'poverty'], 0, 0, 2.022, 1],
          'heatmap-intensity': ['interpolate', ['exponential', 2], ['zoom'], 0, 0, 10, 5],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 0, 10, 30],
        },
      }
      $map.addLayer(layerDefinition)
    }
  }

  const moveOverlay = () => {
    if (!$map) return
    let firstSymbolId = undefined
    for (const layer of $map.getStyle().layers) {
      if (layer.type === 'symbol') {
        firstSymbolId = layer.id
        break
      }
    }
    $map.moveLayer(OVERLAY_ID, firstSymbolId)
  }
</script>

<div class="centered">
  <SegmentedButton segments={overlayChoices} let:segment singleSelect bind:selected={overlaySelected}>
    <Segment {segment}>
      <div class="icon">
        <Fa icon={segment.icon} size="lg" />
      </div>
      <Label>{segment.name}</Label>
    </Segment>
  </SegmentedButton>
</div>

{#if overlayChoices
  .map((x) => x.name)
  .slice(0, 2)
  .includes(overlaySelected.name)}
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
{#if overlaySelected.name === ADMIN_ID}<PovertyLegend1 />{/if}
{#if overlaySelected.name === POVERTY_ID}<PovertyLegend2 />{/if}

<br />

<style lang="scss">
  .title-text {
    font-size: 14px;
    color: rgb(1, 1, 1, 0.6);
    font-weight: normal;

    @media (prefers-color-scheme: dark) {
      color: white;
    }
  }

  .raster-time-slider {
    padding-top: 1em;
    padding-bottom: 1em;
  }

  .icon {
    padding-left: 10px;
    padding-right: 20px;
  }

  :global(.centered) {
    width: max-content;
    margin: auto !important;
  }
</style>
