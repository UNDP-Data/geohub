<script lang="ts">
  import { onMount } from 'svelte'
  import chroma from 'chroma-js'
  import type { RasterTileSource } from 'maplibre-gl'

  import UniqueValuesLegendColorMapRow from '$components/controls/UniqueValuesLegendColorMapRow.svelte'
  import { ColorMaps } from '$lib/colormaps'
  import { ColorMapTypes, LayerInitialValues } from '$lib/constants'
  import {
    updateParamsInURL,
    remapInputValue,
    getActiveBandIndex,
    getValueFromRasterTileUrl,
    getLayerStyle,
  } from '$lib/helper'
  import type { IntervalLegendColorMapRow, Layer, RasterTileMetadata, UniqueLegendColorMapRow } from '$lib/types'
  import { map } from '$stores'

  export let colorPickerVisibleIndex: number
  export let layerConfig: Layer = LayerInitialValues
  export let colorMapName: string

  let info: RasterTileMetadata
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  ;({ info } = layerConfig)
  const bandIndex = getActiveBandIndex(info)
  let layerMin = Number(info['band_metadata'][bandIndex][1]['STATISTICS_MINIMUM'])
  let layerMax = Number(info['band_metadata'][bandIndex][1]['STATISTICS_MAXIMUM'])
  let legendLabels = info.band_metadata[bandIndex][1].STATISTICS_UNIQUE_VALUES

  let colorMap = {}
  let layerColorMap: chroma.Scale = undefined
  let colorMapRows: IntervalLegendColorMapRow[] = []

  $: colorMapName, colorMapNameChanged()
  const colorMapNameChanged = () => {
    if (!colorMapName) return
    if ($map.isStyleLoaded()) {
      getColorMapRows()
      reclassifyImage()
    } else {
      // wait a bit if map style is not loaded after changing colormap_name
      setTimeout(() => {
        getColorMapRows()
        reclassifyImage()
      }, 300)
    }
  }

  onMount(() => {
    if (!$map.isStyleLoaded()) return
    getColorMapRows()
    colorMapRows.length > 0 ? reclassifyImage(true) : reclassifyImage(false)
  })

  const getColorMapRows = () => {
    const colormap = getValueFromRasterTileUrl($map, layerConfig.id, 'colormap') as {
      [key: string]: number[]
    }
    colorMapRows = []
    if (!(colormap && Object.keys(colormap).length > 0)) return
    Object.keys(colormap).forEach((key) => {
      const color = colormap[key]
      colorMapRows.push({
        color: color,
        index: colorMapRows.length === 0 ? 0 : colorMapRows.length - 1,
        start: key,
        end: Object.keys(legendLabels).length > 0 ? legendLabels[key] : key,
      })
    })
  }

  const reclassifyImage = (useLayerColorMapRows = false) => {
    setColorMap()
    const layerStyle = getLayerStyle($map, layerConfig.id)
    const layerSrc: RasterTileSource = $map.getSource(layerStyle.source) as RasterTileSource
    if (!(layerSrc.tiles?.length > 0)) return
    const layerURL = new URL(layerSrc.tiles[0])
    if (layerURL.searchParams.has('rescale')) {
      layerURL.searchParams.delete('rescale')
    }
    if (useLayerColorMapRows === false) {
      const bandName = Object.keys(layerConfig.info.stats)
      layerMin = layerConfig.info.stats[bandName]['min']
      layerMax = layerConfig.info.stats[bandName]['max']
      setColorMap()
      const uValues = info.stats[bandName]['histogram'][1]

      const layerUniqueValues = uValues.map((v) => {
        return { name: v, value: v }
      })
      const _colorMapRows = []
      let index = 0
      layerUniqueValues.forEach((row: UniqueLegendColorMapRow) => {
        const key = row.value
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        const color = [...layerColorMap(key).rgb(), 255]

        colorMap[parseInt(remapInputValue(key, layerMin, layerMax, layerMin, layerMax))] = color
        //colorMap[key] = color
        _colorMapRows.push({
          index,
          color,
          start: key,
          end: Object.keys(legendLabels).length > 0 ? legendLabels[key] : row.value,
        })
        index++
      })

      colorMapRows = _colorMapRows
    } else {
      colorMapRows.forEach((row) => {
        colorMap[parseInt(remapInputValue(row.start, layerMin, layerMax, layerMin, layerMax))] = row.color
      })
    }

    handleParamsUpdate(colorMap)
  }

  const setColorMap = () => {
    for (let [colorMapType, colorMaps] of Object.entries(ColorMaps)) {
      colorMaps.forEach((cmName: string) => {
        if (colorMapName === cmName) {
          if (colorMapType === ColorMapTypes.SEQUENTIAL) {
            layerColorMap = chroma.scale(colorMapName).mode('lrgb').padding([0.25, 0]).domain([layerMin, layerMax])
          } else {
            layerColorMap = chroma.scale(colorMapName).mode('lrgb').domain([layerMin, layerMax])
          }
        }
      })
    }
  }

  const handleParamsUpdate = (cmap) => {
    const encodeColorMapRows = JSON.stringify(cmap)
    const layerStyle = getLayerStyle($map, layerConfig.id)
    const layerSrc: RasterTileSource = $map.getSource(layerStyle.source) as RasterTileSource
    const layerURL = new URL(layerSrc.tiles[0])
    layerURL.searchParams.delete('colormap_name')
    if (layerURL.searchParams.has('rescale')) {
      layerURL.searchParams.delete('rescale')
    }
    let updatedParams = Object.assign({ colormap: encodeColorMapRows })
    updateParamsInURL(layerStyle, layerURL, updatedParams)
  }

  const handleColorPickerClick = (event: CustomEvent) => {
    colorPickerVisibleIndex = event.detail.index
  }

  const handleChangeColorMap = (e) => {
    const valuesList = Object.keys(colorMap)
    colorMap[valuesList[colorPickerVisibleIndex]] = [e.detail.color.r, e.detail.color.g, e.detail.color.b, 255]
    colorMapRows.splice(colorPickerVisibleIndex, 1, {
      index: colorPickerVisibleIndex,
      color: [e.detail.color.r, e.detail.color.g, e.detail.color.b, 255 * e.detail.color.a],
      start: colorMapRows[colorPickerVisibleIndex].start,
      end: colorMapRows[colorPickerVisibleIndex].end,
    })
    reclassifyImage(true)
  }
</script>

{#if legendLabels}
  <div
    class="is-divider"
    data-content="Unique values" />
  <div
    class="unique-view-container {Object.keys(legendLabels).length > 1 ? 'height-labels' : 'height'}"
    data-testid="unique-view-container">
    {#each colorMapRows as colorMapRow}
      <UniqueValuesLegendColorMapRow
        bind:colorMapRow
        bind:colorMapName
        layer={layerConfig}
        {colorPickerVisibleIndex}
        on:clickColorPicker={handleColorPickerClick}
        on:closeColorPicker={() => (colorPickerVisibleIndex = -1)}
        on:changeColorMap={handleChangeColorMap} />
    {/each}
  </div>
{/if}

<style lang="scss">
  .unique-view-container {
    width: fit-content;
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
</style>
