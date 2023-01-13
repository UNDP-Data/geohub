<script lang="ts">
  import type { SymbolLayerSpecification } from 'maplibre-gl'
  import { createEventDispatcher } from 'svelte'

  import { LayerTypes } from '$lib/constants'
  import type { Layer, VectorLayerTileStatAttribute, VectorLayerTileStatLayer } from '$lib/types'
  import { map } from '$stores'
  import PropertySelect from './PropertySelect.svelte'
  import { getLayerStyle, getPropertyValueFromExpression } from '$lib/helper'

  export let layer: Layer
  export let decimalPosition = undefined
  export let fieldType: string = undefined
  export let textFieldValue = ''

  const dispatch = createEventDispatcher()
  const layerId = layer.id
  const propertyName = 'text-field'
  let style = getLayerStyle($map, layer.id)
  let showEmptyFields = true

  $: textFieldValue, setTextField()

  $: decimalPosition, setDesimalPosition()
  const setDesimalPosition = () => {
    if (!$map) return
    if (!$map.getLayer(layerId)) return
    if (['line', 'fill'].includes($map.getLayer(layerId).type)) return
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
    textFieldValue = getPropertyValueFromExpression(style, propertyName, 'layout')
    setTextField()
    return textFieldValue
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
    if (!style && !textFieldValue) return
    if (!style && layer.parentId) {
      const parentStyle = getLayerStyle($map, layer.parentId)
      const childLayer: SymbolLayerSpecification = {
        id: layerId,
        type: LayerTypes.SYMBOL,
        source: parentStyle['source'],
        'source-layer': parentStyle['source-layer'],
        layout: {
          visibility: 'visible',
          'text-size': 16,
          'text-max-width': 10,
        },
        paint: {
          'text-color': 'rgba(0,0,0,1)',
          'text-halo-color': 'rgba(255,255,255,1)',
          'text-halo-width': 1,
        },
      }
      if (parentStyle.minzoom) {
        childLayer.minzoom = parentStyle.minzoom
      }
      if (parentStyle.maxzoom) {
        childLayer.maxzoom = parentStyle.maxzoom
      }
      style = childLayer
    }

    if (style.type !== LayerTypes.SYMBOL) return

    if (textFieldValue) {
      // variable label placement settings: https://docs.mapbox.com/mapbox-gl-js/example/variable-label-placement/
      style.layout['text-variable-anchor'] = ['top', 'bottom', 'left', 'right']
      style.layout['text-radial-offset'] = 0.5
      style.layout['text-justify'] = 'auto'
      if (!$map.getLayer(layerId)) {
        $map.addLayer(style)
      }
      setDesimalPosition()
    } else {
      if (layer.parentId) {
        if ($map.getLayer(layerId)) {
          $map.removeLayer(layerId)
        }
      } else {
        $map.setLayoutProperty(layerId, propertyName, undefined)
        $map.setLayoutProperty(layerId, 'text-variable-anchor', undefined)
        $map.setLayoutProperty(layerId, 'text-radial-offset', undefined)
        $map.setLayoutProperty(layerId, 'text-justify', undefined)
      }
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
