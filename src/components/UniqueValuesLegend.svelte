<script lang="ts">
  import { onMount } from 'svelte'
  import chroma from 'chroma-js'
  import type {
    RasterLayerSpecification,
    FillLayerSpecification,
    LineLayerSpecification,
    SymbolLayerSpecification,
    HeatmapLayerSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types.g'
  import { debounce } from 'lodash-es'

  import UniqueValuesLegendColorMapRow from '$components/UniqueValuesLegendColorMapRow.svelte'
  import { ColorMaps } from '$lib/colormaps'
  import { ColorMapTypes, LayerInitialValues } from '$lib/constants'
  import { updateParamsInURL, remapInputValue, getActiveBandIndex } from '$lib/helper'
  import type { Layer, RasterTileMetadata, UniqueLegendColorMapRow } from '$lib/types'
  import { map } from '$stores'

  export let colorPickerVisibleIndex: number
  export let layerConfig: Layer = LayerInitialValues

  let definition:
    | RasterLayerSpecification
    | FillLayerSpecification
    | LineLayerSpecification
    | SymbolLayerSpecification
    | HeatmapLayerSpecification
  let info: RasterTileMetadata
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  ;({ definition, info } = layerConfig)
  const bandIndex = getActiveBandIndex(info)
  let layerMin = Number(info['band_metadata'][bandIndex][1]['STATISTICS_MINIMUM'])
  let layerMax = Number(info['band_metadata'][bandIndex][1]['STATISTICS_MAXIMUM'])
  const layerSrc = $map.getSource(definition.source)
  const layerURL = new URL(layerSrc.tiles[0])

  let colorMap = {}
  let colorMapName = layerConfig.colorMapName
  let layerColorMap: chroma.Scale = undefined

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
    if (layerURL.searchParams.has('rescale')) {
      layerURL.searchParams.delete('rescale')
    }
    if (useLayerColorMapRows === false) {
      const colorMapRows = []
      const bandName = Object.keys(layerConfig.info.stats)
      layerMin = layerConfig.info.stats[bandName]['min']
      layerMax = layerConfig.info.stats[bandName]['max']
      setColorMap()
      const uValues = info.stats[bandName]['histogram'][1]
      const layerUniqueValues = uValues.map((v) => {
        return { name: v, value: v }
      })

      let index = 0
      layerUniqueValues.forEach((row: UniqueLegendColorMapRow) => {
        const key = row.value
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        const color = [...layerColorMap(key).rgb(), 255]

        colorMap[parseInt(remapInputValue(key, layerMin, layerMax, layerMin, layerMax))] = color
        //colorMap[key] = color
        colorMapRows.push({ index, color, start: key, end: row.name })
        index++
      })

      layerConfig.unique.colorMapRows = colorMapRows
    } else {
      layerConfig.unique.colorMapRows.forEach((row) => {
        colorMap[parseInt(remapInputValue(row.start, layerMin, layerMax, layerMin, layerMax))] = row.color
      })
    }

    handleParamsUpdate(colorMap)
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

  const handleParamsUpdate = debounce((cmap) => {
    const encodeColorMapRows = JSON.stringify(cmap)
    layerURL.searchParams.delete('colormap_name')
    let updatedParams = Object.assign({ colormap: encodeColorMapRows })
    updateParamsInURL(definition, layerURL, updatedParams)
  }, 500)

  const handleColorPickerClick = (event: CustomEvent) => {
    colorPickerVisibleIndex = event.detail.index
  }

  const handleChangeColorMap = (e) => {
    const valuesList = Object.keys(colorMap)
    colorMap[valuesList[colorPickerVisibleIndex]] = [e.detail.color.r, e.detail.color.g, e.detail.color.b, 255]
    layerConfig.unique.colorMapRows.splice(colorPickerVisibleIndex, 1, {
      index: colorPickerVisibleIndex,
      color: [e.detail.color.r, e.detail.color.g, e.detail.color.b, 255],
      start: layerConfig.unique.colorMapRows[colorPickerVisibleIndex].start,
      end: layerConfig.unique.colorMapRows[colorPickerVisibleIndex].end,
    })
    reclassifyImage(true)
  }
</script>

<div class="is-divider" data-content="Unique values" />
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
  .rows {
    width: 100%;
    //margin: 0 auto;
    max-height: 200px;
  }

  .unique-view-container {
    //width: 100%;
    max-height: 200px;
    display: flex;
    align-items: center;
    flex-direction: column;
    flex-wrap: wrap;
  }
</style>
