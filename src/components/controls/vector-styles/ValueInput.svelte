<script lang="ts">
  import VectorHistogram from '$components/VectorHistogram.svelte'

  export let propertyStats
  export let propertySelectedValue
  export let expressionValue
</script>

{#if propertyStats}
  {#if Object.keys(propertyStats).length}
    <div class="card-content">
      <div class="content" style="width:100%; height:100%">
        {#if propertyStats.histogram}
          <div style="display: block;">
            <VectorHistogram bind:histogram={propertyStats.histogram} bind:propertySelected={propertySelectedValue} />
            <input
              style="margin-left: auto; margin-right: auto;"
              bind:value={expressionValue}
              class="slider is-fullwidth is-small"
              step={(propertyStats.histogram.bins[propertyStats.histogram.bins.length - 1] -
                propertyStats.histogram.bins[0]) /
                10}
              min={propertyStats.histogram.bins[0]}
              max={propertyStats.histogram.bins[propertyStats.histogram.bins.length - 1]}
              type="range" />
            <input bind:value={expressionValue} class="input is-small" type="text" placeholder="Value" />
          </div>
        {:else}
          <div>Unique Values</div>
          <div class="grid" style="width: fit-content">
            {#each propertyStats.values as value}
              <div class="grid-item">
                <div class="grid-item-content">
                  <div class="grid-item-content-value">
                    <button on:click={() => (expressionValue = value)} class="button is-small is-primary"
                      >{value}</button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
          <input bind:value={expressionValue} class="input is-small" type="text" placeholder="Value" />
        {/if}
      </div>
    </div>
  {/if}
{/if}

<style lang="scss">
  .grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-gap: 1px;
  }

  .input {
    margin-top: 5%;
    margin-left: auto;
    margin-right: auto;
  }
</style>
