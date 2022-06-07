<script lang="ts">
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'

  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const propertyName = 'line-join'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let choices = ['bevel', 'round', 'miter']
  let selected = style.layout && style.layout[propertyName] ? style.layout[propertyName] : 'miter'

  $: selected, setLineJoin()

  const setLineJoin = () => {
    if (style.type !== LayerTypes.LINE) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }
    newStyle.layout[propertyName] = selected
    $map.setLayoutProperty(layerId, propertyName, selected)
  }
</script>

<div style="width: 60%;">
  {#each choices as choice}
    <div class="columns is-gapless mb-1">
      <div class="column is-4">
        <input type="radio" bind:group={selected} value={choice} alt={`${choice} Option`} title={`${choice} Option`} />
      </div>
      <div class="column" style="position: relative; top: -2px">
        {choice}
      </div>
    </div>
  {/each}
</div>
