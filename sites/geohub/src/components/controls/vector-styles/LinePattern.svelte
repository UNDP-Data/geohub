<script lang="ts">
  import { onMount } from 'svelte'
  import type { LayerSpecification } from 'maplibre-gl'
  import { isEqual, sortBy } from 'lodash-es'
  import { Radios, type Radio } from '@undp-data/svelte-undp-design'

  import { LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { isStyleEdited, map } from '$stores'

  export let layer: Layer
  export let defaultColor: string = undefined

  const propertyName = 'line-dasharray'
  const layerId = layer.id
  const lineTypes = [
    { title: 'solid', value: '', pattern: '___________' },
    { title: 'dash', value: [10, 4], pattern: '___&nbsp;&nbsp;___&nbsp;&nbsp;___' },
    { title: 'dash-dot', value: [10, 3, 2, 3], pattern: '___&nbsp;_&nbsp;___&nbsp;' },
    { title: 'dot', value: [1, 5, 1], pattern: '_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_' },
  ]
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let linePatternColorRgba = defaultColor
  let lineType = (
    style?.paint[propertyName]
      ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        lineTypes.find((item) => isEqual(sortBy(item.value), sortBy(style.paint[propertyName])))
      : lineTypes.find((item) => item.title === 'solid')
  ).title

  $: lineType, setLineType()

  const setLinePatterns = () => {
    const pattern: Radio[] = lineTypes.map((type) => {
      const label = `
          ${type.title}
          <span
            style="font-family: monospace;position:relative;left: 10px;top:-4px;position:relative;font-weight: bold;">
            ${type.pattern}
          </span>`

      return {
        label: label,
        value: type.title,
      }
    })
    return pattern
  }

  let linePatterns: Radio[] = setLinePatterns()

  onMount(() => {
    if (!$map) return
    $map.on('line-color:changed', () => {
      linePatternColorRgba = defaultColor
    })
  })

  const setLineType = () => {
    if (style?.type !== LayerTypes.LINE || lineType === undefined) return

    const value = lineTypes.find((item) => item.title === lineType).value
    if (value) {
      $map.setPaintProperty(layer.id, propertyName, value)
    } else {
      $map.setPaintProperty(layer.id, propertyName, undefined)
    }
    $isStyleEdited = true
  }
</script>

<div
  class="line-pattern-view-container"
  data-testid="line-pattern-view-container">
  {#key linePatternColorRgba}
    <Radios
      bind:radios={linePatterns}
      bind:value={lineType}
      allowHtml={true}
      groupName="line-pattern-{layer.id}"
      isVertical={true} />
  {/key}
</div>

<style lang="scss">
  .line-pattern-view-container {
    width: 100%;
  }
</style>
