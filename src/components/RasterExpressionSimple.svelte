<script lang="ts">
  import { containers } from './../containers.ts'

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

  import { faCalculator } from '@fortawesome/free-solid-svg-icons/faCalculator'

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
      padding: 0,
      margin: 0,
    },
    [10, 15],
  ).init()

  const handleOperator = (event: CustomEvent) => {
    if (event?.detail?.operator) {
      const operator = event.detail.operator
      console.log(operator)
    }
  }
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
              <Fa icon={faCalculator} style="font-size: 16px;" />
            </PrimaryAction>
          </Card>
          <Tooltip showDelay={100} hideDelay={0} yPos="above">Expression builder</Tooltip>
        </Wrapper>
      </div>
    </div>
    {#if showExpressionBuilder}
      <div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
        <RasterExpressionBuilder
          on:handleOperatorClick={handleOperator}
          on:handleClosePopup={() => {
            showExpressionBuilder = !showExpressionBuilder
          }}
          {layer} />
        <!-- <div id="arrow" data-popper-arrow /> -->
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
    //height:100px;
    max-width: 550px;
    //width: 300px;
    //overflow-y: scroll;
  }
</style>
