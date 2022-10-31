<script lang="ts">
  import { fade } from 'svelte/transition'
  import { clickOutside } from 'svelte-use-click-outside'
  import Textfield from '@smui/textfield'
  import Fa from 'svelte-fa'
  import { faShare } from '@fortawesome/free-solid-svg-icons/faShare'
  import type { StyleSpecification } from 'maplibre-gl'
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

    radioDisabled = $layerList.length === 0
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
    style.zoom = $map.getZoom()

    const data = {
      name: style.name,
      style,
    }

    const res = await fetch('/style', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    console.log(res)
    const resjson = await res.json()
    styleURL = resjson.url
  }

  const handleClose = () => {
    isModalVisible = false
  }

  const handleShare = async () => {
    await share()
  }

  const onKeyPressed = (e: any) => {
    if (e.key === 'Enter') {
      e.target.click()
    }
  }

  const handleCopy = () => {
    textCopyButton = 'copied'
    setTimeout(() => {
      textCopyButton = 'Copy'
    }, 5000)
  }
</script>

{#if $layerList.length > 0}
  <div
    style="margin-left: 2%"
    class="icon"
    on:click={() => open()}
    on:keydown={onKeyPressed}
    tabindex="1">
    <Fa
      icon={faShare}
      size="lg" />
  </div>
{/if}

{#if isModalVisible}
  <div
    class="modal is-active"
    transition:fade
    use:clickOutside={handleClose}>
    <div
      class="modal-background"
      on:click={handleClose} />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title has-text-weight-bold">Share</p>
        <button
          class="delete"
          aria-label="close"
          alt="Close"
          title="Close"
          on:click={handleClose} />
      </header>
      <section class="modal-card-body">
        {#if !styleURL}
          <div class="textfield">
            <Textfield
              bind:value={styleName}
              label="Style name" />
          </div>
          {#if radioDisabled === false}
            <div style="display: block">
              <div
                class="radio-input"
                style="margin: 10%; align-items: center">
                <input
                  on:input={() => (selectedOption = 'all')}
                  checked={selectedOption === 'all'}
                  type="radio"
                  name="amount"
                  value="all"
                  id="all" />
                <label for="all"> All Layers </label>
              </div>
              <div
                class="radio-input"
                style="margin: 10%">
                <input
                  on:input={() => (selectedOption = 'geohub')}
                  checked={selectedOption === 'geohub'}
                  type="radio"
                  name="amount"
                  value="geohub"
                  id="geohub" />
                <label for="geohub"> GeoHub </label>
              </div>
            </div>
          {/if}
        {:else}
          <div style="width: 100%;">
            <input
              class="input text-style"
              type="text"
              placeholder="style.json"
              value={styleURL}
              readonly />
            <button
              class="button is-info is-success style-copy"
              use:copy={styleURL}
              on:click={handleCopy}>{textCopyButton}</button>
          </div>
        {/if}
      </section>
      <footer class="modal-card-foot is-flex is-flex-direction-row is-justify-content-flex-end">
        <div>
          <button
            class="button secondary-button"
            alt="Close"
            title="Close"
            on:click={handleClose}>
            Cancel
          </button>
          {#if !styleURL}
            <button
              class="button primary-button"
              alt="Share"
              title="Share"
              on:click={handleShare}>
              Share
            </button>
          {/if}
        </div>
      </footer>
    </div>
  </div>
{/if}

<style lang="scss">
  @import 'src/styles/undp-design/base-minimal.min';
  @import 'src/styles/undp-design/radio.min';

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
