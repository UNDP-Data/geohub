<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
  import { faDiagramProject } from '@fortawesome/free-solid-svg-icons/faDiagramProject'
  import { faEquals } from '@fortawesome/free-solid-svg-icons/faEquals'
  import { faPlusMinus } from '@fortawesome/free-solid-svg-icons/faPlusMinus'
  import { faArrowDown19 } from '@fortawesome/free-solid-svg-icons/faArrowDown19'
  import { faSquareRootVariable } from '@fortawesome/free-solid-svg-icons/faSquareRootVariable'

  import type { Layer } from '$lib/types'

  let activeOperatorCategory = ''
  export let layer: Layer
  export let layerMax: number
  export let layerMin: number
  let numberOfClasses = layer.intervals.numberOfClasses

  $: {
    if (layer) {
      numberOfClasses = layer.intervals.numberOfClasses
    }
  }

  const dispatch = createEventDispatcher()
  const operatorCategories = [
    {
      name: 'arithmetic',
      title: 'Arithmetic operators',
      icon: faPlusMinus,
      operators: ['*', '/', '+', '-', '%', '**'],
      isVisible: true,
    },
    {
      name: 'comparison',
      title: 'Comparison operators',
      icon: faEquals,
      operators: ['=', '!=', '>=', '<', '>', '<='],
      isVisible: false,
    },
    {
      name: 'logical',
      title: 'Logical operators',
      icon: faDiagramProject,
      operators: ['&', '~', '|'],
      isVisible: false,
    },
    {
      name: 'numbers',
      title: 'Numbers',
      icon: faArrowDown19,
      operators: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')'],
      isVisible: false,
    },
    {
      name: 'functions',
      title: 'Functions',
      icon: faSquareRootVariable,
      operators: ['sin', 'cos', 'tan', 'log', 'exp', 'sqrt', 'abs'],
      isVisible: false,
    },
  ]
  const ncols = 2
  const nrows = 3

  // const handleSetActiveColorMapType = (colorMapType: ColorMapTypes) => {
  //   activeColorMapType = colorMapType
  // }

  const handleColorMapClick = (colorMapName: string) => {
    if (colorMapName !== layer.colorMapName) {
      dispatch('handleColorMapClick', { colorMapName })
      layer.colorMapName = colorMapName
    }
  }

  const handleClosePopup = () => {
    dispatch('handleClosePopup')
  }
</script>

<div data-testid="color-map-picker">
  <div class="columns is-vcentered is-mobile">
    <div class="column is-11">
      <div class="tabs">
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
  <!-- {#each Array(nrows) as _, i}
    <div class="columns is-3 is-centered">
      {#each Array(ncols) as _, j}
        <div class="column is-3  ">
          {[ i, j, (j+1)*i + j]}
        </div>  
      {/each}
    </div>  
    
    
  {/each} -->

  <!-- {#each operatorCategories as operCat}
    <div class={operCat.isVisible ? 'content' : 'is-hidden'} >
      {#each operCat.operators as operator}
        <button class="button is-small " on:click={() =>{console.log(operator)}} alt={operator} title={operator}>
          <span>{operator}</span>
        </button>
      {/each}
    </div>
  {/each} -->

  <!-- <div class="columns">
    <div class="column card-color">
      <ul class="is-size-6">
        {#each colorMapTypes as colorMapType}
          {#if activeColorMapType === colorMapType.name}
            {#each colorMapType.codes.sort((a, b) => a.localeCompare(b)) as colorMapName}
              <li on:click={() => handleColorMapClick(colorMapName)}>
                <ColorMapPickerCard
                  {colorMapName}
                  colorMapType={ColorMapTypes.SEQUENTIAL}
                  {layerMax}
                  {layerMin}
                  {numberOfClasses}
                  isSelected={layer.colorMapName === colorMapName ? true : false} />
              </li>
            {/each}
          {/if}
        {/each}
      </ul>
    </div>
  </div> -->
</div>

<style lang="scss">
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

  .card-color {
    max-height: 150px;
    overflow-y: auto;

    ul {
      display: flex;
      flex-flow: row wrap;
      gap: 15px;

      li {
        cursor: pointer;
        padding: 1px;

        &:hover {
          padding: 0;
          border: 1px solid hsl(204, 86%, 53%);
        }
      }
    }
  }
</style>
