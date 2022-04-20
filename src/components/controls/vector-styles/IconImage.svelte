<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import ImageList, { Item } from '@smui/image-list'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import { onMount } from 'svelte'

  import { map, spriteImageList } from '../../../stores'
  import type { Layer } from '$lib/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import VectorLegendSymbol from '../VectorLegendSymbol.svelte'

  const dispatch = createEventDispatcher()

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const propertyName = 'icon-image'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

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

  let updateLegend = () => undefined
  let isIconListPanelVisible = false

  onMount(async () => {
    updateLegend()
  })

  const onClick = (e: MouseEvent) => {
    const element = e.target as HTMLInputElement
    iconImage = element.value
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
      <!-- <StyleControlGroup title="Icon Image List"> -->
      <div class="imageList">
        <ImageList>
          {#each $spriteImageList as icon}
            <Item>
              <Wrapper>
                <div class="icon">
                  <input
                    type="image"
                    src={icon.src}
                    alt={icon.alt}
                    style="width:24px;height:24px"
                    value={icon.alt}
                    on:click={onClick} />
                </div>
                <Tooltip>{icon.alt}</Tooltip>
              </Wrapper>
            </Item>
          {/each}
        </ImageList>
      </div>
      <!-- </StyleControlGroup> -->
    {/if}
  </StyleControlGroup>
{/if}

<style lang="scss">
  @use '@material/image-list/index' as image-list;
  .imageList {
    max-height: 150px;
    overflow-x: hiden;
    overflow-y: scroll;

    position: relative;
    margin: 1em 0;
    padding: 1em 1em 0.5em 1em;
    border: solid 0.5px #1c1c1c;
    border-radius: 4px;
  }
  .icon {
    padding: 1em;
  }
  .icon :hover {
    border: 2px solid #ffae00;
    background-color: #fac45178;
  }
</style>
