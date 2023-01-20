<script lang="ts">
  import { onMount } from 'svelte'
  import chroma from 'chroma-js'
  import type { RasterTileSource } from 'maplibre-gl'

  import { ColorMaps } from '$lib/colormaps'
  import { ColorMapTypes } from '$lib/constants'
  import {
    updateParamsInURL,
    remapInputValue,
    getActiveBandIndex,
    getValueFromRasterTileUrl,
    getLayerStyle,
    getBase64EncodedUrl,
    getLayerSourceUrl,
  } from '$lib/helper'
  import type { IntervalLegendColorMapRow, Layer, RasterTileMetadata } from '$lib/types'
  import { map } from '$stores'
  import IntervalsLegendColorMapRow from '$components/controls/IntervalsLegendColorMapRow.svelte'
  import ColorMapPicker from './ColorMapPicker.svelte'

  export let colorPickerVisibleIndex: number
  export let layerConfig: Layer
  export let colorMapName: string

  let info: RasterTileMetadata
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  ;({ info } = layerConfig)
  const bandIndex = getActiveBandIndex(info)
  let legendLabels = info.band_metadata[bandIndex][1].STATISTICS_UNIQUE_VALUES
  let isUniqueValues = true
  let colorMap = {}
  let layerColorMap: string[] = undefined
  let colorMapRows: IntervalLegendColorMapRow[] = []

  // $: colorMapName, colorMapNameChanged()
  const colorMapNameChanged = () => {
    reclassifyImage()
  }

  onMount(() => {
    // check if layerURL is already set
    const colormap = getValueFromRasterTileUrl($map, layerConfig.id, 'colormap')
    if (!colormap) {
      setColorMapRows()
      reclassifyImage()
    } else {
      setColorMapRowsFromURL()
    }
  })
  const setColorMapRows = () => {
    setColorMap()
    colorMapRows = []
    const colors = layerColorMap.map((color) => chroma(color).rgba())
    Object.keys(legendLabels).forEach((key, index) => {
      colorMapRows.push({
        index: index,
        start: Number(key),
        end: legendLabels[key],
        color: colors[index],
      })
    })
  }

  const setColorMapRowsFromURL = () => {
    colorMapRows = []
    const colormap = getValueFromRasterTileUrl($map, layerConfig.id, 'colormap')
    Object.keys(colormap).forEach((key, index) => {
      colorMapRows.push({
        index: index,
        start: Number(key),
        end: legendLabels[key],
        color: colormap[key],
      })
    })
  }

  const reclassifyImage = () => {
    const layerStyle = getLayerStyle($map, layerConfig.id)
    const layerSrc: RasterTileSource = $map.getSource(layerStyle.source) as RasterTileSource
    if (!(layerSrc.tiles?.length > 0)) return
    const layerURL = new URL(layerSrc.tiles[0])
    if (layerURL.searchParams.has('rescale')) {
      layerURL.searchParams.delete('rescale')
    }
    setColorMapRows()
    handleParamsUpdate(colorMapRows)
  }

  const setColorMap = () => {
    layerColorMap = chroma.scale(colorMapName).mode('lrgb').colors(Object.keys(legendLabels).length)
  }

  const handleParamsUpdate = async (cmaprows) => {
    cmaprows.forEach((row) => {
      colorMap[row.start] = [row.color[0], row.color[1], row.color[2], remapInputValue(row.color[3], 0, 1, 0, 255)]
    })
    const encodeColorMapRows = JSON.stringify(colorMap)
    const layerUrl = getLayerSourceUrl($map, layerConfig.id) as string
    if (!(layerUrl && layerUrl.length > 0)) return
    const layerURL = new URL(layerUrl)
    layerURL.searchParams.has('colormap_name') ? layerURL.searchParams.delete('colormap_name') : null
    layerURL.searchParams.has('rescale') ? layerURL.searchParams.delete('rescale') : null
    const layerStyle = getLayerStyle($map, layerConfig.id)
    let updatedParams = Object.assign({ colormap: encodeColorMapRows })
    updateParamsInURL(layerStyle, layerURL, updatedParams)
  }

  const handleChangeOfColorMap = () => {
    handleParamsUpdate(colorMapRows)
  }
</script>

{#if legendLabels}
  <div
    class="is-divider"
    data-content="Unique values" />
  <div class="legend-controls">
    <div
      class="unique-view-container {Object.keys(legendLabels).length > 1 ? 'height-labels' : 'height'}"
      data-testid="unique-view-container">
      {#each colorMapRows as colorMapRow}
        <IntervalsLegendColorMapRow
          bind:colorMapRow
          bind:colorMapName
          on:changeColorMap={handleChangeOfColorMap}
          bind:hasUniqueValues={isUniqueValues} />
      {/each}
    </div>

    <div class="colormap-picker">
      <ColorMapPicker
        bind:colorMapName
        on:colorMapChanged={colorMapNameChanged} />
    </div>
  </div>
{/if}

<style lang="scss">
  .unique-view-container {
    width: 90%;
  }

  .height {
    margin-right: auto;
    margin-left: 20%;
    max-height: 200px;
    display: flex;
    align-items: center;
    flex-direction: column;
    flex-wrap: wrap;
  }

  .legend-controls {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;

    .colormap-picker {
      margin-left: auto;
    }
  }
</style>
