<script lang="ts">
  import { fade } from 'svelte/transition'
  import { clickOutside } from 'svelte-use-click-outside'
  import type { StyleSpecification } from 'maplibre-gl'
  import { copy } from 'svelte-copy'
  import { Button } from '@undp-data/svelte-undp-design'

  import type { Layer } from '$lib/types'
  import { map, layerList } from '$stores'

  let isModalVisible = false
  let styleURL: string
  let radioDisabled = false

  let styleName = 'UNDP GeoHub style'
  let textCopyButton = 'Copy'
  let untargetedLayers: Layer[] = []
  let exportedStyleJSON: StyleSpecification

  const open = () => {
    radioDisabled = $layerList.length === 0
    isModalVisible = !isModalVisible
    styleURL = undefined

    untargetedLayers = []
    const names: string[] = []
    if ($layerList.length > 0) {
      $layerList.forEach((layer) => {
        const tags: [{ key: string; value: string }] = layer.dataset.properties.tags as unknown as [
          { key: string; value: string },
        ]
        const stacType = tags?.find((tag) => tag.key === 'stac')

        if (stacType?.value === 'microsoft-pc') {
          untargetedLayers.push(layer)
        } else {
          names.push(layer.name)
        }
      })
      if (names.length > 0) {
        styleName = `${names[0]}${names.length > 1 ? ', etc.' : ''}`
      } else {
        styleName = 'UNDP GeoHub style'
      }
    }
    createStyleJSON2Generate()
  }

  export const share = async () => {
    const data = {
      name: exportedStyleJSON.name,
      style: exportedStyleJSON,
      layers: $layerList,
    }

    const res = await fetch('/api/style', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    const resjson = await res.json()
    styleURL = resjson.url
  }

  $: styleName, createStyleJSON2Generate()

  const createStyleJSON2Generate = () => {
    if (!$map) return
    const style: StyleSpecification = $map.getStyle()
    if ($layerList.length === 0) {
      return
    }

    untargetedLayers.forEach((layer) => {
      const deletedLayer = style.layers.find((l) => l.id === layer.id)
      if (deletedLayer) {
        const delIndex = style.layers.indexOf(deletedLayer)
        if (delIndex === 0) {
          style.layers.shift()
        } else {
          style.layers.splice(delIndex, 1)
        }
      }
    })

    style.name = styleName
    const center = $map.getCenter()
    style.center = [center.lng, center.lat]
    style.bearing = $map.getBearing()
    style.pitch = $map.getPitch()
    style.zoom = $map.getZoom()
    exportedStyleJSON = style
  }

  const handleClose = () => {
    isModalVisible = false
  }

  const handleShare = async () => {
    await share()
  }

  const onKeyPressed = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
    class="icon"
    on:click={() => open()}
    on:keydown={onKeyPressed}
    tabindex="0">
    <span class="icon">
      <i
        class="fa-solid fa-share fa-xl"
        style="color:#006eb5" />
    </span>
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
          <div class="field">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="label">Style name</label>
            <div class="control">
              <input
                class="input text-stylename"
                type="text"
                placeholder="Style name"
                bind:value={styleName} />
            </div>
          </div>

          {#if exportedStyleJSON && exportedStyleJSON.layers.length === 0}
            <article class="message is-warning">
              <div class="message-header">
                <p>Warning</p>
              </div>
              <div class="message-body">
                <p>No layer to be saved</p>
              </div>
            </article>
          {/if}
          {#if untargetedLayers.length > 0}
            <article class="message is-warning">
              <div class="message-header">
                <p>Warning</p>
              </div>
              <div class="message-body">
                <p>The following layers from Microsoft Planet Computer API will be removed from saved style.</p>
                <div class="level">
                  {#each untargetedLayers as layer, index}
                    <div class="level-left">
                      <div class="level-item">
                        <p>{index + 1}: {layer.name}</p>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </article>
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
        <div class="is-6 px-1">
          <Button
            title="Cancel"
            on:clicked={handleClose}
            isPrimary={false} />
        </div>

        {#if !styleURL && exportedStyleJSON && exportedStyleJSON.layers.length > 0}
          <div class="is-6 px-1">
            <Button
              title="Share"
              on:clicked={handleShare}
              isPrimary={true} />
          </div>
        {/if}
      </footer>
    </div>
  </div>
{/if}

<style lang="scss">
  .icon {
    cursor: pointer;
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
