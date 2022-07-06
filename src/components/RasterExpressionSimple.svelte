<script lang="ts">
  import RasterExpressionBuilder from '$components/RasterExpressionBuilder.svelte'
  import { updateParamsInURL } from '$lib/helper'
  import { fade, slide } from 'svelte/transition'
  import type { Layer, RasterLayerStats } from '$lib/types'
  import { map } from '$stores'
  import { fetchUrl } from '$lib/helper'
  import Card, { PrimaryAction } from '@smui/card'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import Popper from '$lib/popper'
  import { faDiagramProject } from '@fortawesome/free-solid-svg-icons/faDiagramProject'
  import { faEquals } from '@fortawesome/free-solid-svg-icons/faEquals'
  import { faPlusMinus } from '@fortawesome/free-solid-svg-icons/faPlusMinus'
  import { faArrowDown19 } from '@fortawesome/free-solid-svg-icons/faArrowDown19'
  import { faSquareRootVariable } from '@fortawesome/free-solid-svg-icons/faSquareRootVariable'

  export let layer: Layer

  let showExpressionBuilder = false
  let expression = ''

  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper(
    {
      placement: 'right-end',
      strategy: 'fixed',
    },
    [10, 15],
  ).init()
</script>

<div class="container">
  <div class="is-size-7 has-text-weight-semibold">Expression</div>

  <div class="columns">
    <div class="column is-9">
      <input
        class="input is-normal is-rounded"
        bind:value={expression}
        type="text"
        maxlength="100"
        alt="Expression input"
        title="Expression input" />
    </div>
    <div class="column is-3">
      <div
        on:click={() => {
          showExpressionBuilder = !showExpressionBuilder
        }}
        data-testid="expression-builder-button"
        use:popperRef>
        <Wrapper>
          <Card>
            <PrimaryAction style="padding: 10px;">
              <Fa icon={faSquareRootVariable} style="font-size: 16px;" />
            </PrimaryAction>
          </Card>
          <Tooltip showDelay={100} hideDelay={0} yPos="above">Expression builder</Tooltip>
        </Wrapper>
      </div>
    </div>
    {#if showExpressionBuilder}
      <div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
        <RasterExpressionBuilder
          on:handleColorMapClick={() => {
            console.log('click')
          }}
          on:handleClosePopup={() => {
            showExpressionBuilder = !showExpressionBuilder
          }}
          {layer}
          layerMin={Number(layer.info['band_metadata'][0][1]['STATISTICS_MINIMUM'])}
          layerMax={Number(layer.info['band_metadata'][0][1]['STATISTICS_MAXIMUM'])} />
        <div id="arrow" data-popper-arrow />
      </div>
    {/if}
  </div>

  <div class="columns">
    <div class="column">
      <button
        class="button is-info is-light is-small"
        on:click={() => {
          console.log('apply')
        }}
        alt="Apply expression"
        title="Apply expression">
        Apply
      </button>
      <button
        class="button is-info is-light is-small"
        on:click={() => {
          console.log('clear')
        }}
        alt="Clear expression"
        title="Clear expression">
        Clear
      </button>
      <button
        class="button is-vcentered is-small"
        on:click={() => {
          console.log('close')
        }}
        data-testid="filter-clear-button"
        alt="Remove expression"
        title="Remove expression">
        <span class="icon">
          <i class="fas fa-xmark" />
        </span>
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  @import '../styles/popper.scss';
  #tooltip {
    max-height: 300px;
    max-width: 470px;
  }
</style>
