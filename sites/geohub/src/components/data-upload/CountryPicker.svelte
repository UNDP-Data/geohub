<script lang="ts">
  import Notification from '$components/controls/Notification.svelte'
  import { initTippy } from '$lib/helper'
  import type { Continent, Country, Region, Tag } from '$lib/types'
  import { Loader } from '@undp-data/svelte-undp-design'
  import { debounce } from 'lodash-es'
  import CountryCard from './CountryCard.svelte'
  const tippy = initTippy()
  let tooltipContent: HTMLElement

  export let tags: Tag[] = []

  let selectedContinent = -1
  let selectedRegion = -1
  let selectedCountries: Country[]
  let query = ''

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

      tags?.forEach((t) => {
        if (t.key === 'country') {
          const country = countriesMaster.find((c) => c.iso_3 === t.value)
          if (country) {
            if (!selectedCountries) {
              selectedCountries = []
            }
            if (!selectedCountries?.find((c) => c.iso_3 === t.value)) {
              selectedCountries = [...selectedCountries, country]
            }
          }
        }
      })
    }

    let filtered = countriesMaster
    if (continent_code !== -1) {
      filtered = filtered.filter((c) => c.continent_code === continent_code)
    }
    if (region_code !== -1) {
      filtered = filtered.filter((c) => c.region_code === region_code)
    }
    return filtered
  }

  let continents: Promise<Continent[]> = getContinents()
  let regions: Promise<Region[]> = getRegions(-1)
  let countries: Promise<Country[]> = getCountries(-1, -1)

  $: selectedContinent, continentSelected()
  $: selectedRegion, regionSelected()
  const continentSelected = () => {
    regions = getRegions(selectedContinent)
    selectedRegion = -1
    query = ''
  }

  const regionSelected = () => {
    countries = getCountries(selectedContinent, selectedRegion)
    query = ''
  }

  $: query, handleSearch()
  const handleSearch = debounce(async () => {
    if (countriesMaster.length === 0) return
    let filtered = await getCountries(selectedContinent, selectedRegion)
    if (query.length > 0) {
      filtered = filtered.filter((t) => t.country_name.toLowerCase().indexOf(query.toLowerCase()) !== -1)
    }
    countries = new Promise<Country[]>((resolve) => {
      resolve(filtered)
    })
  }, 300)

  const handleCountrySelected = (e) => {
    const country = e.detail.country
    const isSelected = e.detail.isSelected
    if (!selectedCountries) {
      selectedCountries = []
    }
    if (isSelected) {
      selectedCountries.push(country)
    } else {
      const index = selectedCountries.indexOf(country)
      if (index > -1) {
        selectedCountries.splice(index, 1)
      }
    }
    selectedCountries = [...selectedCountries]
    updateTags()
  }

  const updateTags = () => {
    tags = []

    let continentTags: Tag[] = []
    let regionTags: Tag[] = []
    let countryTags: Tag[] = []
    selectedCountries?.forEach((country) => {
      if (!continentTags.find((t) => t.value === country.continent_name)) {
        continentTags = [
          ...continentTags,
          {
            key: 'continent',
            value: country.continent_name,
          },
        ]
      }

      if (!regionTags.find((t) => t.value === country.region_name)) {
        regionTags = [
          ...regionTags,
          {
            key: 'region',
            value: country.region_name,
          },
        ]
      }

      countryTags = [
        ...countryTags,
        {
          key: 'country',
          value: country.iso_3,
        },
      ]
    })

    tags = continentTags.concat(regionTags, countryTags)
  }
</script>

<div class="country-selected is-flex is-align-content-center">
  <div
    class="country-select-button pr-2"
    use:tippy={{ content: tooltipContent }}>
    <div class="box p-2">
      <span class="icon is-large">
        <i class="fa-solid fa-magnifying-glass fa-2xl" />
      </span>
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
      <p class="control has-icons-left pb-2">
        <input
          class="input"
          type="text"
          placeholder="Type a country name"
          bind:value={query} />
        <span class="icon is-left">
          <i
            class="fas fa-search"
            aria-hidden="true" />
        </span>
        {#if query.length > 0}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <span
            class="clear-button"
            on:click={() => (query = '')}>
            <i class="fas fa-xmark sm" />
          </span>
        {/if}
      </p>
      <div class="country-list control">
        {#await countries}
          <Loader size="x-small" />
        {:then rows}
          {#if rows && rows.length > 0}
            <div class="country-list-grid p-1">
              {#each rows as country}
                <CountryCard
                  bind:country
                  isSelected={selectedCountries?.find((c) => c.iso_3 === country.iso_3) ? true : false}
                  on:countrySelected={handleCountrySelected} />
              {/each}
            </div>
          {:else}
            <Notification
              type="info"
              showCloseButton={false}>
              No country found. Try another name.
            </Notification>
          {/if}
        {/await}
      </div>
    </div>
  </div>

  {#if selectedCountries}
    {#each selectedCountries as country}
      <div class="px-1">
        <CountryCard
          bind:country
          isSelectable={false}
          on:countrySelected={handleCountrySelected} />
      </div>
    {/each}
  {/if}
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

    .clear-button {
      position: absolute;
      top: 0.6rem;
      right: 0.8rem;
      cursor: pointer;
      color: gray;
    }

    .country-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .country-list-grid {
      display: grid;
      grid-gap: 5px;
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
