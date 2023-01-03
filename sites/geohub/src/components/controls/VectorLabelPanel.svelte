<script lang="ts">
  import { onMount } from 'svelte'
  import { slide, fade } from 'svelte/transition'
  import type { LayerSpecification, SymbolLayerSpecification } from 'maplibre-gl'

  import NumberFormat from '$components/controls/vector-styles/NumberFormat.svelte'
  import SymbolPlacement from '$components/controls/vector-styles/SymbolPlacement.svelte'
  import TextColor from '$components/controls/vector-styles/TextColor.svelte'
  import TextField from '$components/controls/vector-styles/TextField.svelte'
  import TextHaloCalor from '$components/controls/vector-styles/TextHaloCalor.svelte'
  import TextHaloWidth from '$components/controls/vector-styles/TextHaloWidth.svelte'
  import TextMaxWidth from '$components/controls/vector-styles/TextMaxWidth.svelte'
  import TextSize from '$components/controls/vector-styles/TextSize.svelte'
  import { LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'
  import { getPropertyValueFromExpression } from '$lib/helper'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'

  export let isLabelPanelVisible = false
  export let layer: Layer

  const parentLayerId = layer.id
  const style: LayerSpecification = $map
    .getStyle()
    .layers.filter((layer: LayerSpecification) => layer.id === parentLayerId)[0]

  let decimalPosition: number
  let fieldType: string
  let textFieldValue: string
  let isAdvancedSettings = false
  let targetLayer = layer
  let targetLayerId = layer.id
  let updateLegend = () => undefined
  let isLabelCreated = false

  onMount(() => {
    initialiseTextLabel()
  })

  const initialiseTextLabel = () => {
    if (style.type !== LayerTypes.SYMBOL) {
      if (targetLayer.children?.length > 0) {
        targetLayer = targetLayer.children[0]
        targetLayerId = targetLayer.id

        const targetStyle = $map.getStyle().layers.find((l) => l.id === targetLayerId)
        textFieldValue = getPropertyValueFromExpression(targetStyle, 'text-field', 'layout')
        fireLabelChanged()
      } else {
        targetLayerId = `${parentLayerId}-label`

        if (!layer.children) {
          layer.children = []
        }

        targetLayer = {
          id: targetLayerId,
          name: targetLayerId,
          info: layer.info,
          parentId: layer.id,
          dataset: undefined,
        }

        layer.children = [targetLayer, ...layer.children]
      }
    } else {
      const textSize = $map.getLayoutProperty(targetLayerId, 'text-size')
      const textMaxWidth = $map.getLayoutProperty(targetLayerId, 'text-max-width')
      const textColor: string = $map.getPaintProperty(targetLayerId, 'text-color') as string
      const textHaloColor: string = $map.getPaintProperty(targetLayerId, 'text-halo-color') as string
      const textHaloWidth: number = $map.getPaintProperty(targetLayerId, 'text-halo-width') as number

      $map.setLayoutProperty(targetLayerId, 'text-size', textSize ?? 16)
      $map.setLayoutProperty(targetLayerId, 'text-max-width', textMaxWidth ?? 10)
      $map.setPaintProperty(targetLayerId, 'text-color', textColor ?? 'rgba(0,0,0,1)')
      $map.setPaintProperty(targetLayerId, 'text-halo-color', textHaloColor ?? 'rgba(255,255,255,1)')
      $map.setPaintProperty(targetLayerId, 'text-halo-width', textHaloWidth ?? 1)

      const targetStyle = $map.getStyle().layers.find((l) => l.id === targetLayerId)
      textFieldValue = getPropertyValueFromExpression(targetStyle, 'text-field', 'layout')
      fireLabelChanged()
    }
  }

  const onStyleChange = () => {
    updateLegend()
  }

  const fireLabelChanged = () => {
    if (textFieldValue) {
      isLabelCreated = true
    } else {
      isLabelCreated = false
    }
    $map.fire('label:changed', {
      parentId: parentLayerId,
      layerId: targetLayer.id,
      isCreated: isLabelCreated,
    })
  }
</script>

{#if isLabelPanelVisible === true}
  <div
    class="action"
    data-testid="vector-label-panel-container">
    <div class="columns is-10 is-vcentered is-justify-content-space-around">
      <div class="column is-2">Property:&nbsp;</div>
      <div class="column is-8">
        <TextField
          on:change={fireLabelChanged}
          bind:layer={targetLayer}
          bind:fieldType
          bind:textFieldValue
          bind:decimalPosition />
      </div>
    </div>
    {#if isLabelCreated}
      {#if fieldType && ['number', 'float'].includes(fieldType)}
        <div
          class="column is-7 m-auto"
          transition:fade>
          <div class="has-text-centered">Number of decimal places</div>
          <div class="is-flex is-justify-content-center">
            <NumberFormat
              on:change={onStyleChange}
              bind:decimalPosition />
          </div>
        </div>
      {/if}
      <StyleControlGroup
        title="Font"
        class="mb-1">
        <div class="columns is-12 mb-0 pb-0 is-vcentered">
          <div class="column is-3 pr-0">Color:</div>
          <div class="column pl-0 is-1">
            <TextColor
              on:change={onStyleChange}
              bind:layer={targetLayer} />
          </div>
          <div class="column has-text-centered is-4 pl-4 pr-0">Size:</div>
          <div class="column pl-0 is-4">
            <TextSize
              on:change={onStyleChange}
              bind:layer={targetLayer} />
          </div>
        </div>
      </StyleControlGroup>
      <br />
      <StyleControlGroup
        title="Halo"
        class="mb-1">
        <div class="columns is-vcentered">
          <div class="column">Color:</div>
          <div class="column">
            <TextHaloCalor
              on:change={onStyleChange}
              bind:layer={targetLayer} />
          </div>
          <div class="column has-text-centered">Width:</div>
          <div class="column">
            <TextHaloWidth
              on:change={onStyleChange}
              bind:layer={targetLayer} />
          </div>
        </div>
      </StyleControlGroup>

      <div class="columns advanced-settings">
        <div class="column is-6 m-auto">
          <div class="field">
            <input
              id="switchAdvancedSettings"
              type="checkbox"
              name="switchSmall"
              class="switch is-small is-rounded is-info"
              bind:checked={isAdvancedSettings} />
            <label
              for="switchAdvancedSettings"
              class="is-size-6">Advanced Settings</label>
          </div>
        </div>
      </div>

      {#if isAdvancedSettings}
        <div
          class="advanced-settings-container pb-4"
          transition:slide={{ duration: 750 }}>
          <div class="columns">
            {#if style.type === LayerTypes.FILL || style.type === LayerTypes.LINE}
              <div class="column">
                <div class="has-text-centered pb-2">Label Position Relative to Geometry</div>
                <div class="is-flex is-justify-content-center">
                  <SymbolPlacement
                    on:change={onStyleChange}
                    bind:layer={targetLayer} />
                </div>
              </div>
            {/if}

            <div class="column">
              <div class="has-text-centered">Maximum Width Text Wrap</div>
              <div
                class="is-flex is-justify-content-center"
                style="position: relative;">
                <TextMaxWidth
                  on:change={onStyleChange}
                  bind:layer={targetLayer} />
              </div>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
{/if}

<style lang="scss">
  .advanced-settings-container {
    padding-left: 15px;
    padding-right: 15px;

    > .columns {
      border: 1px solid #ccc;
      padding: 0;
      padding-top: 5px;
    }
  }
</style>
