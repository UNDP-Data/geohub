<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  const dispatch = createEventDispatcher()

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const propertyName = 'icon-overlap'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let choices = ['never', 'always', 'cooperative']
  let selected = style.layout && style.layout[propertyName] ? style.layout[propertyName] : 'never'

  $: selected, setIconOverlap()

  const setIconOverlap = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }
    newStyle.layout[propertyName] = selected
    $map.setLayoutProperty(layerId, propertyName, selected)

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <div class="select is-rounded  is-justify-content-center" style="height: 30px;width:100%">
    <select bind:value={selected} style="width: 100%;" alt="text-field" title="Icon overlap">
      {#each choices as choice}
        <option class="legend-text" value={choice}>{choice}</option>
      {/each}
    </select>
  </div>
{/if}
