<script lang="ts">
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { createEventDispatcher } from 'svelte'
  import Select, { Option } from '@smui/select'

  import { map } from '$stores'
  import type { Layer, VectorLayerMetadata } from '$lib/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'

  export let layer: Layer = LayerInitialValues
  export let enabledTextLabel = false

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const metadata = layer.info
  let vectorLayerMeta: VectorLayerMetadata
  let layerIdList: string[]
  const propertyName = 'text-field'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]
  let textFieldValue: string = null

  $: enabledTextLabel, setDefaultTextField()

  const setDefaultTextField = () => {
    if (!enabledTextLabel) {
      vectorLayerMeta = null
      layerIdList = null
      textFieldValue = null
      return
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    vectorLayerMeta = metadata.json.vector_layers.find((l) => l.id === layer.definition['source-layer'])
    layerIdList = Object.keys(vectorLayerMeta.fields)
    const styleValue: string[] = style.layout && style.layout[propertyName] ? style.layout[propertyName] : ['get', '']

    if (styleValue.length > 1 && styleValue[0] === 'get' && styleValue[1].length > 0) {
      textFieldValue = styleValue[1]
    } else {
      textFieldValue = layerIdList[0]
    }
  }

  $: textFieldValue, setTextField()

  const setTextField = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    if (!textFieldValue) return
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
  <div>
    <Select bind:value={textFieldValue} label="Text field" variant="outlined">
      {#if layerIdList}
        {#each layerIdList as id}
          <Option value={id}>{id}</Option>
        {/each}
      {/if}
    </Select>
  </div>
{/if}
