<script lang="ts">
  import VectorHistogram from '$components/VectorHistogram.svelte'
  import RangeSlider from 'svelte-range-slider-pips'
  import Tags from '$components/Tags.svelte'
  import { createEventDispatcher } from 'svelte'
  import { map } from '$stores'
  import type { MapGeoJSONFeature } from 'maplibre-gl'

  export let propertyStats
  export let propertySelectedValue
  export let expressionValue
  export let acceptSingleTag = true
  export let layer

  const layerId = layer.definition.id

  const dispatch = createEventDispatcher()

  const layers = $map.getStyle().layers.filter((layer) => layer.id === layerId)
  const features = layers.map((layer) => $map.queryRenderedFeatures({ layers: layers.map((layer) => layer.id) }))

  // get the values of the property for each feature
  const values = features.map((feature) => feature.map((feature) => feature.properties[propertySelectedValue]))
  propertyStats.values = values.flat()

  let tagsList = []
  let optionsList: [] = [...new Set(values.flat())]
  let hideOptions = true
  let step
  if(propertyStats.type === 'number') {
    step = (propertyStats.max - propertyStats.min) / 100
  }
  $:{
    propertyStats.type === 'string' ? optionsList = [...new Set(propertyStats.values)] : optionsList = propertyStats.values
  }


  const onSliderStop = (event) => {
    dispatch('sliderStop', event.detail)
    console.log(event.detail)
    expressionValue = event.detail.value
  }
  const handleTags = (event: CustomEvent) => {
    dispatch('tags', event.detail)
    tagsList = event.detail.tags
    expressionValue = tagsList
  }

  //  Todo: Use tags input for includes and excludes operator
  // Disable includes and excludes for float columns
  // float always show a slider
  // float show greater than and less than
</script>

{#if propertyStats}
  {#if Object.keys(propertyStats).length}
    <div class="card-content">
      <div class="content" style="width:100%; height:100%">
        {#if propertyStats.histogram}
          <div style="display: block;">
            <RangeSlider
              bind:values={expressionValue}
              float
              range
              min={propertyStats.histogram.bins[0]}
              max={propertyStats.histogram.bins[propertyStats.histogram.bins.length - 1]}
              pips
              first="label"
              last="label"
              {step}
              rest={false}
              on:stop={onSliderStop} />
          </div>
          <input bind:value={expressionValue} class="input is-small" type="text" placeholder="Value" />
        {:else if propertyStats.type === 'string'}
          <div>
            <Tags
              on:tags={handleTags}
              maxTags={acceptSingleTag ? 1 : 100}
              addKeys={[9, 13]}
              splitWith={'/'}
              onlyUnique={true}
              removeKeys={[27]}
              placeholder={'Select a value...'}
              autoComplete={optionsList}
              tags={tagsList}
              allowBlur={true}
              disable={false}
              minChars={0}
              onlyAutocomplete={true}
              labelShow={false}
              class={acceptSingleTag && tagsList.length > 0 ? 'disable' : null}
              {acceptSingleTag} />
            <button
              style="margin-top:5%; margin-left: 62%"
              class="button is-small primary-button"
              on:click={() => {
                dispatch('apply')
              }}>Confirm Selection</button>
          </div>
        {:else}
          <!--{#if propertyStats.values.length < 25}-->
          <!--  <div class='grid'>-->
          <!--    {#each propertyStats.values as value}-->
          <!--      <div-->
          <!--        class="card grid-item vector-expression-card unique-values-card"-->
          <!--        on:click={() =>-->
          <!--          {-->
          <!--            dispatch('uniqueButton', value)-->
          <!--            expressionValue = value-->
          <!--          }}>-->
          <!--        <div class="vector-expression-card-content">-->
          <!--          <span class="text-centered">{value}</span>-->
          <!--        </div>-->
          <!--      </div>-->
          <!--    {/each}-->
          <!--  </div>-->
          <!--  <input bind:value={expressionValue} class="input is-small" type="text" placeholder="Value" />-->
          <!--{:else}-->
          <!--              Range slider with steps being the values-->
          <RangeSlider
            bind:values={expressionValue}
            float
            range
            min={propertyStats.min}
            max={propertyStats.max}
            pips
            first="label"
            last="label"
            {step}
            pipstep={step}
            rest={false}
            on:stop={onSliderStop} />
          <!--              <div class="grid" style="width: fit-content">-->
          <!--            {#each [...new Set(propertyStats.values)] as value}-->
          <!--              <div class="grid-item">-->
          <!--                  <button on:click={() => {-->
          <!--                    expressionValue = value-->
          <!--                    dispatch('uniqueButton', value)-->
          <!--                  }} class="button unique-button is-primary">{value}</button>-->
          <!--              </div>-->
          <!--            {/each}-->
          <!--              </div>-->
          <input bind:value={expressionValue} class="input is-small" type="text" placeholder="Value" />
          <!--{/if}-->
        {/if}
      </div>
    </div>
  {/if}
{/if}

<style lang="scss">
  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 1px;
  }

  .grid-item {
    width: 100% !important;
    height: 100% !important;
  }

  .input {
    margin-top: 5%;
    margin-left: auto;
    margin-right: auto;
  }

  .unique-values-card {
    height: 50px;
    width: 50px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .unique-values-card:hover {
    background-color: #f5f5f5;
  }

  .disable {
    pointer-events: none;
    cursor: not-allowed;
  }
</style>
