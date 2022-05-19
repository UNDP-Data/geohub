<script lang="ts">
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'

  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const lineTypes = [
    { title: 'solid', value: [1] },
    { title: 'dash', value: [10, 4] },
    { title: 'dash-dot', value: [10, 3, 2, 3] },
    { title: 'dot', value: [1, 5, 1] },
  ]

  const propertyName = 'line-dasharray'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let LineDasharrayValue = style.paint && style.paint[propertyName] ? style.paint[propertyName] : lineTypes[0].value

  $: LineDasharrayValue, setLineDasharray()

  const setLineDasharray = () => {
    if (style.type !== LayerTypes.LINE) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint[propertyName] = LineDasharrayValue
    $map.setPaintProperty(layerId, propertyName, LineDasharrayValue)
  }
</script>

{#if style.type === LayerTypes.LINE}
  <div style="width: 60%;">
    {#each lineTypes as type}
      <div class="columns is-gapless" style="margin-bottom: 5px;">
        <div class="column is-4">
          <input
            type="radio"
            bind:group={LineDasharrayValue}
            value={type.value}
            alt={`${type.title} Option`}
            title={`${type.title} Option`} />
        </div>
        <div class="column" style="position: relative; top: -2px">
          {type.title}
        </div>
      </div>
    {/each}
  </div>
{/if}
