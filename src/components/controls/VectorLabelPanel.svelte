<script lang="ts">
  import { onMount } from 'svelte'
  import type { LayerSpecification, SymbolLayerSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'
  import { map } from '$stores'
  import TextField from '$components/controls/vector-styles/TextField.svelte'
  import TextColor from '$components/controls/vector-styles/TextColor.svelte'
  import TextHaloCalor from '$components/controls/vector-styles/TextHaloCalor.svelte'
  import TextHaloWidth from '$components/controls/vector-styles/TextHaloWidth.svelte'
  import TextMaxWidth from '$components/controls/vector-styles/TextMaxWidth.svelte'
  import TextSize from '$components/controls/vector-styles/TextSize.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import SymbolPlacement from './vector-styles/SymbolPlacement.svelte'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import NumberFormat from './vector-styles/NumberFormat.svelte'

  export let isLabelPanelVisible = false
  export let layer: Layer = LayerInitialValues

  const parentLayerId = layer.definition.id
  let targetLayerId = layer.definition.id
  let targetLayer = layer
  let fieldType: string
  let decimalPoisition: number
  const style: LayerSpecification = $map
    .getStyle()
    .layers.filter((layer: LayerSpecification) => layer.id === parentLayerId)[0]
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
</script>

{#if isLabelPanelVisible === true}
  <div class="action" data-testid="vector-label-panel-container">
    <div class="columns is-vcentered first-row">
      <div class="column text-field">
        <div class="is-flex is-justify-content-center" style="position: relative;">
          <TextField on:change={onStyleChange} bind:layer={targetLayer} bind:fieldType bind:decimalPoisition />
        </div>
      </div>
    </div>
    <div class="is-divider m-0" />
    <div class="columns is-vcentered first-row">
      <div class="column is-3">
        <div class="is-size-6 is-flex is-justify-content-center">Text wrap max Width:</div>
      </div>
      <div class="column text-max-width">
        <div class="is-flex is-justify-content-center" style="position: relative;">
          <TextMaxWidth on:change={onStyleChange} bind:layer={targetLayer} />
        </div>
      </div>
      {#if fieldType && ['number', 'float'].includes(fieldType)}
        <div class="column is-2">
          <div class="is-size-6 is-flex is-justify-content-center">Decimal Position:</div>
        </div>
        <div class="column decimal-position">
          <div class="is-flex is-justify-content-center" style="position: relative;">
            <NumberFormat on:change={onStyleChange} bind:decimalPoisition />
          </div>
        </div>
      {/if}
    </div>
    <div class="is-divider m-0" />
    <div class="columns">
      <div class="column is-6 p-1">
        <StyleControlGroup title="Font">
          <div class="columns first-row">
            <div class="column text-color">
              <div class="is-flex is-justify-content-center">Color:</div>
              <div class="is-flex is-justify-content-center" style="position: relative;">
                <TextColor on:change={onStyleChange} bind:layer={targetLayer} />
              </div>
            </div>
            <div class="column text-size">
              <div class="is-flex is-justify-content-center">Size:</div>
              <div class="is-flex is-justify-content-center" style="position: relative;">
                <TextSize on:change={onStyleChange} bind:layer={targetLayer} />
              </div>
            </div>
          </div>
        </StyleControlGroup>
      </div>
      <div class="column is-6 p-1">
        <StyleControlGroup title="Halo">
          <div class="columns first-row">
            <div class="column halo-color">
              <div class="is-flex is-justify-content-center">Color:</div>
              <div class="is-flex is-justify-content-center" style="position: relative;">
                <TextHaloCalor on:change={onStyleChange} bind:layer={targetLayer} />
              </div>
            </div>
            <div class="column halo-size">
              <div class="is-flex is-justify-content-center">Size:</div>
              <div class="is-flex is-justify-content-center" style="position: relative;">
                <TextHaloWidth on:change={onStyleChange} bind:layer={targetLayer} />
              </div>
            </div>
          </div>
        </StyleControlGroup>
      </div>
    </div>
    {#if style.type === LayerTypes.FILL || style.type === LayerTypes.LINE}
      <div class="is-divider m-0 pb-3" />
      <div class="columns first-row">
        <div class="column is-5">
          <div class="is-flex is-justify-content-center">Label position relative to geometry:</div>
        </div>
        <div class="column is-4">
          <div class="is-flex is-justify-content-center" style="position: relative;">
            <SymbolPlacement on:change={onStyleChange} bind:layer={targetLayer} />
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style lang="scss">
  .first-row {
    margin-bottom: 0;

    .text-field {
      div:first-child {
        margin: 0px;
      }
    }

    .text-max-width,
    .heat-map-color,
    .text-color,
    .halo-color,
    .decimal-position {
      div:first-child {
        margin-bottom: 10px;
      }

      div:second-child {
        height: 30px;
      }
    }

    .text-size,
    .halo-size {
      div:first-child {
        margin-bottom: 3px;
      }
    }
  }
</style>
