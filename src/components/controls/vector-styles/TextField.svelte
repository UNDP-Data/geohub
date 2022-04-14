<script lang="ts">
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { createEventDispatcher } from 'svelte'
  import Textfield from '@smui/textfield'
  import HelperText from '@smui/textfield/helper-text'

  import { map } from '../../../stores'
  import type { Layer } from '../../../lib/types'
  import { LayerInitialValues, LayerTypes } from '../../../lib/constants'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'text-field'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]
  const styleValue: string[] = style.layout && style.layout[propertyName] ? style.layout[propertyName] : ['get', '']
  let textFieldValue: string
  if (styleValue.length > 1 && styleValue[0] === 'get') {
    textFieldValue = styleValue[1]
  }

  $: textFieldValue, setTextField()

  const setTextField = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }
    const propertyValue = ['get', textFieldValue]
    newStyle.layout[propertyName] = propertyValue
    $map.setLayoutProperty(layerId, propertyName, propertyValue)

    // variable label placement settings: https://docs.mapbox.com/mapbox-gl-js/example/variable-label-placement/
    $map.setLayoutProperty(layerId, 'text-variable-anchor', ['top', 'bottom', 'left', 'right'])
    $map.setLayoutProperty(layerId, 'text-radial-offset', 0.5)
    $map.setLayoutProperty(layerId, 'text-justify', 'auto')

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <div class="text-field">
    <Textfield style="width: 100%;" variant="outlined" bind:value={textFieldValue} label="text-field">
      <HelperText persistent slot="helper">Value to use for a text label</HelperText>
    </Textfield>
  </div>
{/if}
