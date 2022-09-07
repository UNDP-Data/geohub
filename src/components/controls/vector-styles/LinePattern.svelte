<script lang="ts">
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'
  import { isEqual, sortBy } from 'lodash-es'
  import chroma from 'chroma-js'

  import { DEFAULT_LINE_COLOR, LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const defaultColor = DEFAULT_LINE_COLOR
  const propertyName = 'line-dasharray'
  const layerId = layer.definition.id
  const lineTypes = [
    { title: 'solid', value: [1], pattern: '______' },
    { title: 'dash', value: [10, 4], pattern: '_____&nbsp;&nbsp;' },
    { title: 'dash-dot', value: [10, 3, 2, 3], pattern: '_____&nbsp;&nbsp;_&nbsp;&nbsp;' },
    { title: 'dot', value: [1, 5, 1], pattern: '_&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_' },
  ]
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let linePatternColorRgba = layer.iconColor ? layer.iconColor : defaultColor
  let lineType = (
    style?.paint[propertyName]
      ? lineTypes.find((item) => isEqual(sortBy(item.value), sortBy(style.paint[propertyName])))
      : lineTypes.find((item) => item.title === 'solid')
  ).title

  $: lineType, setLineType()

  // change line pattern color upon change of line color
  $: if (layer.iconColor) linePatternColorRgba = layer.iconColor

  const setLineType = () => {
    if (style?.type !== LayerTypes.LINE || lineType === undefined) return
    $map.setPaintProperty(layerId, propertyName, lineTypes.find((item) => item.title === lineType).value)
  }

  const handleLineTypeClick = (type: string) => {
    lineType = type
  }
</script>

<div class="line-pattern-view-container" data-testid="line-pattern-view-container">
  {#each lineTypes as type}
    <div class="columns is-gapless mb-1 line-pattern" on:click={() => handleLineTypeClick(type.title)}>
      <div class="column is-1">
        <input
          type="radio"
          bind:group={lineType}
          checked={true}
          alt="Line Option"
          title="Line Option"
          value={type.title} />
      </div>
      <div class="column" style="position: relative; top: -2px; left: 5px;">
        {type.title}
      </div>
      <div
        class="column is-8 is-size-7 has-text-weight-bold line-pattern-sample"
        style={`color: ${chroma(linePatternColorRgba).hex()};`}>
        {@html type.pattern}{@html type.pattern}
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  @import '../../../styles/undp-design/radio.min';

  .line-pattern-view-container {
    width: 100%;

    .line-pattern {
      cursor: grab;
    }

    .line-pattern-sample {
      font-family: monospace;
      left: 10px;
      position: relative;
      top: -4px;
    }
  }
</style>
