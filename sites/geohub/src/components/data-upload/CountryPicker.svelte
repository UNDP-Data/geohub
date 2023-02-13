<script lang="ts">
  import { initTippy } from '$lib/helper'
  import type { Continent, Country, Region } from '$lib/types'
  import Loader from '@undp-data/svelte-undp-design/src/lib/Loader/Loader.svelte'
  import CountryCard from './CountryCard.svelte'
  const tippy = initTippy()
  let tooltipContent: HTMLElement

  let selectedContinent = -1
  let selectedRegion = -1
  let selectedCountries: Country[] = []

  const getContinents = async () => {
    const res = await fetch(`/api/continents`)
    const json = await res.json()
    return json as Continent[]
  }

  const getRegions = async (continent_code: number) => {
    const res = await fetch(`/api/regions?continent=${continent_code}`)
    const json = await res.json()
    return json as Region[]
  }

  const getCountries = async (continent_code: number, region_code: number) => {
    const res = await fetch(`/api/countries?continent=${continent_code}&region=${region_code}`)
    const json = await res.json()
    return json as Country[]
  }

  let continents: Promise<Continent[]> = getContinents()
  let regions: Promise<Region[]>
  let countries: Promise<Country[]>

  $: selectedContinent, continentSelected()
  $: selectedRegion, regionSelected()
  const continentSelected = () => {
    if (selectedContinent === -1) {
      selectedRegion = -1
    } else {
      regions = getRegions(selectedContinent)
    }
  }

  const regionSelected = () => {
    if (selectedRegion > -1) {
      countries = getCountries(selectedContinent, selectedRegion)
    }
  }

  const handleCountrySelected = (e) => {
    const country = e.detail.country
    const isSelected = e.detail.isSelected
    if (isSelected) {
      selectedCountries.push(country)
    } else {
      const index = selectedCountries.indexOf(country)
      if (index > -1) {
        selectedCountries.splice(index, 1)
      }
    }
    selectedCountries = [...selectedCountries]
  }
</script>

<div class="country-selected is-flex">
  {#each selectedCountries as country}
    <CountryCard
      bind:country
      isSelectable={false}
      on:countrySelected={handleCountrySelected} />
  {/each}

  <div
    class="country-select-button"
    use:tippy={{ content: tooltipContent }}>
    <div class="box p-2">
      <span class="icon is-large">
        <i class="fa-solid fa-magnifying-glass fa-2xl" />
      </span>
    </div>
  </div>
</div>

<div
  class="tooltip p-2"
  data-testid="tooltip"
  bind:this={tooltipContent}>
  <div class="field">
    <label class="label">Continent</label>
    <div class="control">
      {#await continents}
        <Loader size="x-small" />
      {:then rows}
        <div class="select is-fullwidth">
          <select bind:value={selectedContinent}>
            <option value={-1}>Select a continent</option>
            {#each rows as continent}
              <option value={continent.continent_code}>{continent.continent_name}</option>
            {/each}
          </select>
        </div>
      {/await}
    </div>
    {#if selectedContinent !== -1}
      <label class="label">Region</label>
      <div class="control">
        {#await regions}
          <Loader size="x-small" />
        {:then rows}
          <div class="select is-fullwidth">
            <select bind:value={selectedRegion}>
              <option value={-1}>Select a region</option>
              {#if rows}
                {#each rows as region}
                  <option value={region.region_code}>{region.region_name}</option>
                {/each}
              {/if}
            </select>
          </div>
        {/await}
      </div>
    {/if}
    {#if selectedRegion !== -1}
      <label class="label">Countries</label>
      <div class="country-list control">
        <div class="grid">
          {#await countries}
            <Loader size="x-small" />
          {:then rows}
            {#if rows}
              {#each rows as country}
                <CountryCard
                  bind:country
                  isSelected={selectedCountries.find((c) => c.iso_3 === country.iso_3) ? true : false}
                  on:countrySelected={handleCountrySelected} />
              {/each}
            {/if}
          {/await}
        </div>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @import 'tippy.js/dist/tippy.css';
  @import 'tippy.js/themes/light.css';

  .country-select-button {
    width: fit-content;
    cursor: pointer;
  }

  .tooltip {
    max-width: 400px;

    .country-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .grid {
      display: grid;
      grid-gap: 5px;
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
