<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'
  import type { RasterLayerSpecification, SourceSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { LayerTypes } from '$lib/constants'
  import { fetchUrl } from '$lib/helper'
  import { map, year } from '../stores'

  const TOKEN = import.meta.env.VITE_AZURE_BLOB_TOKEN
  const API_URL = import.meta.env.VITE_TITILER_ENDPOINT
  export let AZURE_URL: string
  export let BEFORE_LAYER_ID = undefined

  export const getHreaUrl = (y: number) => {
    return `${AZURE_URL}/electricity/High_Resolution_Electricity_Access/Electricity_Access/Electricity_access_estimate_${y}.tif?${TOKEN}`
  }
  export const getMlUrl = (y: number) => {
    return `${AZURE_URL}/electricity/Machine_Learning_Electricity_Access/Electricity_access_${y}.tif?${TOKEN}`
  }

  const UNDP_DASHBOARD_RASTER_LAYER_ID = 'dashboard-electricity-raster-layer'
  const UNDP_DASHBOARD_RASTER_SOURCE_ID = 'dashboard-electricity-raster-source'

  let minValue = 2012
  let maxValue = 2020
  let rangeSliderValues = [2020]

  export let electricitySelected
  $: electricitySelected, setSlider()
  const setSlider = () => {
    switch (electricitySelected.name) {
      case 'HREA':
        minValue = 2012
        maxValue = 2020
        break
      case 'ML':
        if (rangeSliderValues[0] > 2019) {
          rangeSliderValues[0] = 2019
        }
        minValue = 2012
        maxValue = 2019
        break
      default:
        break
    }
  }

  $: rangeSliderValues, loadLayer()

  export function loadLayer() {
    if (!$map) return
    const yearValue = rangeSliderValues[0]
    year.update(() => yearValue)
    let url = electricitySelected.name === 'HREA' ? getHreaUrl($year) : getMlUrl($year)
    loadRasterLayer(url)
  }

  const loadRasterLayer = async (url: string) => {
    if (!$map) return
    const layerInfo = await fetchUrl(`${API_URL}/info?url=${url}`)
    if (!(layerInfo && layerInfo['band_metadata'])) {
      return
    }
    const layerBandMetadataMin = layerInfo['band_metadata'][0][1]['STATISTICS_MINIMUM']
    const layerBandMetadataMax = layerInfo['band_metadata'][0][1]['STATISTICS_MAXIMUM']
    const apiUrlParams = new URLSearchParams()
    apiUrlParams.set('scale', '1')
    apiUrlParams.set('TileMatrixSetId', 'WebMercatorQuad')
    apiUrlParams.set('url', url)
    apiUrlParams.set('bidx', '1')
    apiUrlParams.set('unscale', 'false')
    apiUrlParams.set('resampling', 'nearest')
    apiUrlParams.set('rescale', `${layerBandMetadataMin},${layerBandMetadataMax}`)
    apiUrlParams.set('return_mask', 'true')
    apiUrlParams.set('colormap_name', 'bugn')

    const layerSource: SourceSpecification = {
      type: LayerTypes.RASTER,
      tiles: [`${API_URL}/tiles/{z}/{x}/{y}.png?${apiUrlParams.toString()}`],
      tileSize: 256,
      bounds: layerInfo['bounds'],
      attribution:
        'Map tiles by <a target="_top" rel="noopener" href="http://undp.org">UNDP</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.\
                Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>',
    }

    const layerDefinition: RasterLayerSpecification = {
      id: UNDP_DASHBOARD_RASTER_LAYER_ID,
      type: LayerTypes.RASTER,
      source: UNDP_DASHBOARD_RASTER_SOURCE_ID,
      minzoom: 0,
      maxzoom: 22,
      layout: { visibility: 'visible' },
    }

    let firstSymbolId = undefined
    for (const layer of $map.getStyle().layers) {
      if (layer.type === 'symbol' || layer.id === BEFORE_LAYER_ID) {
        firstSymbolId = layer.id
        break
      }
    }

    if ($map.getLayer(layerDefinition.id)) $map.removeLayer(layerDefinition.id)
    if ($map.getSource(UNDP_DASHBOARD_RASTER_SOURCE_ID)) $map.removeSource(UNDP_DASHBOARD_RASTER_SOURCE_ID)

    $map.addSource(UNDP_DASHBOARD_RASTER_SOURCE_ID, layerSource)
    $map.addLayer(layerDefinition, firstSymbolId)
  }
</script>

<div class="slider">
  <RangeSlider
    bind:values={rangeSliderValues}
    float
    min={minValue}
    max={maxValue}
    step={1}
    pips
    pipstep={2}
    first="label"
    last="label"
    rest="label"
    all={true} />
</div>
