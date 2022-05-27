<script lang="ts">
  import { onMount } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'
  import { createEventDispatcher } from 'svelte'

  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer, VectorLayerMetadata } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const metadata = layer.info
  const propertyName = 'text-field'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let layerIdList: string[] = []
  let textFieldValue = ''
  let vectorLayerMeta: VectorLayerMetadata

  $: textFieldValue, setTextField()

  onMount(() => {
    setDefaultTextField()
  })

  const setDefaultTextField = () => {
    if (!vectorLayerMeta) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      vectorLayerMeta = metadata.json.vector_layers.find((l) => l.id === layer.definition['source-layer'])
      layerIdList = Object.keys(vectorLayerMeta.fields)
    }

    const styleValue: string[] = style.layout && style.layout[propertyName] ? style.layout[propertyName] : ['get', '']

    if (styleValue.length > 1 && styleValue[0] === 'get' && styleValue[1].length > 0) {
      textFieldValue = styleValue[1]
    } else {
      textFieldValue = ''
    }
    setTextField()
  }

  const setTextField = () => {
    if (style.type !== LayerTypes.SYMBOL) return

    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }
    if (textFieldValue) {
      const propertyValue = ['get', textFieldValue]
      newStyle.layout[propertyName] = propertyValue
      $map.setLayoutProperty(layerId, propertyName, propertyValue)

      // variable label placement settings: https://docs.mapbox.com/mapbox-gl-js/example/variable-label-placement/
      $map.setLayoutProperty(layerId, 'text-variable-anchor', ['top', 'bottom', 'left', 'right'])
      $map.setLayoutProperty(layerId, 'text-radial-offset', 0.5)
      $map.setLayoutProperty(layerId, 'text-justify', 'auto')
    } else {
      $map.setLayoutProperty(layerId, propertyName, undefined)
      $map.setLayoutProperty(layerId, 'text-variable-anchor', undefined)
      $map.setLayoutProperty(layerId, 'text-radial-offset', undefined)
      $map.setLayoutProperty(layerId, 'text-justify', undefined)
    }

    dispatch('change', {
      textFieldValue,
    })
  }
</script>

<div class="select is-rounded  is-justify-content-center" style="height: 30px;width:100%">
  <select bind:value={textFieldValue} style="width: 100%;" alt="text-field" title="Text field for label">
    <option class="legend-text" value={''} />
    {#each layerIdList as id}
      <option class="legend-text" value={id}>{id}</option>
    {/each}
  </select>
</div>
