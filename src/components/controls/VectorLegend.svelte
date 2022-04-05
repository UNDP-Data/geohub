<script lang="ts">
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import Button, { Label as LabelButton } from '@smui/button'
  import Textfield from '@smui/textfield'
  import HelperText from '@smui/textfield/helper-text'

  import { map } from '../../stores'
  import type { Layer } from '../../lib/types'
  import { LayerInitialValues } from '../../lib/constants'
  import { stringifyStyleJSON } from '../../lib/helper'
  import VectorLegendSymbol from './VectorLegendSymbol.svelte'
  import MinMaxZoom from './vector-styles/MinMaxZoom.svelte'
  import LineWidth from './vector-styles/LineWidth.svelte'
  import LineBlur from './vector-styles/LineBlur.svelte'
  import LineColor from './vector-styles/LineColor.svelte'

  export let layer: Layer = LayerInitialValues
  let updateLegend

  const layerId = layer.definition.id
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  $: styleJSON = stringifyStyleJSON(style)

  const onStyleChange = () => {
    const _style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]
    styleJSON = stringifyStyleJSON(_style)
    updateLegend()
  }

  const applyLayerStyle = () => {
    const newStyle = JSON.parse(styleJSON)
    if (newStyle.minzoom && newStyle.maxzoom) {
      $map.setLayerZoomRange(layerId, newStyle.minzoom, newStyle.maxzoom)
    }
    if (newStyle.paint) {
      Object.keys(newStyle.paint).forEach((key) => {
        const value = newStyle.paint[key]
        $map.setPaintProperty(layerId, key, value)
      })
    }
    if (newStyle.layout) {
      Object.keys(newStyle.layout).forEach((key) => {
        const value = newStyle.layout[key]
        $map.setLayoutProperty(layerId, key, value)
      })
    }
    updateLegend()
  }
</script>

<div>
  <VectorLegendSymbol bind:updateLegend {layer} />

  <MinMaxZoom on:change={onStyleChange} {layer} />

  <LineWidth on:change={onStyleChange} {layer} />
  <LineBlur on:change={onStyleChange} {layer} />
  <LineColor on:change={onStyleChange} {layer} />

  <hr />
  <Textfield textarea bind:value={styleJSON} label="style.json" style="width: 100%;" helperLine$style="width: 100%;">
    <HelperText slot="helper">style.json for the layer</HelperText>
  </Textfield>
  <div class="changeLegendButtonDiv">
    <Button class="changelegendbtn" variant="raised" on:click={() => applyLayerStyle()}>
      <LabelButton>Apply</LabelButton>
    </Button>
  </div>
</div>

<style lang="scss">
  :global(.changeLegendButtonDiv) {
    margin: 0 auto;
    padding-top: 10px;
    width: 80%;
    display: flex;
  }
  :global(.changelegendbtn) {
    text-transform: capitalize;
    height: 30px;
    width: 100%;
  }
</style>
