<script lang="ts">
  import { page } from '$app/stores'
  import { enhance } from '$app/forms'
  import Tags from '$components/data-upload/Tags.svelte'
  import SdgPicker from '$components/data-upload/SdgPicker.svelte'
  import CountryPicker from '$components/data-upload/CountryPicker.svelte'
  import type { DatasetFeature, Tag } from '$lib/types'
  import Notification from '$components/controls/Notification.svelte'
  import DataProviderPicker from '$components/data-upload/DataProviderPicker.svelte'

  const feature: DatasetFeature = $page.data.feature
  const isNew: boolean = $page.data.isNew ?? true
  console.log(feature)
  let name = feature?.properties.name ?? ''
  let description = feature?.properties.description ?? ''
  let license = feature?.properties.license ?? ''
  let tags = ''

  const initTags = (key: 'provider' | 'sdg_goal' | 'country' | 'other') => {
    const _tags: Tag[] = feature?.properties?.tags
    if (key === 'other') {
      const keys = ['provider', 'sdg_goal', 'country', 'region', 'continent', 'type', 'container']
      return _tags?.filter((t) => !keys.includes(t.key)) ?? []
    } else {
      let keys: string[] = [key]
      if (key === 'country') {
        keys = ['country', 'region', 'continent']
      }
      return _tags?.filter((t) => keys.includes(t.key)) ?? []
    }
  }

  let providers: Tag[] = initTags('provider')
  let sdgs: Tag[] = initTags('sdg_goal')
  let countries: Tag[] = initTags('country')
  let otherTags: Tag[] = initTags('other')
  let message: { type: 'info' | 'warning' | 'danger'; message: string }

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
  $: countries, updateTags()
  $: otherTags, updateTags()
  $: providers, updateTags()
  const updateTags = () => {
    const excludes = [
      'provider',
      'sdg_goal',
      'country',
      'region',
      'continent',
      'extent',
      'granularity',
      'resolution',
      'year_value',
      'sdg_target',
      'theme',
    ]
    const originalTags = feature?.properties?.tags?.filter((t) => !excludes.includes(t.key))

    const joined = sdgs.concat(
      providers,
      countries,
      otherTags.filter((t) => t.value.length > 0),
      originalTags,
    )

    tags = JSON.stringify(joined)
  }
</script>

<p class="title is-4">{isNew ? 'Publish' : 'Update'} metadata of the dataset</p>
<form
  method="POST"
  action="?/publish"
  use:enhance={() => {
    return async ({ result, update }) => {
      if (result.status === 200) {
        console.log(result.data)
        // await update()
        message = { type: 'info', message: 'Dataset was registered successfully.' }
      } else {
        message = result.data
      }
    }
  }}>
  <div class="field is-grouped py-2">
    <div class="control">
      <button
        class="button is-primary"
        disabled={!(name && license && description && providers.length > 0)}
        type="submit">{isNew ? 'Publish' : 'Update'}</button>
    </div>
  </div>

  {#if message}
    <Notification
      type={message.type}
      showCloseButton={false}>{message.message}</Notification>
  {/if}

  <div class="field">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label">Dataset name</label>
    <div class="control has-icons-right">
      <input
        class="input {name.length > 0 ? 'is-success' : 'is-danger'}"
        type="text"
        name="name"
        placeholder="Type name of dataset"
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
    <label class="label">Countries (Optional)</label>
    <div class="control">
      <CountryPicker bind:tags={countries} />
    </div>
    <p class="help is-dark">Select relevant countries which the dataset is related to.</p>
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
        class="button is-primary"
        disabled={!(name && license && description && providers.length > 0)}
        type="submit">{isNew ? 'Publish' : 'Update'}</button>
    </div>
  </div>

  <input
    class="input"
    type="hidden"
    name="geometry"
    value={feature?.geometry ? JSON.stringify(feature?.geometry) : ''} />

  <input
    class="input"
    type="hidden"
    name="id"
    value={feature?.properties?.id ?? ''} />

  <input
    class="input"
    type="hidden"
    name="url"
    value={feature?.properties?.url ?? ''} />

  <input
    class="input"
    type="hidden"
    name="is_raster"
    value={feature?.properties?.is_raster ?? ''} />

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
</style>
