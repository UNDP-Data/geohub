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
          },
          paint: {},
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
        }

        layer.children = [targetLayer, ...layer.children]
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
  <div class="action">
    <div>
      <FormField>
        <Switch bind:checked={enabledTextLabel} />
        <span slot="label"><div class="title is-size-5">Create label</div></span>
      </FormField>
    </div>
    {#if enabledTextLabel === true}
      <hr />
      <div class="columns is-flex is-vcentered">
        <div class="column is-4">
          <div class="title is-size-6">Property</div>
        </div>
        <div class="column">
          <div>
            <TextField on:change={onStyleChange} bind:layer={targetLayer} {enabledTextLabel} />
          </div>
        </div>
      </div>
      <div class="columns is-flex is-vcentered">
        <div class="column is-4">
          <div class="title is-size-6">Font color</div>
        </div>
        <div class="column">
          <div>
            <TextColor on:change={onStyleChange} bind:layer={targetLayer} />
          </div>
        </div>
        <div class="column is-4">
          <div class="title is-size-6">Halo color</div>
        </div>
        <div class="column">
          <div>
            <TextHaloCalor on:change={onStyleChange} bind:layer={targetLayer} />
          </div>
        </div>
      </div>
      <div class="columns is-flex is-vcentered">
        <div class="column is-4">
          <div class="title is-size-6">Font Size</div>
        </div>
        <div class="column">
          <div>
            <TextSize on:change={onStyleChange} bind:layer={targetLayer} />
          </div>
        </div>
      </div>
      <div class="columns is-flex is-vcentered">
        <div class="column is-4">
          <div class="title is-size-6">Halo Width</div>
        </div>
        <div class="column">
          <div>
            <TextHaloWidth on:change={onStyleChange} bind:layer={targetLayer} />
          </div>
        </div>
      </div>
      <div class="columns is-flex is-vcentered">
        <div class="column is-4">
          <div class="title is-size-6">Max Width</div>
        </div>
        <div class="column">
          <div>
            <TextMaxWidth on:change={onStyleChange} bind:layer={targetLayer} />
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}
