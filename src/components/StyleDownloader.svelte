<script lang="ts">
  import Button, { Label as LabelButton } from '@smui/button'
  import Dialog, { Title, Content as ContentDialog, Actions as ActionsDialog, InitialFocus } from '@smui/dialog'
  import List, { Item, Graphic, Text } from '@smui/list'
  import Radio from '@smui/radio'
  import Textfield from '@smui/textfield'
  import Fa from 'svelte-fa'
  import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
  import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'

  import { downloadFile } from '$lib/helper'
  import type { Layer } from '$lib/types'
  import { map, layerList } from '$stores'

  let dialogOpen = false
  let fileName = 'style.json'
  let radioDisabled = false
  let selectedOption = 'all'
  let styleName = 'UNDP GeoHub style'

  const open = () => {
    selectedOption = 'all'
    radioDisabled = false
    if ($layerList.length === 0) {
      radioDisabled = true
    }
    dialogOpen = !dialogOpen
  }

  export const download = () => {
    const style: StyleSpecification = $map.getStyle()
    if (selectedOption === 'geohub') {
      if ($layerList.length === 0) {
        return
      }
      const newSources = {}
      Object.keys(style.sources).forEach((key: string) => {
        $layerList.forEach((l: Layer) => {
          if (l.definition && l.definition.source === key) {
            newSources[key] = style.sources[key]
          }
        })
      })
      style.sources = newSources
      const newLayers = []
      style.layers.forEach((layer) => {
        $layerList.forEach((l: Layer) => {
          if (l.definition.id === layer.id) {
            newLayers.push(layer)
          }
        })
      })
      style.layers = newLayers
    }
    style.name = styleName
    const center = $map.getCenter()
    style.center = [center.lng, center.lat]
    style.bearing = $map.getBearing()
    style.pitch = $map.getPitch()

    const json = JSON.stringify(style, null, 2)
    downloadFile(fileName, json)
    dialogOpen = false
  }

  const closeHandler = (e: CustomEvent<{ action: string }>) => {
    if (e.detail.action === 'accept') {
      download()
    }
  }
</script>

<div class="icon" on:click={() => open()}>
  <Fa icon={faDownload} size="lg" />
</div>

<Dialog bind:open={dialogOpen} selection on:SMUIDialog:closed={closeHandler}>
  <Title>Download</Title>
  <ContentDialog>
    <div class="textfield">
      <Textfield bind:value={styleName} label="Style name" />
    </div>
    <div class="textfield">
      <Textfield bind:value={fileName} label="Output file name" />
    </div>
    {#if radioDisabled === false}
      <List radioList>
        <Item use={[InitialFocus]}>
          <Graphic>
            <Radio bind:group={selectedOption} value="all" />
          </Graphic>
          <Text>All layers</Text>
        </Item>

        <Item use={[InitialFocus]}>
          <Graphic>
            <Radio bind:group={selectedOption} value="geohub" disabled={radioDisabled} />
          </Graphic>
          <Text>Only Geohub layers</Text>
        </Item>
      </List>
    {/if}
  </ContentDialog>
  <ActionsDialog>
    <Button>
      <LabelButton>Cancel</LabelButton>
    </Button>
    <Button action="accept">
      <LabelButton>Download</LabelButton>
    </Button>
  </ActionsDialog>
</Dialog>

<style lang="scss">
  .icon {
    cursor: pointer;
    margin-right: 20px;
  }
  .textfield {
    padding-left: 30px;
  }
</style>
