<script lang="ts">
  import type { LayerSpecification } from 'maplibre-gl'
  import { createEventDispatcher } from 'svelte'

  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer, VectorLayerTileStatAttribute, VectorLayerTileStatLayer } from '$lib/types'
  import { map } from '$stores'
  import PropertySelect from './PropertySelect.svelte'
  import { getLayerStyle } from '$lib/helper'

  export let layer: Layer = LayerInitialValues
  export let decimalPosition = undefined
  export let fieldType: string = undefined

  const dispatch = createEventDispatcher()
  const layerId = layer.id
  const propertyName = 'text-field'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let textFieldValue = ''
  let showEmptyFields = true

  $: textFieldValue, setTextField()

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

  const setDefaultProperty = (selectOptions: string[]) => {
    if (selectOptions.length === 0) return
    textFieldValue = getCurrentValue()
    setTextField()
    return textFieldValue
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
        (tileLayer: VectorLayerTileStatLayer) => tileLayer.layer == getLayerStyle($map, layer.id)['source-layer'],
      )
      if (tileStatLayer) {
        const tileStatLayerAttribute = tileStatLayer.attributes.find(
          (val: VectorLayerTileStatAttribute) => val.attribute === fieldName,
        )
        if (tileStatLayerAttribute) {
          let type = tileStatLayerAttribute.type
          if (tileStatLayerAttribute.type === 'number') {
            if (tileStatLayerAttribute.values && tileStatLayerAttribute.values.length > 0) {
              tileStatLayerAttribute.values.forEach((val: number) => {
                type = isInt(val) ? 'interger' : 'float'
              })
            } else if (tileStatLayerAttribute.min) {
              type = isInt(tileStatLayerAttribute.min) ? 'interger' : 'float'
            } else {
              type = 'integer'
            }
          }
          return type
        }
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

<PropertySelect
  bind:showEmptyFields
  bind:propertySelectValue={textFieldValue}
  {layer}
  on:select={setTextField}
  {setDefaultProperty} />
