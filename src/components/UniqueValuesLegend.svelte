<script lang="ts">
  import { onMount } from 'svelte'
  import chroma from 'chroma-js'
  import type {
    RasterLayerSpecification,
    FillLayerSpecification,
    LineLayerSpecification,
    SymbolLayerSpecification,
    HeatmapLayerSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types'
  import { debounce } from 'lodash-es'

  import UniqueValuesLegendColorMapRow from '$components/UniqueValuesLegendColorMapRow.svelte'
  import { ColorMaps } from '$lib/colormaps'
  import { ColorMapTypes, LayerInitialValues } from '$lib/constants'
  import { updateParamsInURL } from '$lib/helper'
  import type { Layer, LayerInfo, UniqueLegendColorMapRow } from '$lib/types'
  import { map } from '$stores'

  export let colorPickerVisibleIndex: number
  export let layerConfig: Layer = LayerInitialValues

  let definition:
    | RasterLayerSpecification
    | FillLayerSpecification
    | LineLayerSpecification
    | SymbolLayerSpecification
    | HeatmapLayerSpecification
  let info: LayerInfo
  ;({ definition, info } = layerConfig)

  const layerMin = Number(info['band_metadata'][0][1]['STATISTICS_MINIMUM'])
  const layerMax = Number(info['band_metadata'][0][1]['STATISTICS_MAXIMUM'])
  const layerSrc = $map.getSource(definition.source)
  const layerURL = new URL(layerSrc.tiles[0])

  let colorMap = {}
  let colorMapName = layerConfig.colorMapName
  let layerColorMap: chroma.Scale = undefined

  // reclassify upon change of color map (color map picker)
  $: {
    if (layerConfig && colorMapName !== layerConfig.colorMapName) {
      colorMapName = layerConfig.colorMapName
      reclassifyImage()
    }
  }

  onMount(() => {
    reclassifyImage()
  })

  const reclassifyImage = (useLayerColorMapRows = false) => {
    setColorMap()

    if (useLayerColorMapRows === false) {
      const colorMapRows = []
      const layerUniqueValues = JSON.parse(layerConfig.info.band_metadata[0][1]['STATISTICS_UNIQUE_VALUES'])
      colorMap = {}
      let index = 0

      layerUniqueValues.forEach((row: UniqueLegendColorMapRow) => {
        const key = row.value
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        const color = [...layerColorMap(key).rgb(), 255]
        colorMap[remap(key, layerMin, layerMax)] = color
        colorMapRows.push({ index, color, start: key, end: row.name })
        index++
      })

      layerConfig.unique.colorMapRows = colorMapRows

    // use existing color map rows from layer
    } else {
      layerConfig.unique.colorMapRows.forEach((row) => {
        colorMap[remap(row.start, layerMin, layerMax)] = row.color
      })
    }

    handleParamsUpdate()
  }

  const setColorMap = () => {
    for (let [colorMapType, colorMaps] of Object.entries(ColorMaps)) {
      colorMaps.forEach((colorMapName: string) => {
        if (layerConfig.colorMapName === colorMapName) {
          if (colorMapType === ColorMapTypes.SEQUENTIAL) {
            layerColorMap = chroma.scale(colorMapName).mode('lrgb').padding([0.25, 0]).domain([layerMin, layerMax])
          } else {
            layerColorMap = chroma.scale(colorMapName).mode('lrgb').domain([layerMin, layerMax])
          }
        }
      })
    }
  }

  const remap = (input = 0, oldMin = 0, oldMax = 0, newMin = 0, newMax = 255) => {
    const percent = (input - oldMin) / (oldMax - oldMin)
    const rescaled = percent * (newMax - newMin) + newMin
    return rescaled | 0
  }

  const handleParamsUpdate = debounce(() => {
    const encodeColorMapRows = JSON.stringify(colorMap)
    layerURL.searchParams.delete('colormap_name')
    let updatedParams = Object.assign({ colormap: encodeColorMapRows })
    updateParamsInURL(definition, layerURL, updatedParams)
  }, 500)

  const handleColorPickerClick = (event: CustomEvent) => {
    colorPickerVisibleIndex = event.detail.index
  }

  const handleChangeColorMap = () => {
    reclassifyImage(true)
  }
</script>

<div class="unique-view-container" data-testid="unique-view-container">
  {#each layerConfig.unique.colorMapRows as colorMapRow}
    <UniqueValuesLegendColorMapRow
      bind:colorMapRow
      layer={layerConfig}
      {colorPickerVisibleIndex}
      on:clickColorPicker={handleColorPickerClick}
      on:changeColorMap={handleChangeColorMap} />
  {/each}
</div>

<style lang="scss">
</style>
