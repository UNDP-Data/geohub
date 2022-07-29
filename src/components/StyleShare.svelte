<script lang="ts">
  import { fade } from 'svelte/transition'
  import { clickOutside } from 'svelte-use-click-outside'
  import List, { Item, Graphic, Text } from '@smui/list'
  import Radio from '@smui/radio'
  import Textfield from '@smui/textfield'
  import Fa from 'svelte-fa'
  import { faShare } from '@fortawesome/free-solid-svg-icons/faShare'
  import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'
  import { copy } from 'svelte-copy'

  import type { Layer } from '$lib/types'
  import { map, layerList } from '$stores'

  let isModalVisible = false
  let styleURL
  let radioDisabled = false
  let selectedOption = 'all'
  let styleName = 'UNDP GeoHub style'
  let textCopyButton = 'Copy'

  const open = () => {
    selectedOption = 'all'
    radioDisabled = false
    if ($layerList.length === 0) {
      radioDisabled = true
    }
    isModalVisible = !isModalVisible
    styleURL = undefined
  }

  export const share = async () => {
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

    // const json = JSON.stringify(style, null, 2)

    const data = {
      name: style.name,
      style,
    }

    const res = await fetch('/style', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    const resjson = await res.json()
    styleURL = resjson.url
    // downloadFile(fileName, json)
  }

  const handleClose = () => {
    isModalVisible = false
  }

  const handleShare = async () => {
    await share()
  }

  const handleCopy = () => {
    textCopyButton = 'copied'
    setTimeout(() => {
      textCopyButton = 'Copy'
    }, 5000)
  }
</script>

{#if $layerList.length > 0}
  <div class="icon" on:click={() => open()}>
    <Fa icon={faShare} size="lg" />
  </div>
{/if}

{#if isModalVisible}
  <div class="modal is-active" transition:fade use:clickOutside={handleClose}>
    <div class="modal-background" />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title has-text-weight-bold">Share</p>
        <button class="delete" aria-label="close" alt="Close" title="Close" on:click={handleClose} />
      </header>
      <section class="modal-card-body">
        {#if !styleURL}
          <div class="textfield">
            <Textfield bind:value={styleName} label="Style name" />
          </div>
          {#if radioDisabled === false}
            <List radioList>
              <Item>
                <Graphic>
                  <Radio bind:group={selectedOption} value="all" />
                </Graphic>
                <Text>All layers</Text>
              </Item>

              <Item>
                <Graphic>
                  <Radio bind:group={selectedOption} value="geohub" disabled={radioDisabled} />
                </Graphic>
                <Text>Only Geohub layers</Text>
              </Item>
            </List>
          {/if}
        {:else}
          <div style="width: 100%;">
            <input class="input text-style" type="text" placeholder="style.json" value={styleURL} readonly />
            <button class="button is-info is-success style-copy" use:copy={styleURL} on:click={handleCopy}
              >{textCopyButton}</button>
          </div>
        {/if}
      </section>
      <footer class="modal-card-foot is-flex is-flex-direction-row is-justify-content-flex-end">
        <div>
          <button class="button" alt="Close" title="Close" on:click={handleClose}> Cancel </button>
          {#if !styleURL}
            <button class="button is-success" alt="Share" title="Share" on:click={handleShare}> Share </button>
          {/if}
        </div>
      </footer>
    </div>
  </div>
{/if}

<style lang="scss">
  .icon {
    cursor: pointer;
    margin-right: 20px;
  }
  .textfield {
    padding-left: 30px;
  }

  .text-style {
    width: 100%;
  }
  .style-copy {
    position: absolute;
    right: 20px;
  }

  .modal {
    .modal-card {
      width: 300px;
    }
  }
</style>
