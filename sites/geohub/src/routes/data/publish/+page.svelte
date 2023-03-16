<script lang="ts">
  import type { PageData } from './$types'
  import { enhance } from '$app/forms'
  import { invalidateAll, goto, afterNavigate } from '$app/navigation'
  import { base } from '$app/paths'
  import Tags from '$components/data-upload/Tags.svelte'
  import SdgPicker from '$components/data-upload/SdgPicker.svelte'
  import CountryPicker from '$components/data-upload/CountryPicker.svelte'
  import type { Continent, Country, DatasetFeature, Region, Tag } from '$lib/types'
  import DataProviderPicker from '$components/data-upload/DataProviderPicker.svelte'
  import DataPreview from '$components/data-upload/DataPreview.svelte'
  import { toast } from '@zerodevx/svelte-toast'
  import { TagInputValues } from '$lib/config/AppConfig'
  import { Loader } from '@undp-data/svelte-undp-design'

  export let data: PageData

  // preserve previous page URL
  let previousPage: string = base
  afterNavigate(({ from }) => {
    if (from?.url) {
      previousPage = `${from?.url.pathname}${from?.url.search}`
    }
  })
  const REDIRECRT_TIME = 2000 // two second

  let feature: DatasetFeature = data.feature
  const isNew: boolean = data.isNew ?? true
  let name = feature?.properties.name ?? ''
  let description = feature?.properties.description ?? ''
  let license = feature?.properties.license ?? ''
  let tags = ''
  let isRegistering = false

  let selectedContinent: Continent
  let continentsMaster: Continent[] = []
  let selectedRegion: Region
  let regionsMaster: Region[] = []

  const init = () => {
    data.promises.continents.then((cts) => {
      continentsMaster = cts
      let t = feature.properties.tags.find((t) => t.key === 'continent')
      if (t) {
        selectedContinent = cts.find((c) => c.continent_name === t.value)
        continentSelected(selectedContinent)
      }
    })

    data.promises.regions.then((rs) => {
      regionsMaster = rs
      let t = feature.properties.tags.find((t) => t.key === 'region')
      if (t) {
        selectedRegion = rs.find((c) => c.region_name === t.value)
        regionSelected(selectedRegion)
      }
    })
  }

  init()

  // $: selectedContinent, continentSelected()
  const continentSelected = (c: Continent) => {
    if (c !== selectedContinent) {
      selectedContinent = c
      selectedRegion = undefined
    }
    if (!selectedContinent) {
      continents = []
    } else {
      continents = [
        {
          key: 'continent',
          value: selectedContinent.continent_name,
        },
      ]
    }
  }

  // $: selectedRegion, regionSelected()
  const regionSelected = (r: Region) => {
    selectedRegion = r
    if (!selectedRegion) {
      regions = []
    } else {
      regions = [
        {
          key: 'region',
          value: selectedRegion.region_name,
        },
      ]
    }
  }

  const excludedTagForEditing = [
    'type',
    'container',
    'geometry_column',
    'geometrytype',
    'geometry_type',
    'id',
    'id_column',
    'layertype',
    'schema',
    'srid',
    'table',
  ]

  const initTags = (key: 'provider' | 'sdg_goal' | 'continents' | 'regions' | 'country' | 'other') => {
    const _tags: Tag[] = feature?.properties?.tags
    if (key === 'other') {
      const keys = ['provider', 'sdg_goal', 'country', 'region', 'continent', 'extent', ...excludedTagForEditing]
      return _tags?.filter((t) => !keys.includes(t.key)) ?? []
    } else {
      let keys: string[] = [key]
      return _tags?.filter((t) => keys.includes(t.key)) ?? []
    }
  }

  let providers: Tag[] = initTags('provider')
  let sdgs: Tag[] = initTags('sdg_goal')
  let continents: Tag[] = []
  let regions: Tag[] = []
  let countries: Tag[] = initTags('country')
  let otherTags: Tag[] = initTags('other')

  let licenses = [
    'Creative Commons Zero 1.0 Universal',
    'Creative Commons BY 4.0',
    'Creative Commons BY ShareAlike 4.0',
    'Creative Commons BY NoDerivs 4.0',
    'Creative Commons BY NonCommercial 4.0',
    'Creative Commons BY NonCommercial ShareAlike 4.0',
    'Creative Commons BY NonCommercial NoDerivs 4.0',
    'GNU Free Documentation License',
    'License not specified',
    'Open Data Commons Attribution License',
    'Open Data Commons Open Database License (ODbL)',
    'Open Data Commons Public Domain Dedication and License (PDDL)',
    'Other (Attribution)',
    'Other (Non-Commercial)',
    'Other (Not Open)',
    'Other (Open)',
    'Other (Public Domain)',
    'UK Open Governement License (OGL)',
  ]

  $: sdgs, updateTags()
  $: continents, updateTags()
  $: regions, updateTags()
  $: countries, updateTags()
  $: otherTags, updateTags()
  $: providers, updateTags()
  let isGlobal: 'global' | 'regional' = feature.properties?.tags?.find(
    (t) => t.key === 'extent' && t.value.toLowerCase() === 'global',
  )
    ? 'global'
    : 'regional'

  const updateTags = () => {
    const excludes = ['provider', 'sdg_goal', 'country', 'region', 'continent', ...TagInputValues.map((t) => t.key)]
    const originalTags = feature?.properties?.tags?.filter((t) => !excludes.includes(t.key))

    let joined = sdgs.concat(
      providers,
      continents,
      regions,
      countries,
      otherTags.filter((t) => t.value.length > 0),
      originalTags,
    )
    if (isGlobal === 'global') {
      if (!joined?.find((t) => t.key === 'extent' && t.value === 'Global')) {
        joined = [
          ...joined,
          {
            key: 'extent',
            value: 'Global',
          },
        ]
      }
    } else {
      const index = joined.findIndex((t) => {
        return t.key === 'extent' && t.value === 'Global'
      })
      if (index > -1) {
        joined.splice(index, 1)
      }
    }
    tags = JSON.stringify(joined)
  }

  const handleGlobalRegionalChanged = (type: 'global' | 'regional') => {
    isGlobal = type
    if (isGlobal === 'global') {
      selectedContinent = undefined
      selectedRegion = undefined
      continents = []
      regions = []
      countries = []
    }
  }

  const handleCountrySelected = (e) => {
    const _countries: Country[] = e.detail.countries
    if (_countries.length === 0) {
      countries = []
      return
    }
    if (_countries.length === 1) {
      const firstCountry = _countries[0]
      if (selectedContinent?.continent_code !== firstCountry.continent_code) {
        selectedContinent = continentsMaster.find((c) => c.continent_code === firstCountry.continent_code)
      }
      setTimeout(() => {
        if (selectedRegion?.region_code !== firstCountry.region_code) {
          selectedRegion = regionsMaster.find((c) => c.region_code === firstCountry.region_code)
        }
      }, 100)
    }

    if (!selectedContinent) {
      _countries.forEach((c) => {
        if (continents.find((x) => x.value === c.continent_name)) return
        continents.push({ key: 'continent', value: c.continent_name })
      })
      continents = [...continents]
    }

    if (!selectedRegion) {
      _countries.forEach((c) => {
        if (regions.find((x) => x.value === c.region_name)) return
        regions.push({ key: 'region', value: c.region_name })
      })
      regions = [...regions]
    }

    const temp: Tag[] = []
    _countries.forEach((c) => {
      if (temp.find((x) => x.value === c.country_name)) return
      temp.push({ key: 'country', value: c.iso_3 })
    })
    countries = temp
  }
