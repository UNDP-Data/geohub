<script lang="ts">
  import { enhance } from '$app/forms'
  import Tags from '$components/data-upload/Tags.svelte'
  import SdgPicker from '$components/data-upload/SdgPicker.svelte'
  import CountryPicker from '$components/data-upload/CountryPicker.svelte'
  import type { Tag } from '$lib/types'
  import Notification from '$components/controls/Notification.svelte'

  let name = ''
  let description = ''
  let source = ''
  let license = ''
  let tags = ''
  let sdgs: Tag[] = []
  let countries: Tag[] = []
  let otherTags: Tag[] = []
  let errorMessage: { type: 'info' | 'warning' | 'danger'; message: string }

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
  const updateTags = () => {
    const joined = sdgs.concat(
      countries,
      otherTags.filter((t) => t.value.length > 0),
    )

    tags = JSON.stringify(joined)
  }
</script>

<p class="title is-4">Publish data to GeoHub</p>
<form
  method="POST"
  action="?/publish"
  use:enhance={() => {
    return async ({ result, update }) => {
      if (result.status === 200) {
        console.log(result.data)
        await update()
        errorMessage = undefined
      } else {
        errorMessage = result.data
      }
    }
  }}>
  <div class="field is-grouped py-2">
    <div class="control">
      <button
        class="button is-primary"
        disabled={!(name && source && license && description)}
        type="submit">Publish</button>
    </div>
  </div>

  {#if errorMessage}
    <Notification
      type={errorMessage.type}
      showCloseButton={false}>{errorMessage.message}</Notification>
  {/if}

  <div class="columns">
    <div class="column">
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
      </div>

      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">Data providers</label>
        <div class="control has-icons-right">
          <input
            class="input {source.length > 0 ? 'is-success' : 'is-danger'}"
            type="text"
            name="source"
            placeholder="Type attribution of dataset"
            bind:value={source} />
          {#if source}
            <span class="icon is-small is-right">
              <i class="fas fa-check has-text-success	" />
            </span>
          {/if}
        </div>
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
      </div>
    </div>
    <div class="column">
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
      </div>
    </div>
  </div>

  <div class="field">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label">Countries (Optional)</label>
    <div class="control">
      <CountryPicker bind:tags={countries} />
    </div>
  </div>

  <div class="field">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label">SDGs (Optional)</label>
    <div class="control">
      <SdgPicker bind:tags={sdgs} />
    </div>
  </div>

  <div class="field">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label">Tags (Optional)</label>
    <div class="control">
      <Tags bind:tags={otherTags} />
    </div>
  </div>

  <div class="field is-grouped py-2">
    <div class="control">
      <button
        class="button is-primary"
        disabled={!(name && source && license && description)}
        type="submit">Publish</button>
    </div>
  </div>

  <input
    class="input"
    type="hidden"
    name="tags"
    bind:value={tags} />
</form>

<style lang="scss">
  .description {
    resize: none;
    height: 210px;
  }
</style>
