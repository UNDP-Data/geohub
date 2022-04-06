<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import ImageList, { Item } from '@smui/image-list'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import { onMount } from 'svelte'

  import { map } from '../../../stores'
  import type { Layer } from '../../../lib/types'
  import { LayerInitialValues, LayerTypes } from '../../../lib/constants'
  import { loadImageToDataUrl, loadJson, clipSprite } from '../../../lib/helper'
  import StyleControlGroup from '../../control-groups/StyleControlGroup.svelte'
  import VectorLegendSymbol from '../VectorLegendSymbol.svelte'

  const dispatch = createEventDispatcher()

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const propertyName = 'icon-image'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]
  const styleUrl = $map.getStyle().sprite

  let iconImage = style.layout && style.layout[propertyName] ? style.layout[propertyName] : 'circle'
  let selectedIcon = null
  $: iconImage, setIconImage()
  const setIconImage = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }
    newStyle.layout[propertyName] = iconImage
    $map.setLayoutProperty(layerId, propertyName, iconImage)

    iconList.forEach((icon) => {
      if (icon.alt === iconImage) {
        selectedIcon = icon
        return
      }
    })
    dispatch('change')
  }

  let sprite = {
    dataUrl: null,
    json: null,
  }

  let iconList = []
  let updateLegend
  let isIconListPanelVisible = false

  onMount(async () => {
    const promise = Promise.all([loadImageToDataUrl(`${styleUrl}@2x.png`), loadJson(`${styleUrl}@2x.json`)])
    await promise.then(([dataUrl, json]) => {
      sprite.dataUrl = dataUrl
      sprite.json = json
    })
    const promises = []
    Object.keys(sprite.json).forEach((id) => {
      promises.push(clipSprite(sprite.dataUrl, id, sprite.json[id]))
    })
    iconList = await Promise.all(promises)

    iconList.forEach((icon) => {
      if (icon.alt === iconImage) {
        selectedIcon = icon
        return
      }
    })
  })

  const onClick = (e) => {
    iconImage = e.target.value
    isIconListPanelVisible = false
    setIconImage()
    updateLegend()
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <StyleControlGroup title="Icon Image">
    <div on:click={() => (isIconListPanelVisible = !isIconListPanelVisible)}>
      <VectorLegendSymbol bind:updateLegend {layer} />
    </div>
    {#if isIconListPanelVisible === true}
      <StyleControlGroup title="Icon Image List">
        <ImageList>
          {#each iconList as icon}
            <Item>
              <Wrapper>
                <input
                  type="image"
                  src={icon.src}
                  alt={icon.alt}
                  style="width:24px;height:24px"
                  value={icon.alt}
                  on:click={onClick} />
                <Tooltip>{icon.alt}</Tooltip>
              </Wrapper>
            </Item>
          {/each}
        </ImageList>
      </StyleControlGroup>
    {/if}
  </StyleControlGroup>
{/if}

<style lang="scss">
  @use '@material/image-list/index' as image-list;
</style>
