<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import ImageList, { Item } from '@smui/image-list'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Dialog, { Title, Content } from '@smui/dialog'
  import { onMount } from 'svelte'

  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import VectorLegendSymbol from '$components/controls/VectorLegendSymbol.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map, spriteImageList } from '$stores'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'icon-image'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let iconImage = style.layout && style.layout[propertyName] ? style.layout[propertyName] : 'circle'
  let isIconListPanelVisible = false
  let updateLegend = () => undefined

  $: iconImage, setIconImage()

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
</script>

{#if style.type === LayerTypes.SYMBOL}
  <StyleControlGroup title="Icon Image">
    <div class="icon-button" on:click={() => (isIconListPanelVisible = !isIconListPanelVisible)}>
      <VectorLegendSymbol bind:updateLegend {layer} />
    </div>
  </StyleControlGroup>
{/if}

<Dialog bind:open={isIconListPanelVisible} selection aria-labelledby="list-title" aria-describedby="list-content">
  <Title id="list-title">Icon images</Title>
  <Content id="list-content">
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
  </Content>
</Dialog>

<style lang="scss">
  @use '@material/image-list/index' as image-list;

  .icon-button {
    border: solid 0.5px #1c1c1c;
    background-color: white;
    width: 32px;
    height: 32px;
    padding-top: 3px;
    padding-left: 3px;
    cursor: pointer;

    @media (prefers-color-scheme: dark) {
      border: solid 0.5px #ffffff;
    }
  }

  .imageList {
    max-height: 300px;
    max-width: 350px;
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
