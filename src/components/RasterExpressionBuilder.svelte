<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
  import { faEquals } from '@fortawesome/free-solid-svg-icons/faEquals'
  import { faPlusMinus } from '@fortawesome/free-solid-svg-icons/faPlusMinus'
  import { faArrowDown19 } from '@fortawesome/free-solid-svg-icons/faArrowDown19'
  import { faSquareRootVariable } from '@fortawesome/free-solid-svg-icons/faSquareRootVariable'
  import OpCat from '$components/raster/OpCat.svelte'
  import type { Layer, OperatorCategory } from '$lib/types'
  import { getActiveBandIndex } from '$lib/helper'

  let activeOperatorCategory = ''
  export let layer: Layer
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const bandIndex = getActiveBandIndex(layer.info)
  const layerMin = Number(layer.info['band_metadata'][bandIndex][1]['STATISTICS_MINIMUM']).toFixed(2)
  const layerMax = Number(layer.info['band_metadata'][bandIndex][1]['STATISTICS_MAXIMUM']).toFixed(2)

  const dispatch = createEventDispatcher()
  const operatorCategories: Array<OperatorCategory> = [
    {
      name: 'arithmetic',
      title: 'Arithmetic',
      icon: faPlusMinus,
      operators: ['*', '/', '+', '-', '%', '**'],
      isVisible: true,
      disabled: false,
    },
    {
      name: 'numbers',
      title: 'Numbers',
      icon: faArrowDown19,
      operators: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '(', ')'],
      isVisible: true,
      disabled: false,
    },
    {
      name: 'comparison',
      title: 'Comparison',
      icon: faEquals,
      operators: ['=', '!=', '>=', '<', '>', '<='],
      isVisible: true,
      disabled: false,
    },

    {
      name: 'functions',
      title: 'Functions',
      icon: faSquareRootVariable,
      operators: ['sin', 'cos', 'tan', 'log', 'exp', 'sqrt', 'abs', 'where'],
      isVisible: true,
      disabled: false,
    },
  ]

  $: visOperators = operatorCategories
    .filter((el) => el.isVisible)
    .sort((a, b) => {
      if (a.operators.length > b.operators.length) {
        return -1
      }
      if (a.operators.length < b.operators.length) {
        return 1
      }
      if (a.operators.length === b.operators.length) {
        return 0
      }
    })

  const handleOperatorClick = (event: CustomEvent) => {
    if (event?.detail?.operator) {
      const operator: string = event.detail.operator
      dispatch('handleOperatorClick', { operator })
    }
  }

  const handleArithmeticButtonClick = (event: CustomEvent) => {
    if (event?.detail?.operator) {
      const operator: string = event.detail.operator
      dispatch('handleArithmeticButtonClick', { operator })
    }
  }
  const handleComparisonButtonClick = (event: CustomEvent) => {
    if (event?.detail?.operator) {
      const operator: string = event.detail.operator
      dispatch('handleComparisonButtonClick', { operator })
    }
  }
  const handleFunctionsButtonClick = (event: CustomEvent) => {
    if (event?.detail?.operator === 'where') {
      dispatch('handleWhereFunctionClick', { operator: 'where' })
    } else {
      const operator: string = event.detail.operator
      dispatch('handleFunctionButtonClick', { operator })
    }
  }
  const handleNumberButtonClick = (event: CustomEvent) => {
    if (event?.detail?.operator) {
      const operator: string = event.detail.operator
      dispatch('handleNumberButtonClick', { operator })
    }
  }

  const handleClosePopup = () => {
    dispatch('handleClosePopup')
  }
</script>

<div class="content">
  <div class="stats message is-info is-normal has-background-white mt-5 is-size-8 has-text-weight-semibold">
    <div id="stats-title" class="stats-content message-header">Statistics</div>
    <div class="stats-content">Min:</div>
    <div class="stats-content">{layerMin}</div>
    <div class="stats-content">Max:</div>
    <div class="stats-content">{layerMax}</div>
  </div>
  <div>
    <div data-testid="expression-builder">
      <div class="columns is-centered is-mobile">
        <div class="column is-11 ">
          <div class="tabs is-centered">
            <ul>
              {#each Object.values(operatorCategories) as operatorCategory}
                <li class={activeOperatorCategory === operatorCategory.name ? 'is-active' : ''}>
                  <Wrapper>
                    <a
                      href={'#'}
                      on:click={() => {
                        activeOperatorCategory = operatorCategory.name
                        operatorCategory.isVisible = !operatorCategory.isVisible
                      }}>
                      <Fa icon={operatorCategory.icon} style="font-size: 16px;" />
                    </a>
                    <Tooltip showDelay={100} hideDelay={0} yPos="above">{operatorCategory.title}</Tooltip>
                  </Wrapper>
                </li>
              {/each}
            </ul>
          </div>
        </div>
        <div
          class="column is-1 close"
          alt="Close Colormap Picker"
          title="Close Colormap Picker"
          on:click={handleClosePopup}>
          <Fa icon={faXmark} />
        </div>
      </div>
    </div>
    <div class="container">
      {#each operatorCategories as operCat}
        <OpCat
          on:NumbersButtonClick={handleNumberButtonClick}
          on:ArithmeticButtonClick={handleArithmeticButtonClick}
          on:ComparisonButtonClick={handleComparisonButtonClick}
          on:FunctionsButtonClick={handleFunctionsButtonClick}
          operatorCategory={operCat} />
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  #operator-categories {
    z-index: -1;
  }
  .tabs {
    li {
      a {
        text-transform: capitalize;
      }
    }
  }
  .close {
    cursor: pointer;
  }

  .container {
    padding: 3px;
    display: grid;
    align-content: space-around;
    grid-auto-flow: dense;
    grid-template-columns: repeat(2, minmax(100px, auto));
    //grid-template-columns: repeat(2, auto);
    grid-auto-rows: auto;
    justify-items: center;
    grid-gap: 2px;
    border-left: 1px solid lightgray;

    //background-color: lightcyan;
    // color: #444;
  }

  #ov {
    text-overflow: ellipsis;
  }

  .content {
    display: grid;
    grid-template-columns: minmax(50px, max-content) 3fr;
    gap: 5px;
    grid-template-rows: minmax(50px, 1fr) auto;
  }
  :global(.stats) {
    align-content: flex-start;
    display: grid;
    gap: 2px;
    grid-template-columns: repeat(2, 1fr);
    grid-row: 1/2;
  }
  :global(#stats-title) {
    grid-column: 1/-1;
    align-items: flex-end;
    grid-template-rows: 30px;
  }
  :global(.stats-content) {
    display: flex;
    justify-content: center;
    align-content: center;
    border-bottom: 1px solid lightblue;
    background-color: white;
  }
</style>
