<script lang="ts">
  import type { LayerSpecification, SymbolLayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import Switch from '@smui/switch'
  import FormField from '@smui/form-field'
  import { map } from '$stores'
  import TextField from '$components/controls/vector-styles/TextField.svelte'
  import TextColor from '$components/controls/vector-styles/TextColor.svelte'
  import TextHaloCalor from '$components/controls/vector-styles/TextHaloCalor.svelte'
  import TextHaloWidth from '$components/controls/vector-styles/TextHaloWidth.svelte'
  import TextMaxWidth from '$components/controls/vector-styles/TextMaxWidth.svelte'
  import TextSize from '$components/controls/vector-styles/TextSize.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import IconKeepUpright from './vector-styles/IconKeepUpright.svelte'

  export let isLabelPanelVisible = false
  export let layer: Layer = LayerInitialValues

  const parentLayerId = layer.definition.id
  let targetLayerId = layer.definition.id
  let targetLayer = layer
  const style: LayerSpecification = $map
    .getStyle()
    .layers.filter((layer: LayerSpecification) => layer.id === parentLayerId)[0]
  let enabledTextLabel = false
  let updateLegend = () => undefined

  $: enabledTextLabel, disableTextLabel()

  const disableTextLabel = () => {
    if (enabledTextLabel === true) {
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
  }

  const onStyleChange = () => {
    updateLegend()
  }
</script>

{#if isLabelPanelVisible === true}
  <div class="action" data-testid="vector-label-panel-container">
    <div class="columns is-flex is-vcentered">
      <div class="column is-3">
        <FormField>
          <Switch bind:checked={enabledTextLabel} />
        </FormField>
      </div>
      {#if enabledTextLabel === true}
        <div class="column is-vcentered">
          <div>
            <TextField on:change={onStyleChange} bind:layer={targetLayer} {enabledTextLabel} />
          </div>
        </div>
      {/if}
    </div>
    {#if enabledTextLabel === true}
      <div class="container notification is-secondary">
        <div class="columns is-flex is-vcentered">
          <div class="column is-3">
            <div class="is-size-6">Font color</div>
          </div>
          <div class="column">
            <div>
              <TextColor on:change={onStyleChange} bind:layer={targetLayer} />
            </div>
          </div>
          <div class="column is-2">
            <div class="is-size-6">Font size</div>
          </div>
          <div class="column">
            <div>
              <TextSize on:change={onStyleChange} bind:layer={targetLayer} />
            </div>
          </div>
        </div>
        <div class="columns is-flex is-vcentered">
          <div class="column is-3">
            <div class="is-size-6">Halo color</div>
          </div>
          <div class="column">
            <div>
              <TextHaloCalor on:change={onStyleChange} bind:layer={targetLayer} />
            </div>
          </div>
          <div class="column is-2">
            <div class="is-size-6">Halo width</div>
          </div>
          <div class="column">
            <div>
              <TextHaloWidth on:change={onStyleChange} bind:layer={targetLayer} />
            </div>
          </div>
        </div>
        <div class="columns is-flex is-vcentered">
          <div class="column is-7">
            <div class="is-size-6">Text Max Width</div>
          </div>
          <div class="column">
            <div>
              <TextMaxWidth on:change={onStyleChange} bind:layer={targetLayer} />
            </div>
          </div>
        </div>
        <div class="columns is-flex is-vcentered">
          <IconKeepUpright on:change={onStyleChange} bind:layer={targetLayer} />
        </div>
      </div>
    {/if}
  </div>
{/if}
