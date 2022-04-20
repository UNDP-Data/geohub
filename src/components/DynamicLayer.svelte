<script lang="ts">
  import Button, { Label } from '@smui/button'
  import Chip, { Set, Text } from '@smui/chips'
  import Dialog, { Title, Content, Actions } from '@smui/dialog'
  import List, { Item, Text as LText } from '@smui/list'
  import Select, { Option } from '@smui/select'
  import Textfield from '@smui/textfield'
  import HelperText from '@smui/textfield/helper-text'
  import { v4 as uuidv4 } from 'uuid'
  import RangeSlider from 'svelte-range-slider-pips'
  import type { RasterLayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'

  import { dynamicLayers, layerList, map } from '../stores'
  import Calculator from './raster/Calculator.svelte'
  import { DynamicLayerLegendTypes, DynamicLayerResolutionTypes, LayerTypes } from '$lib/constants'

  export let open = false

  let clickedLayer = undefined
  let expression = ''
  let layerMaximum = 10
  let layerMinimum = 0
  let layerNames = []
  let layerStep = 0
  let newLayerId = ''
  let newLayerName = ''
  let rangeSliderValues = []
  let selectedLegendType = ''
  let selectedRes = DynamicLayerResolutionTypes.HIGHEST

  $: open, initialize()
  $: newLayerName !== '' ? (newLayerId = uuidv4()) : newLayerId

  const initialize = () => {
    layerNames = $layerList.filter((layer) => $dynamicLayers.includes(layer.definition.id)).map((layer) => layer.name)
  }

  const setLayerExpression = () => {
    if (clickedLayer) {
      const inputLayer = $layerList.find((layer) => layer.definition.id === clickedLayer)
      layerMinimum = Number(Number(inputLayer.info['band_metadata'][0][1]['STATISTICS_MINIMUM']).toFixed(2))
      layerMaximum = Number(Number(inputLayer.info['band_metadata'][0][1]['STATISTICS_MAXIMUM']).toFixed(2))

      layerStep = (layerMaximum - layerMinimum) * 1e-2
      layerStep = parseFloat(layerStep.toFixed(2))
      rangeSliderValues = [layerMinimum + layerStep * 50]
      expression += `b${$dynamicLayers.indexOf(clickedLayer) + 1}`
    }
  }

  const processSliderClick = () => {
    expression += `${rangeSliderValues[0]}`
  }

  const processCombinedLayer = (action: boolean) => {
    if (action === true) {
      let combinedurl = ''
      let bounds = []
      $dynamicLayers.forEach((layerId) => {
        const inLayer = $layerList.find((item) => item.definition.id === layerId)

        const layerSource = $map.getSource(inLayer.definition.source)
        const tileUrl = new URL(layerSource.tiles[0])
        const layerUrl = tileUrl.searchParams.get('url')
        if (combinedurl === '') {
          combinedurl = `${tileUrl.protocol}/${tileUrl.host}${decodeURI(
            tileUrl.pathname,
          )}?scale=1&TileMatrixSetId=WebMercatorQuad`
          bounds = layerSource.bounds
        }
        combinedurl += `&url=${layerUrl}`
      })

      combinedurl += `&unscale=false&resampling=nearest&rescale=0,1&colormap_name=viridis&return_mask=true`

      const layerSource = {
        type: LayerTypes.RASTER,
        tiles: [combinedurl],
        tileSize: 256,
        bounds: bounds,
        attribution:
          'Map tiles by <a target="_top" rel="noopener" href="http://undp.org">UNDP</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>',
      }

      const uuid = uuidv4()
      if (!(uuid in $map.getStyle().sources)) {
        $map.addSource(uuid, layerSource)
      }

      const definition: RasterLayerSpecification = {
        id: newLayerId || 'test',
        type: LayerTypes.RASTER,
        source: uuid,
        minzoom: 0,
        maxzoom: 22,
        layout: {
          visibility: 'visible',
        },
      }

      layerList.set([
        { name: newLayerName || 'test', definition: definition, type: LayerTypes.RASTER, info: {} },
        ...$layerList,
      ])
      let firstSymbolId = undefined
      for (const layer of $map.getStyle().layers) {
        if (layer.type === 'symbol') {
          firstSymbolId = layer.id
          break
        }
      }

      $map.addLayer(definition, firstSymbolId)
    }

    expression = ''
    clickedLayer = undefined
  }

  const setClickedLayer = (layerId: string) => {
    clickedLayer = layerId
    setLayerExpression()
  }
</script>

<Dialog
  bind:open
  aria-labelledby="large-scroll-title"
  aria-describedby="large-scroll-content"
  surface$style="width: 600px; max-width: calc(100vw - 32px);">
  <Title id="large-scroll-title">Create a new combined/dynamic layer</Title>
  <Content>
    <div class="wrapper">
      <div>
        <Textfield variant="filled" bind:value={newLayerName} label="Layer name">
          <HelperText slot="helper">...set the name of the new layer ...</HelperText>
        </Textfield>
        {#if newLayerName}
          <span class="lid">ID: {newLayerId}</span>
        {/if}
      </div>
      <div>
        <List style="max-width:300px">
          {#each $dynamicLayers as l}
            <Item
              on:SMUI:action={() => {
                setClickedLayer(l)
              }}>
              <LText>{layerNames[$dynamicLayers.indexOf(l)]}</LText>
            </Item>
          {/each}
        </List>
      </div>

      {#if clickedLayer !== undefined}
        <div class="onecol">
          <div class="slider">
            <RangeSlider
              bind:values={rangeSliderValues}
              float
              min={layerMinimum}
              max={layerMaximum}
              step={layerStep}
              pips
              first="label"
              last="label"
              rest={false} />
          </div>
          <div>
            <Button on:click={() => processSliderClick()}>
              <Label>Insert</Label>
            </Button>
          </div>
        </div>
        <div class="expr">
          <Calculator bind:expression />
        </div>
      {/if}

      <div>
        <Select bind:value={selectedLegendType} label="Select legend type">
          {#each Object.values(DynamicLayerLegendTypes) as legendType}
            <Option value={legendType}>{legendType}</Option>
          {/each}
        </Select>
      </div>

      <div>
        <Set chips={Object.values(DynamicLayerResolutionTypes)} let:chip choice bind:selected={selectedRes}>
          <Chip {chip} touch>
            <Text>{chip}</Text>
          </Chip>
        </Set>
      </div>

      {#if expression !== ''}
        <div class="expr">
          {@html expression}
        </div>
      {/if}
    </div>
  </Content>
  <Actions>
    <Button on:click={() => processCombinedLayer(true)}>
      <Label>Create</Label>
    </Button>
    <Button on:click={() => processCombinedLayer(false)}>
      <Label>Cancel</Label>
    </Button>
  </Actions>
</Dialog>

<style lang="scss">
  .wrapper {
    border: 0px solid;
    display: grid;
    grid-template-rows: repeat(-1, minmax(0, 1fr));
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px 5px;
    align-items: center;
    justify-items: center;
  }
  .wrapper > div {
    background-color: rgba(255, 255, 255, 0.8);
    text-align: center;
    border: 0px solid blue;
    align-items: stretch;
    grid-auto-rows: 1fr;
  }
  .expr {
    grid-column: 1/-1;
    border: 1px solid red;
  }
  .lid {
    font-family: Roboto, serif;
    font-size: 8pt;
  }

  .onecol {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    margin: auto;
    border: 1px solid red;
    width: 250px;

    .slider {
      --range-handle-focus: #2196f3;
      --range-range-inactive: #2196f3;
      --range-handle-inactive: #2196f3;
      --range-handle: #2196f3;
      width: 100%;
    }
  }
</style>
