<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Switch from '@smui/switch'
  import FormField from '@smui/form-field'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'icon-ignore-placement'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let checked = style.layout && style.layout[propertyName] ? style.layout[propertyName] : false

  $: checked, setIconKeepUpright()

  const setIconKeepUpright = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }
    newStyle.layout[propertyName] = checked
    $map.setLayoutProperty(layerId, propertyName, checked)

    dispatch('change')
  }
</script>

<FormField>
  <Switch bind:checked />
</FormField>
