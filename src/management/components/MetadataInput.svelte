<script lang="ts">
  import * as EmailValidator from 'email-validator'
  import type { Metadata } from '../interfaces'
  import { continentals, countries, dataExtents, regions, resolutions, subnationals, units } from '../constants'

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

<div class="metadata-form">
  <div class="columns mr-5 ml-5 is-multiline is-centered">
    <div class="column is-6">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">SDG Target</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control">
              <input
                class="input {metadata.sdgTarget && metadata.sdgTarget.length > 0 ? 'is-success' : 'is-danger'}"
                type="text"
                bind:value={metadata.sdgTarget}
                placeholder="represented by 2-3 keywords extracted from sdg target descriptions" />
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="column is-6">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Theme</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p>
              <input
                class="input {metadata.theme && metadata.theme.length > 0 ? 'is-success' : 'is-danger'}"
                type="text"
                bind:value={metadata.theme}
                placeholder="the overall theme of the data collection, e.g., vegetation health, pregnancies" />
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="column is-6">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Layer description</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p>
              <input
                class="input {metadata.layerDescription && metadata.layerDescription.length > 0
                  ? 'is-success'
                  : 'is-danger'}"
                type="text"
                bind:value={metadata.layerDescription}
                placeholder="Description of the dataset" />
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="column is-6">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Year</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p />
            <div class="select is-fullwidth is-success">
              <select bind:value={metadata.year}>
                {#each yearSelection as y}
                  <option value={y}>{y}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="column is-6">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Extent</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p />
            <div
              class="select is-fullwidth {metadata.extent && metadata.extent.length > 0 ? 'is-success' : 'is-danger'}">
              <select bind:value={metadata.extent}>
                <option value="">Select extent</option>
                {#each dataExtents as extent}
                  <option value={extent}>{extent}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="column is-6">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Resolution</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p />
            <div
              class="select is-fullwidth {metadata.resolution && metadata.resolution.length > 0
                ? 'is-success'
                : 'is-danger'}">
              <select bind:value={metadata.resolution}>
                <option value="">Select region</option>
                {#each resolutions as resolution}
                  <option value={resolution}>{resolution}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    {#if !['', 'Global'].includes(metadata.extent)}
      <div class="column is-6">
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Granularity</label>
          </div>
          <div class="field-body">
            <div class="field">
              <p />
              <div
                class="select is-fullwidth {metadata.granularity && metadata.granularity.length > 0
                  ? 'is-success'
                  : 'is-danger'}">
                <select bind:value={metadata.granularity}>
                  <option value="">Select granularity</option>

                  {#if metadata.extent === 'Continental'}
                    {#each continentals as continental}
                      <option value={continental}>{continental}</option>
                    {/each}
                  {:else if metadata.extent === 'Regional/Subcontinent'}
                    {#each regions as region}
                      <option value={region}>{region}</option>
                    {/each}
                  {:else if metadata.extent === 'Subnational'}
                    {#each subnationals as subnational}
                      <option value={subnational}>{subnational}</option>
                    {/each}
                  {:else if metadata.extent === 'Country'}
                    {#each countries as country}
                      <option value={country}>{country}</option>
                    {/each}
                  {/if}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <div class="column is-6">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Unit</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p />
            <div class="select is-fullwidth {metadata.unit && metadata.unit.length > 0 ? 'is-success' : 'is-danger'}">
              <select bind:value={metadata.unit}>
                <option value="">Select unit</option>
                {#each units as unit}
                  <option value={unit}>{unit}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="column is-6">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Source</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p>
              <input
                class="input {metadata.source && metadata.source.length > 0 ? 'is-success' : 'is-danger'}"
                type="text"
                bind:value={metadata.source}
                placeholder="Source of the data" />
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="column is-6">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">E-mail</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p>
              <input
                class="input {metadata.email && isValidEmail === true ? 'is-success' : 'is-danger'}"
                type="email"
                bind:value={metadata.email}
                placeholder="Contact email" />
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  $height: calc(50vh);

  .metadata-form {
    max-height: $height;
    overflow-y: auto;
  }
</style>
