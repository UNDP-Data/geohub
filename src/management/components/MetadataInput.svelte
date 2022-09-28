<script lang="ts">
  import AutoComplete from 'simple-svelte-autocomplete'
  import * as EmailValidator from 'email-validator'
  import type { Metadata } from '../interfaces'
  import {
    continentals,
    countries,
    dataExtents,
    MetadataConfig,
    regions,
    resolutions,
    subnationals,
    units,
  } from '../constants'
  import ConditionTag from './ConditionTag.svelte'

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
    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">{MetadataConfig.sdgTarget.title}</label>
      </div>
      <div class="field-body">
        <div class="field metadata-control">
          <p class="control">
            <input
              class="input"
              type="text"
              bind:value={metadata.sdgTarget}
              placeholder="represented by 2-3 keywords extracted from sdg target descriptions" />
          </p>
          <div class="condition-tag">
            <ConditionTag isSuccess={metadata.sdgTarget && metadata.sdgTarget.length > 0} />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="column is-6">
    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">{MetadataConfig.theme.title}</label>
      </div>
      <div class="field-body">
        <div class="field metadata-control">
          <p>
            <input
              class="input"
              type="text"
              bind:value={metadata.theme}
              placeholder="the overall theme of the data collection, e.g., vegetation health, pregnancies" />
          </p>
          <div class="condition-tag">
            <ConditionTag isSuccess={metadata.theme && metadata.theme.length > 0} />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="column is-6">
    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">{MetadataConfig.layerDescription.title}</label>
      </div>
      <div class="field-body">
        <div class="field metadata-control">
          <p>
            <input
              class="input"
              type="text"
              bind:value={metadata.layerDescription}
              placeholder="Description of the dataset" />
          </p>
          <div class="condition-tag">
            <ConditionTag isSuccess={metadata.layerDescription && metadata.layerDescription.length > 0} />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="column is-6">
    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">{MetadataConfig.year.title}</label>
      </div>
      <div class="field-body">
        <div class="field metadata-control">
          <p />
          <AutoComplete
            items={yearSelection}
            bind:selectedItem={metadata.year}
            placeholder="Select the unit of the data"
            showClear={true}
            lock={true} />
          <div class="condition-tag">
            <ConditionTag isSuccess={metadata.year ? true : false} />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="column is-6">
    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">{MetadataConfig.extent.title}</label>
      </div>
      <div class="field-body">
        <div class="field metadata-control">
          <p />
          <AutoComplete
            items={dataExtents}
            bind:selectedItem={metadata.extent}
            placeholder="Select the geographic coverage of the data"
            showClear={true} />
          <div class="condition-tag">
            <ConditionTag isSuccess={metadata.extent && metadata.extent.length > 0} />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="column is-6">
    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">{MetadataConfig.resolution.title}</label>
      </div>
      <div class="field-body">
        <div class="field metadata-control">
          <p />
          <AutoComplete
            items={resolutions}
            bind:selectedItem={metadata.resolution}
            placeholder="Select the resolution of the data"
            showClear={true} />
          <div class="condition-tag">
            <ConditionTag isSuccess={metadata.resolution && metadata.resolution.length > 0} />
          </div>
        </div>
      </div>
    </div>
  </div>

  {#if metadata.extent && !['', 'Global'].includes(metadata.extent)}
    <div class="column is-6">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">{MetadataConfig.granularity.title}</label>
        </div>
        <div class="field-body">
          <div class="field metadata-control">
            <p />
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
            <div class="condition-tag">
              <ConditionTag isSuccess={metadata.granularity && metadata.granularity.length > 0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <div class="column is-6">
    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">{MetadataConfig.unit.title}</label>
      </div>
      <div class="field-body">
        <div class="field metadata-control">
          <p />
          <AutoComplete
            items={units}
            bind:selectedItem={metadata.unit}
            placeholder="Select the unit of the data"
            showClear={true} />
          <div class="condition-tag">
            <ConditionTag isSuccess={metadata.unit && metadata.unit.length > 0} />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="column is-6">
    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">{MetadataConfig.source.title}</label>
      </div>
      <div class="field-body">
        <div class="field metadata-control">
          <p>
            <input class="input" type="text" bind:value={metadata.source} placeholder="Source of the data" />
          </p>
          <div class="condition-tag">
            <ConditionTag isSuccess={metadata.source && metadata.source.length > 0} />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="column is-6">
    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">{MetadataConfig.email.title}</label>
      </div>
      <div class="field-body">
        <div class="field metadata-control">
          <p>
            <input class="input" type="email" bind:value={metadata.email} placeholder="Contact email" />
          </p>
          <div class="condition-tag">
            <ConditionTag isSuccess={metadata.email && EmailValidator.validate(metadata.email)} />
          </div>
        </div>
      </div>
    </div>
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

  .metadata-control {
    position: relative;
  }

  .condition-tag {
    position: absolute;
    top: 7px;
    right: -20px;
  }
</style>
