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

  let continentsMaster: Continent[] = []
  let regionsMaster: Region[] = []
  let countriesMaster: Country[] = []

  const getContinents = async () => {
    if (continentsMaster.length === 0) {
      const res = await fetch(`/api/continents`)
      const json = await res.json()
      continentsMaster = json as Continent[]
    }
    return continentsMaster
  }

  const getRegions = async (continent_code: number) => {
    if (regionsMaster.length === 0) {
      const res = await fetch(`/api/regions`)
      const json = await res.json()
      regionsMaster = json as Region[]
    }
    if (continent_code !== -1) {
      return regionsMaster.filter((r) => r.continent_code === continent_code)
    } else {
      return regionsMaster
    }
  }

  const getCountries = async (continent_code: number, region_code: number) => {
    if (countriesMaster.length === 0) {
      const res = await fetch(`/api/countries`)
      const json = await res.json()
      countriesMaster = json as Country[]
    }

    if (continent_code !== -1 && region_code !== -1) {
      return countriesMaster.filter((c) => c.continent_code === continent_code && c.region_code === region_code)
    } else if (continent_code !== -1 && region_code === -1) {
      return countriesMaster.filter((c) => c.continent_code === continent_code)
    } else if (continent_code === -1 && region_code !== -1) {
      return countriesMaster.filter((c) => c.region_code === region_code)
    } else {
      return countriesMaster
    }
  }

  let continents: Promise<Continent[]> = getContinents()
  let regions: Promise<Region[]> = getRegions(-1)
  let countries: Promise<Country[]> = getCountries(-1, -1)

  $: selectedContinent, continentSelected()
  $: selectedRegion, regionSelected()
  const continentSelected = () => {
    regions = getRegions(selectedContinent)
    selectedRegion = -1
  }

  const regionSelected = () => {
    countries = getCountries(selectedContinent, selectedRegion)
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
            <option value={-1}>All continents</option>
            {#each rows as continent}
              <option value={continent.continent_code}>{continent.continent_name}</option>
            {/each}
          </select>
        </div>
      {/await}
    </div>
    <label class="label">Region</label>
    <div class="control">
      {#await regions}
        <Loader size="x-small" />
      {:then rows}
        <div class="select is-fullwidth">
          <select bind:value={selectedRegion}>
            <option value={-1}>All regions</option>
            {#if rows}
              {#each rows as region}
                <option value={region.region_code}>{region.region_name}</option>
              {/each}
            {/if}
          </select>
        </div>
      {/await}
    </div>
    <label class="label">Countries</label>
    <div class="country-list control">
      <div class="grid p-1">
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
    max-width: 350px;

    .country-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .grid {
      display: grid;
      grid-gap: 5px;
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
