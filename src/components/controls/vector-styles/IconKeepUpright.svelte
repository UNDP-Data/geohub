<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import FormField from '@smui/form-field'
  import Switch from '@smui/switch'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'icon-keep-upright'
  const propertyNameSymbolPlacement = 'symbol-placement'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]
  let parentType = LayerTypes.SYMBOL

  const parentLayer = layer.parent
  if (parentLayer) {
    const parentStyle = $map
      .getStyle()
      .layers.filter((layer: LayerSpecification) => layer.id === parentLayer.definition.id)[0]
    parentType = parentStyle.type
  }

  let checked = style.layout && style.layout[propertyName] ? style.layout[propertyName] : false
  let choices = ['point', 'line', 'line-center']
  let selected =
    style.layout && style.layout[propertyNameSymbolPlacement] ? style.layout[propertyNameSymbolPlacement] : 'point'

  $: checked, setIconKeepUpright()
  $: selected, setSymbolPlacement()

  const setSymbolPlacement = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }

    newStyle.layout[propertyNameSymbolPlacement] = selected
    $map.setLayoutProperty(layerId, propertyNameSymbolPlacement, selected)

    dispatch('change')
  }

  const setIconKeepUpright = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }
    newStyle.layout[propertyName] = checked
    $map.setLayoutProperty(layerId, propertyName, checked)

    if (checked === true) {
      selected = 'line'
    } else {
      selected = 'point'
    }
    setSymbolPlacement()

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.SYMBOL && [LayerTypes.LINE, LayerTypes.FILL].includes(parentType)}
  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px">
    <span>Keep Upright</span>
    <FormField class="upright-switch">
      <Switch bind:checked />
    </FormField>
  </div>
  <!--  <div class="container">-->
  <!--    <div class="row is-flex">-->
  <!--      <div class="column is-4">-->
  <!--        <div class="is-size-6">Keep Upright</div>-->
  <!--      </div>-->
  <!--      <div class="column">-->
  <!--        <FormField>-->
  <!--          <Switch bind:checked />-->
  <!--        </FormField>-->
  <!--      </div>-->
  <!--    </div>-->
  <!--    {#if checked}-->
  <!--      <div class="row is-flex">-->
  <!--        <div class="column is-4">-->
  <!--          <div class="is-size-6">Symbol Placement</div>-->
  <!--        </div>-->
  <!--        <div class="column is-8">-->
  <!--          <div class="select is-rounded  is-justify-content-center" style="height: 30px;width:100%">-->
  <!--            <select bind:value={selected} style="width: 100%;" alt="text-field" title="Icon overlap">-->
  <!--              {#each choices as choice}-->
  <!--                <option class="legend-text" value={choice}>{choice}</option>-->
  <!--              {/each}-->
  <!--            </select>-->
  <!--          </div>-->
  <!--        </div>-->
  <!--      </div>-->
  <!--    {/if}-->
  {#if checked}
    <div class="select is-justify-content-center" style="height: 30px;width:100%">
      <select bind:value={selected} style="width: 100%;" alt="text-field" title="Icon overlap">
        <optgroup label="Select Placement">
          {#each choices as choice}
            <option class="legend-text" value={choice}>{choice}</option>
          {/each}
        </optgroup>
      </select>
    </div>
  {/if}
  <!--  </div>-->
{/if}

<style lang="scss">
  :global(.upright-switch) {
    height: 40px;
    width: 40px;
  }
</style>
