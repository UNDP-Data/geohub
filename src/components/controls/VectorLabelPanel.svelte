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
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { layerLabelled, map } from '$stores'

  export let isLabelPanelVisible = false
  export let layer: Layer = LayerInitialValues

  const parentLayerId = layer.definition.id
  const style: LayerSpecification = $map
    .getStyle()
    .layers.filter((layer: LayerSpecification) => layer.id === parentLayerId)[0]

  let decimalPosition: number
  let fieldType: string
  let isAdvancedSettings = false
  let targetLayer = layer
  let targetLayerId = layer.definition.id
  let updateLegend = () => undefined

  onMount(() => {
    initialiseTextLabel()
  })

  const initialiseTextLabel = () => {
    if (style.type !== LayerTypes.SYMBOL) {
      targetLayerId = `${parentLayerId}-label`
      const childLayer: SymbolLayerSpecification = {
        id: targetLayerId,
        type: LayerTypes.SYMBOL,
        source: style['source'],
        'source-layer': style['source-layer'],
        minzoom: style.minzoom,
        maxzoom: style.maxzoom,
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

      $map.addLayer(childLayer)

      if (!layer.children) {
        layer.children = []
      }

      targetLayer = {
        name: targetLayerId,
        definition: childLayer,
        type: LayerTypes.VECTOR,
        info: layer.info,
        visible: true,
        url: layer.url,
        parent: layer,
      }

      layer.children = [targetLayer, ...layer.children]
    } else {
      $map.setLayoutProperty(targetLayerId, 'text-size', 16)
      $map.setLayoutProperty(targetLayerId, 'text-max-width', 10)
      $map.setPaintProperty(targetLayerId, 'text-color', 'rgba(0,0,0,1)')
      $map.setPaintProperty(targetLayerId, 'text-halo-color', 'rgba(255,255,255,1)')
      $map.setPaintProperty(targetLayerId, 'text-halo-width', 1)
    }
    return
  }

  if (style.type === LayerTypes.SYMBOL) {
    const layoutFields = [
      'text-field',
      'text-variable-anchor',
      'text-radial-offset',
      'text-justify',
      'text-size',
      'text-max-width',
    ]
    layoutFields.forEach((prop) => {
      if (!$map.getLayoutProperty(targetLayerId, prop)) return
      $map.setLayoutProperty(targetLayerId, prop, undefined)
    })

    const paintFields = ['text-color', 'text-halo-color', 'text-halo-width']
    paintFields.forEach((prop) => {
      if (!$map.getPaintProperty(targetLayerId, prop)) return
      $map.setPaintProperty(targetLayerId, prop, undefined)
    })
  } else {
    if (layer.children && layer.children.length > 0) {
      layer.children.forEach((l) => {
        if (!$map.getLayer(l.definition.id)) return
        $map.removeLayer(l.definition.id)
      })
      layer.children = []
    }
  }

  const onStyleChange = () => {
    updateLegend()
  }

  const onTextChange = (e) => {
    $layerLabelled[parentLayerId] = e.detail.textFieldValue !== ''
  }
</script>

{#if isLabelPanelVisible === true}
  <div class="action" data-testid="vector-label-panel-container">
    <div class="columns">
      <div class="column is-6">
        <span>Property:&nbsp;</span>
        <TextField on:change={onTextChange} bind:layer={targetLayer} bind:fieldType bind:decimalPosition />
      </div>
    </div>
    {#if fieldType && ['number', 'float'].includes(fieldType)}
      <div class="column is-7" transition:fade>
        <div class="has-text-centered">Number of Decimal Places</div>
        <div class="is-flex is-justify-content-center">
          <NumberFormat on:change={onStyleChange} bind:decimalPosition />
        </div>
      </div>
    {/if}
    <div class="columns mb-0 pb-0">
      <div class="column is-6">
        <div class="has-text-centered pb-2">Font Color</div>
        <div class="is-flex is-justify-content-center">
          <TextColor on:change={onStyleChange} bind:layer={targetLayer} />
        </div>
      </div>
      <div class="column is-6">
        <div class="has-text-centered">Font Size</div>
        <div class="is-flex is-justify-content-center">
          <TextSize on:change={onStyleChange} bind:layer={targetLayer} />
        </div>
      </div>
    </div>

    <div class="columns mb-0 pb-0">
      <div class="column is-6">
        <div class="has-text-centered pb-2">Halo Color</div>
        <div class="is-flex is-justify-content-center">
          <TextHaloCalor on:change={onStyleChange} bind:layer={targetLayer} />
        </div>
      </div>
      <div class="column is-6">
        <div class="has-text-centered">Halo Size</div>
        <div class="is-flex is-justify-content-center">
          <TextHaloWidth on:change={onStyleChange} bind:layer={targetLayer} />
        </div>
      </div>
    </div>

    <div class="columns advanced-settings">
      <div class="column">
        <div class="field">
          <input
            id="switchAdvancedSettings"
            type="checkbox"
            name="switchSmall"
            class="switch is-small is-rounded is-info"
            bind:checked={isAdvancedSettings} />
          <label for="switchAdvancedSettings" class="is-size-6">Advanced Settings</label>
        </div>
      </div>
    </div>

    {#if isAdvancedSettings}
      <div class="advanced-settings-container pb-4" transition:slide={{ duration: 750 }}>
        <div class="columns">
          {#if style.type === LayerTypes.FILL || style.type === LayerTypes.LINE}
            <div class="column">
              <div class="has-text-centered pb-2">Label Position Relative to Geometry</div>
              <div class="is-flex is-justify-content-center">
                <SymbolPlacement on:change={onStyleChange} bind:layer={targetLayer} />
              </div>
            </div>
          {/if}

          <div class="column">
            <div class="has-text-centered">Maximum Width Text Wrap</div>
            <div class="is-flex is-justify-content-center" style="position: relative;">
              <TextMaxWidth on:change={onStyleChange} bind:layer={targetLayer} />
            </div>
          </div>
        </div>
      </div>
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
