<script lang="ts">
  import { onMount } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'
  import { createEventDispatcher } from 'svelte'

  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer, VectorLayerMetadata, VectorLayerTileStatAttribute, VectorLayerTileStatLayer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues
  export let decimalPosition = undefined
  export let fieldType: string = undefined

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

  $: decimalPosition, setDesimalPosition()
  const setDesimalPosition = () => {
    if (textFieldValue) {
      fieldType = getFieldDataType(textFieldValue)
      let propertyValue: any = ['get', textFieldValue]
      if (fieldType && ['number', 'float'].includes(fieldType)) {
        if (!decimalPosition) {
          decimalPosition = 1
        }
        propertyValue = [
          'number-format',
          ['get', textFieldValue],
          { 'min-fraction-digits': decimalPosition, 'max-fraction-digits': decimalPosition },
        ]
      } else if (fieldType && fieldType === 'integer') {
        propertyValue = [
          'number-format',
          ['get', textFieldValue],
          { 'min-fraction-digits': 0, 'max-fraction-digits': 0 },
        ]
      }
      $map.setLayoutProperty(layerId, propertyName, propertyValue)
    } else {
      $map.setLayoutProperty(layerId, propertyName, undefined)
    }
  }

  const setDefaultTextField = () => {
    if (!vectorLayerMeta) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      vectorLayerMeta = metadata.json.vector_layers.find((l) => l.id === layer.definition['source-layer'])
      layerIdList = Object.keys(vectorLayerMeta.fields)
    }
    textFieldValue = getCurrentValue()
    setTextField()
  }

  const getCurrentValue = () => {
    let value = ''
    if (style.layout && style.layout[propertyName]) {
      const values: any = style.layout[propertyName]
      for (let i = 0; i < values.length; i++) {
        const expression = values[i]
        if (Array.isArray(expression)) {
          if (expression[0] === 'get') {
            value = expression[1]
            break
          }
        } else if (expression === 'get') {
          value = values[i + 1]
          break
        }
      }
    }
    return value
  }

  const isInt = (n: number) => {
    return Number(n) === n && n % 1 === 0
  }

  const getFieldDataType = (fieldName: string) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const tilestats = layer?.info?.json?.tilestats
    if (tilestats) {
      const tileStatLayer = tilestats?.layers.find(
        (tileLayer: VectorLayerTileStatLayer) => tileLayer.layer == layer.definition['source-layer'],
      )
      if (tileStatLayer) {
        const tileStatLayerAttribute = tileStatLayer.attributes.find(
          (val: VectorLayerTileStatAttribute) => val.attribute === fieldName,
        )
        let type = tileStatLayerAttribute.type
        if (tileStatLayerAttribute.type === 'number') {
          tileStatLayerAttribute.values.forEach((val: number) => {
            type = isInt(val) ? 'interger' : 'float'
          })
        }
        return type
      }
    }
  }

  const setTextField = () => {
    if (style.type !== LayerTypes.SYMBOL) return

    if (textFieldValue) {
      setDesimalPosition()

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
