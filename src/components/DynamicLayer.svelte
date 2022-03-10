<script lang="ts">
  import Button, { Label } from '@smui/button'
  import Chip, { Set, Text } from '@smui/chips'
  import Dialog, { Title, Content, Actions } from '@smui/dialog'
  import List, { Item, Text as LText } from '@smui/list'
  import Select, { Option } from '@smui/select'
  import Slider from '@smui/slider'
  import Textfield from '@smui/textfield'
  import HelperText from '@smui/textfield/helper-text'
  import { v4 as uuidv4 } from 'uuid'

  import Calculator from './raster/Calculator.svelte'
  import { map } from '../stores/mapstore'
  import { layerList, dynamicLayers } from '../stores/stores'

  export let open = false
  let lMin = 0
  let lMax = 10
  let lStep = 0
  let lSliderValue = 0

  $: open, initialize()

  let selectedRes = 'highest'
  let resChoices = ['highest', 'lowest', 'average']

  let legendTypes = ['continuous', 'bucketed']
  let selectedLegendType = ''

  let newLayerName = ''
  let newLayerId = ''
  let clickedLayer = ''
  let lNames = []
  let expression = ''

  $: if (newLayerName != '') {
    newLayerId = uuidv4()
  }

  const initialize = () => {
    lNames = $layerList
      .filter((item) => {
        return $dynamicLayers.includes(item.definition.id)
      })
      .map((item) => {
        return item.name
      })
  }

  const setLayerExpression = () => {
    if (clickedLayer) {
      let inputLayer = $layerList.filter((item) => item.definition.id === clickedLayer).pop()
      lMin = Number(Number(inputLayer.info['band_metadata'][0][1]['STATISTICS_MINIMUM']).toFixed(2))
      lMax = Number(Number(inputLayer.info['band_metadata'][0][1]['STATISTICS_MAXIMUM']).toFixed(2))

      lStep = (lMax - lMin) * 1e-2
      lStep = parseFloat(lStep.toFixed(2))

      lSliderValue = lMin + lStep * 50
      let inputLayerIdx = $dynamicLayers.indexOf(clickedLayer) + 1
      expression += `b${inputLayerIdx}`
    }
  }

  const processSliderClick = () => {
    expression += `${lSliderValue}`
  }

  const processCombinedLayer = (action: boolean) => {
    //#TODO: use env var to set the endpoint
    if (action == true) {
      let combinedurl = ''
      let bounds = []
      $dynamicLayers.forEach((lid) => {
        console.log(`processing ${lid}`)
        let inLayer = $layerList.filter((item) => item.definition.id === lid).pop()

        let lSrc = $map.getSource(inLayer.definition.source)
        let tileurl = lSrc.tiles[0]
        let tURL = new URL(tileurl)

        let lurl = tURL.searchParams.get('url')
        if (combinedurl == '') {
          combinedurl = `${tURL.protocol}/${tURL.host}${decodeURI(
            tURL.pathname,
          )}?scale=1&TileMatrixSetId=WebMercatorQuad`
          bounds = lSrc.bounds
        }
        combinedurl += `&url=${lurl}`
      })

      combinedurl += `&unscale=false&resampling=nearest&rescale=0,1&colormap_name=viridis&return_mask=true`

      const lSrc = {
        type: 'raster',
        tiles: [combinedurl],
        tileSize: 256,
        bounds: bounds,
        attribution:
          'Map tiles by <a target="_top" rel="noopener" href="http://undp.org">UNDP</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>',
      }

      const srcID = uuidv4()
      if (!(srcID in $map.getStyle().sources)) {
        $map.addSource(srcID, lSrc)
      }
      const layerDefinition = {
        id: newLayerId || 'test',
        type: 'raster',
        source: srcID,
        minzoom: 0,
        maxzoom: 22,
        layout: {
          visibility: 'visible',
        },
      }

      layerList.set([{ name: newLayerName || 'test', definition: layerDefinition, type: 'raster' }, ...$layerList])
      let firstSymbolId = undefined
      for (const layer of $map.getStyle().layers) {
        if (layer.type === 'symbol') {
          firstSymbolId = layer.id
          break
        }
      }
      $map.addLayer(layerDefinition, firstSymbolId)
    }

    expression = ''
    clickedLayer = undefined
  }

  const setClickedLayer = (layer: string) => {
    clickedLayer = layer
    setLayerExpression()
  }
</script>

<Dialog
  bind:open
  aria-labelledby="large-scroll-title"
  aria-describedby="large-scroll-content"
  surface$style="width: 600px; max-width: calc(100vw - 32px);"
>
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
              }}
            >
              <LText>{lNames[$dynamicLayers.indexOf(l)]}</LText>
            </Item>
          {/each}
        </List>
      </div>

      {#if clickedLayer != undefined}
        <div class="onecol">
          <div>{lMin}</div>
          <Slider
            discrete
            bind:value={lSliderValue}
            min={lMin}
            max={lMax}
            step={lStep}
            style="width:300px"
            input$aria-label="Layer opacity"
          />
          <div>{lMax}</div>
          <div>
            <Button on:click={() => processSliderClick()}>
              <Label>USE</Label>
            </Button>
          </div>
        </div>
        <div class="expr">
          <Calculator bind:expression />
        </div>
      {/if}

      <div>
        <Select bind:value={selectedLegendType} label="Select legend type">
          {#each legendTypes as legendType}
            <Option value={legendType}>{legendType}</Option>
          {/each}
        </Select>
      </div>

      <div>
        <Set chips={resChoices} let:chip choice bind:selected={selectedRes}>
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

<style>
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
  }
</style>
