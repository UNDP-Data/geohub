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

  const dispatch = createEventDispatcher()

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const propertyName = 'icon-image'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]
  const styleUrl = $map.getStyle().sprite

  let iconImage = style.layout && style.layout[propertyName] ? style.layout[propertyName] : 'circle'
  $: iconImage, setIconImage()
  const setIconImage = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }
    newStyle.layout[propertyName] = iconImage
    $map.setLayoutProperty(layerId, propertyName, iconImage)

    dispatch('change')
  }

  let sprite = {
    dataUrl: null,
    json: null,
  }

  let iconList = []

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
  })

  const onClick = (e) => {
    iconImage = e.target.value
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <StyleControlGroup title="Icon Image">
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

<style lang="scss">
  @use '@material/image-list/index' as image-list;
</style>