</script>

<p class="title is-4">{isNew ? 'Publish' : 'Update'} metadata of the dataset</p>
<form
  method="POST"
  action="?/publish"
  use:enhance={({ cancel }) => {
    if (isRegistering) {
      cancel()
    }
    isRegistering = true

    return async ({ result }) => {
      if (result.status === 200) {
        feature = result.data
        if (previousPage) {
          setTimeout(() => {
            goto(previousPage, {
              replaceState: true,
            })
          }, REDIRECRT_TIME)

          toast.push('Dataset was registered successfully. It is going back to the previous page.', {
            duration: REDIRECRT_TIME,
          })
        } else {
          toast.push('Dataset was registered successfully. ')
          await invalidateAll()
          feature = data.feature
          init()
        }
      } else {
        toast.push(result.data)
      }
      isRegistering = false
    }
  }}>
  <div class="field is-grouped py-2">
    <div class="control">
      <button
        class="button is-primary {isRegistering ? 'is-loading' : ''}"
        disabled={!(
          name &&
          license &&
          description &&
          providers.length > 0 &&
          (isGlobal === 'global' ||
            (isGlobal === 'regional' && (continents.length > 0 || regions.length > 0 || countries.length > 0)))
        )}
        type="submit">
        <span class="icon">
          <i class="fa-solid fa-cloud-arrow-up" />
        </span>
        <span> {isNew ? 'Publish' : 'Update'}</span>
      </button>

      <DataPreview
        size="is-normal"
        id={feature.properties.id}
        bind:feature={data.feature}
        url={feature.properties.url.replace('pmtiles://', '')} />
    </div>
  </div>

  <div class="columns">
    <div class="column is-6">
      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">Dataset name</label>
        <div class="control has-icons-right">
          <input
            class="input {name.length > 0 ? 'is-success' : 'is-danger'}"
            type="text"
            name="name"
            placeholder="Type name of dataset"
            disabled={isRegistering}
            bind:value={name} />
          {#if name}
            <span class="icon is-small is-right">
              <i class="fas fa-check has-text-success" />
            </span>
          {/if}
        </div>
        <p class="help is-dark">Name the dataset shortly and precisely.</p>
      </div>

      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">Description</label>
        <div class="control has-icons-right">
          <textarea
            class="textarea {description.length > 0 ? 'is-success' : 'is-danger'} description"
            name="description"
            placeholder="Type description of dataset"
            disabled={isRegistering}
            bind:value={description} />
          {#if description}
            <span class="icon is-small is-right">
              <i class="fas fa-check has-text-success" />
            </span>
          {/if}
        </div>
        <p class="help is-dark">Describe the dataset briefly. This information will be shown in data catalog.</p>
      </div>

      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">License</label>
        <div class="control has-icons-right">
          <div class="select is-fullwidth {license.length > 0 ? 'is-success' : 'is-danger'}">
            <select
              bind:value={license}
              disabled={isRegistering}
              name="license">
              <option value="">Select a data license</option>
              {#each licenses as lc}
                <option value={lc}>{lc}</option>
              {/each}
            </select>
          </div>
          {#if license}
            <span class="icon is-small is-right">
              <i class="fas fa-check has-text-success	" />
            </span>
          {/if}
        </div>
        <p class="help is-dark">
          Open data license definition can be found at<a
            href="https://opendefinition.org/licenses/"
            target="_blank"
            rel="noreferrer">https://opendefinition.org</a
          >.
        </p>
      </div>
    </div>
    <div class="column is-6">
      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">Data providers</label>
        <div class="control">
          <DataProviderPicker bind:tags={providers} />
        </div>
        <p class="help is-dark">Select at least a data provider for the dataset.</p>
      </div>

      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">SDGs (Optional)</label>
        <div class="control">
          <SdgPicker bind:tags={sdgs} />
        </div>
        <p class="help is-dark">
          Select relevant SDG goals which the dataset is related to. Learn more about SDGs <a
            href="https://www.undp.org/sustainable-development-goals"
            target="_blank"
            rel="noreferrer">here</a>
        </p>
      </div>
    </div>
  </div>

  <div class="field">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label">Is your data global or regional?</label>
    <div class="control">
      <div class="field has-addons">
        <p class="control">
          <button
            type="button"
            class="button {isGlobal === 'global' ? 'is-primary is-active' : 'is-primary is-light'}"
            on:click={() => handleGlobalRegionalChanged('global')}>
            <span class="icon is-small">
              <i class="fas fa-globe" />
            </span>
            <span>Global</span>
          </button>
        </p>
        <p class="control">
          <button
            type="button"
            class="button {isGlobal === 'regional' ? 'is-primary is-active' : 'is-primary is-light'}"
            on:click={() => handleGlobalRegionalChanged('regional')}>
            <span class="icon is-small">
              <i class="fas fa-earth-africa" />
            </span>
            <span>Regional</span>
          </button>
        </p>
      </div>
    </div>
  </div>

  {#if isGlobal === 'regional'}
    <div class="field">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">Please select a continent for your data.</label>
      <div class="control">
        {#await data.promises.continents}
          <Loader size="x-small" />
        {:then continents}
          <div class="field has-addons segmentbuttons">
            <p class="control">
              <button
                type="button"
                class="button {selectedContinent === undefined ? 'is-primary is-active' : 'is-primary is-light'}"
                on:click={() => continentSelected(undefined)}>
                <span>All</span>
              </button>
            </p>
            {#each continents as continent}
              <p class="control">
                <button
                  type="button"
                  class="button {selectedContinent === continent ? 'is-primary is-active' : 'is-primary is-light'}"
                  on:click={() => continentSelected(continent)}>
                  <span class="icon is-small">
                    <i
                      class="fa-solid {continent.continent_name === 'Antarctica'
                        ? 'fa-globe'
                        : `fa-earth-${continent.continent_name.toLowerCase()}`}" />
                  </span>
                  <span>{continent.continent_name}</span>
                </button>
              </p>
            {/each}
          </div>
        {/await}
      </div>
    </div>

    {#if isGlobal === 'regional' && selectedContinent?.continent_name !== 'Antarctica'}
      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">Please select a region for your data.</label>
        <div class="control">
          {#await data.promises.regions}
            <Loader size="x-small" />
          {:then regions}
            <div class="field has-addons segmentbuttons">
              <p class="control">
                <button
                  type="button"
                  class="button {selectedRegion?.region_code ? 'is-primary is-light' : 'is-primary is-active'}"
                  on:click={() => regionSelected(undefined)}>
                  <span>All</span>
                </button>
              </p>
              {#each regions as region}
                {#if selectedContinent?.continent_code === region.continent_code}
                  <p class="control">
                    <button
                      type="button"
                      class="button {selectedRegion === region ? 'is-primary is-active' : 'is-primary is-light'}"
                      on:click={() => regionSelected(region)}>
                      <span>{region.region_name}</span>
                    </button>
                  </p>
                {/if}
              {/each}
            </div>
          {/await}
        </div>
      </div>
    {/if}
    <div class="field">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">Please select countries</label>
      <div class="control">
        <CountryPicker
          on:change={handleCountrySelected}
          bind:tags={countries}
          bind:selectedContinent
          bind:selectedRegion />
      </div>
    </div>
  {/if}

  <div class="field">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label">Tags (Optional)</label>
    <div class="control">
      <Tags bind:tags={otherTags} />
    </div>
    <p class="help is-dark">
      Select relevant tags which the dataset is related to. These tags will be helpful for users to search data.
    </p>
  </div>

  <div class="field is-grouped py-2">
    <div class="control">
      <button
        class="button is-primary {isRegistering ? 'is-loading' : ''}"
        disabled={!(
          name &&
          license &&
          description &&
          providers.length > 0 &&
          (isGlobal === 'global' ||
            (isGlobal === 'regional' && (continents.length > 0 || regions.length > 0 || countries.length > 0)))
        )}
        type="submit">{isNew ? 'Publish' : 'Update'}</button>
    </div>
  </div>

  <input
    class="input"
    type="hidden"
    name="feature"
    value={JSON.stringify(feature)} />

  <input
    class="input"
    type="hidden"
    name="tags"
    bind:value={tags} />
</form>

<style lang="scss">
  .description {
    resize: none;
    height: 100px;
  }

  .segmentbuttons {
    max-width: 100vw;
    overflow-x: auto;
  }
</style>
