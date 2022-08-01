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
  const layerMin = Number(info['band_metadata'][bandIndex][1]['STATISTICS_MINIMUM'])
  const layerMax = Number(info['band_metadata'][bandIndex][1]['STATISTICS_MAXIMUM'])
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

      const uValues = info.stats[info.active_band_no]['histogram'][1]
      const layerUniqueValues = uValues.map((v) => {
        return { name: v, value: v }
      })

      colorMap = {}
      let index = 0

      layerUniqueValues.forEach((row: UniqueLegendColorMapRow) => {
        const key = row.value
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        const color = [...layerColorMap(key).rgb(), 255]

        colorMap[parseInt(remapInputValue(key, layerMin, layerMax))] = color
        //colorMap[key] = color
        colorMapRows.push({ index, color, start: key, end: row.name })
        index++
      })

      layerConfig.unique.colorMapRows = colorMapRows

      // use existing color map rows from layer
    } else {
      layerConfig.unique.colorMapRows.forEach((row) => {
        colorMap[parseInt(remapInputValue(row.start, layerMin, layerMax))] = row.color
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
  .unique-view-container {
    width: 100%;
    display: grid;
    grid-auto-rows: minmax(10px, auto);
    grid-auto-flow: row;
    grid-template-columns: auto auto;
    // grid-template-rows: repeat(auto-fill, 120px);
    // grid-row-gap: .5em;
    // grid-column-gap: 1em;
    border: 0px solid red;
  }
</style>
