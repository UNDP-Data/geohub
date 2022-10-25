<script lang="ts">
  import AutoComplete from 'simple-svelte-autocomplete'
  import * as EmailValidator from 'email-validator'
  import type { Metadata } from '../interfaces'
  import { continentals, countries, dataExtents, regions, resolutions, subnationals, units } from '../constants'
  import MetadataField from './MetadataField.svelte'

  export let metadata: Metadata = {}
  export let metadataFormCompleted = false
  let isValidEmail = false

  let yearSelection: number[] = []
  const currentYear = new Date().getFullYear()
  for (let year = currentYear; year > 1900; year--) {
    yearSelection.push(year)
  }
  metadata.year = yearSelection[0]

  $: if (metadata) {
    let requiredItems = 10
    if (metadata.extent && metadata.extent === 'Global') {
      requiredItems = 9
      metadata.granularity = ''
    }
    if (metadata.email) {
      isValidEmail = EmailValidator.validate(metadata.email)
    }
    if (Object.keys(metadata).length < requiredItems) {
      metadataFormCompleted = false
    } else {
      const completed = []
      Object.keys(metadata).forEach((key) => {
        const value = metadata[key]
        if (value && value.toString().length > 0) {
          completed.push(value)
        }
      })

      if (isValidEmail !== true) {
        metadataFormCompleted = false
      } else {
        metadataFormCompleted = completed.length === requiredItems
      }
    }
  }
</script>

<div class="columns mx-5 is-multiline is-centered">
  <div class="column is-6">
    <MetadataField
      name="sdgTarget"
      bind:value={metadata.sdgTarget}>
      <input
        class="input"
        type="text"
        bind:value={metadata.sdgTarget}
        placeholder="represented by 2-3 keywords extracted from sdg target descriptions" />
    </MetadataField>
  </div>
  <div class="column is-6">
    <MetadataField
      name="theme"
      bind:value={metadata.theme}>
      <input
        class="input"
        type="text"
        bind:value={metadata.theme}
        placeholder="the overall theme of the data collection, e.g., vegetation health, pregnancies" />
    </MetadataField>
  </div>

  <div class="column is-6">
    <MetadataField
      name="layerDescription"
      bind:value={metadata.layerDescription}>
      <input
        class="input"
        type="text"
        bind:value={metadata.layerDescription}
        placeholder="Description of the dataset" />
    </MetadataField>
  </div>

  <div class="column is-6">
    <MetadataField
      name="year"
      bind:value={metadata.year}>
      <AutoComplete
        items={yearSelection}
        bind:selectedItem={metadata.year}
        placeholder="Select the unit of the data"
        showClear={true}
        lock={true} />
    </MetadataField>
  </div>

  <div class="column is-6">
    <MetadataField
      name="extent"
      bind:value={metadata.extent}>
      <AutoComplete
        items={dataExtents}
        bind:selectedItem={metadata.extent}
        placeholder="Select the geographic coverage of the data"
        showClear={true} />
    </MetadataField>
  </div>

  <div class="column is-6">
    <MetadataField
      name="resolution"
      bind:value={metadata.resolution}>
      <AutoComplete
        items={resolutions}
        bind:selectedItem={metadata.resolution}
        placeholder="Select the resolution of the data"
        showClear={true} />
    </MetadataField>
  </div>

  {#if metadata.extent && !['', 'Global'].includes(metadata.extent)}
    <div class="column is-6">
      <MetadataField
        name="granularity"
        bind:value={metadata.granularity}>
        {#if metadata.extent === 'Continental'}
          <AutoComplete
            items={continentals}
            bind:selectedItem={metadata.granularity}
            placeholder="Select the level of detail at the data"
            showClear={true} />
        {:else if metadata.extent === 'Regional/Subcontinent'}
          <AutoComplete
            items={regions}
            bind:selectedItem={metadata.granularity}
            placeholder="Select the level of detail at the data"
            showClear={true} />
        {:else if metadata.extent === 'Subnational'}
          <AutoComplete
            items={subnationals}
            bind:selectedItem={metadata.granularity}
            placeholder="Select the level of detail at the data"
            showClear={true} />
        {:else if metadata.extent === 'Country'}
          <AutoComplete
            items={countries}
            bind:selectedItem={metadata.granularity}
            placeholder="Select the level of detail at the data"
            showClear={true} />
        {/if}
      </MetadataField>
    </div>
  {/if}

  <div class="column is-6">
    <MetadataField
      name="unit"
      bind:value={metadata.unit}>
      <AutoComplete
        items={units}
        bind:selectedItem={metadata.unit}
        placeholder="Select the unit of the data"
        showClear={true} />
    </MetadataField>
  </div>

  <div class="column is-6">
    <MetadataField
      name="source"
      bind:value={metadata.source}>
      <input
        class="input"
        type="text"
        bind:value={metadata.source}
        placeholder="Source of the data" />
    </MetadataField>
  </div>

  <div class="column is-6">
    <MetadataField
      name="email"
      bind:value={metadata.email}>
      <input
        class="input"
        type="text"
        bind:value={metadata.email}
        placeholder="Contact email" />
    </MetadataField>
  </div>
</div>

<style lang="scss">
  :global(.autocomplete) {
    width: 100%;
  }

  :global(.autocomplete-input) {
    background-color: #fff;
    border-radius: 10px;
    border: 1px solid #ccc;
    box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
    color: #4a4a4a;
    font-family: ProximaNova, sans-serif;
    font-size: 11px;
    height: 40px !important;
  }

  :global(.autocomplete-list) {
    top: 5px !important;
    background-color: #fff;
    border-radius: 10px;
    border: 1px solid #ccc;
    box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
  }
</style>
