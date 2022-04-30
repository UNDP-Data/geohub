<script lang="ts" context="module">
  const layerState = {}
  const colorMapNameState = {}
</script>

<script lang="ts">
  import Fa from 'svelte-fa'
  import { fade } from 'svelte/transition'
  import { faCalculator } from '@fortawesome/free-solid-svg-icons/faCalculator'
  import { faDroplet } from '@fortawesome/free-solid-svg-icons/faDroplet'
  import { faList } from '@fortawesome/free-solid-svg-icons/faList'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'

  import LayerNameGroup from '$components/control-groups/LayerNameGroup.svelte'
  import OpacityPanel from '$components/controls/OpacityPanel.svelte'
  import RasterLegendContainer from '$components/RasterLegendContainer.svelte'
  import { layerList, map } from '$stores'
  import type { Layer } from '$lib/types'
  import { LayerInitialValues, DEFAULT_COLORMAP, TabNames } from '$lib/constants'
  import ZoomLevelPanel from './controls/ZoomLevelPanel.svelte'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const mapLayers = $map.getStyle().layers

  let activeColorMapName: string = colorMapNameState[layerId] || DEFAULT_COLORMAP
  let activeTab = ''
  let isFilterPanelVisible = false
  let isLegendPanelVisible = false
  let isOpacityPanelVisible = false
  let isZoomLevelPanelVisible = false
  let layerBandMetadataMax = parseFloat(layer.info['band_metadata'][0][1]['STATISTICS_MAXIMUM'])
  let layerBandMetadataMin = parseFloat(layer.info['band_metadata'][0][1]['STATISTICS_MINIMUM'])
  let panelOpen: boolean = layerState[layerId] || false
  let scalingValueRange = ''
  let scalingValueStart = Math.floor(+layerBandMetadataMin * 10) / 10
  let scalingValueEnd = Math.ceil(+layerBandMetadataMax * 10) / 10
  let timer: ReturnType<typeof setTimeout>

  $: panelOpen, setLayerState()
  $: scalingValueStart, setScalingValueRange()
  $: scalingValueEnd, setScalingValueRange()
  $: scalingValueRange, selectScaling()
  $: activeColorMapName, setColormapState()
  $: {
    const layer = $layerList.some((item) => item.definition.id === layerId)
    if (!layer) hideAllPanels()
  }

  $: {
    isLegendPanelVisible = false
    isFilterPanelVisible = false
    isOpacityPanelVisible = false
    isZoomLevelPanelVisible = false
    switch (activeTab) {
      case TabNames.LEGEND:
        isLegendPanelVisible = true
        break
      case TabNames.REFINE:
        isFilterPanelVisible = true
        break
      case TabNames.OPACITY:
        isOpacityPanelVisible = true
        break
      case TabNames.ZOOM:
        isZoomLevelPanelVisible = true
        break
      default:
        break
    }
  }

  const tabs = [
    { label: TabNames.LEGEND, icon: faList, active: false },
    { label: TabNames.REFINE, icon: faCalculator, active: false },
    { label: TabNames.OPACITY, icon: faDroplet, active: false },
  ]

  const debounce = (fn) => {
    clearTimeout(timer)
    timer = setTimeout(fn, 500)
  }

  const setLayerState = () => {
    layerState[layerId] = panelOpen
  }

  const setColormapState = () => {
    colorMapNameState[layerId] = activeColorMapName
  }
  const hideAllPanels = () => {
    isLegendPanelVisible = false
    isOpacityPanelVisible = false
    isFilterPanelVisible = false
  }

  const updateParamsInURL = (params: Record<string, string>) => {
    debounce(() => {
      let layers = mapLayers.find((item: LayerSpecification) => item.id === layerId)['source']
      const layerSource = $map.getSource(layers)

      if (layerSource.tiles) {
        const oldUrl = new URL(layerSource.tiles[0])
        Object.keys(params).forEach((key) => {
          oldUrl.searchParams.set(key, params[key])
        })
        $map.getSource(layers).tiles = [decodeURI(oldUrl.toString())]
        $map.style.sourceCaches[layers].clearTiles()
        $map.style.sourceCaches[layers].update($map.transform)
        $map.triggerRepaint()
      }
    })
  }

  const selectScaling = () => {
    if (!scalingValueRange) return
    updateParamsInURL({ rescale: scalingValueRange })
  }

  const setScalingValueRange = () => {
    scalingValueRange = `${scalingValueStart},${scalingValueEnd}`
  }
</script>

<div class="raster-layer-container" transition:fade>
  <nav class="panel">
    <p class="panel-heading">
      <LayerNameGroup {layer} />
    </p>
    <p class="panel-tabs">
      {#each tabs as tab}
        <a
          href={'#'}
          on:click={() => (activeTab === tab.label ? (activeTab = '') : (activeTab = tab.label))}
          class={activeTab === tab.label ? 'is-active' : ''}>
          <span>
            <Fa icon={tab.icon} size="sm" />
          </span>
          {tab.label}
        </a>
      {/each}
    </p>

    <p class="panel-content">
      {#if isLegendPanelVisible === true}
        <RasterLegendContainer bind:activeColorMapName bind:layer />
      {/if}
      <OpacityPanel {layer} {isOpacityPanelVisible} />
      <ZoomLevelPanel {layer} {isZoomLevelPanelVisible} />
    </p>
  </nav>
</div>

<style lang="scss">
  @import '../styles/bulma.css';

  .raster-layer-container {
    margin-left: 15px;
    margin-bottom: 20px;

    .panel-tabs {
      padding-top: 10px;

      a {
        margin-right: 5px;

        span {
          margin-right: 3px;
        }
      }
    }

    .panel-content {
      padding: 10px;
    }
  }
</style>
