<script lang="ts">
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'
  import { isEqual, sortBy } from 'lodash-es'

  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const propertyName = 'line-dasharray'
  const layerId = layer.definition.id
  const lineTypes = [
    { title: 'solid', value: [1] },
    { title: 'dash', value: [10, 4] },
    { title: 'dash-dot', value: [10, 3, 2, 3] },
    { title: 'dot', value: [1, 5, 1] },
  ]
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]
  let lineType = (
    style?.paint[propertyName]
      ? lineTypes.find((item) => isEqual(sortBy(item.value), sortBy(style.paint[propertyName])))
      : lineTypes.find((item) => item.title === 'solid')
  ).title

  $: lineType, setLineType()

  const setLineType = () => {
    if (style.type !== LayerTypes.LINE || lineType === undefined) return
    $map.setPaintProperty(layerId, propertyName, lineTypes.find((item) => item.title === lineType).value)
  }
</script>

<div style="width: 100%;">
  {#each lineTypes as type}
    <div class="columns is-gapless mb-1">
      <div class="column is-1">
        <input
          type="radio"
          bind:group={lineType}
          checked={true}
          value={type.title}
          alt={`${type.title} Option`}
          title={`${type.title} Option`} />
      </div>
      <div class="column" style="position: relative; top: -2px">
        {type.title}
      </div>
    </div>
  {/each}
</div>
