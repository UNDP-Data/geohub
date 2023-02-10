<script lang="ts">
  import Tags from '$components/data-upload/Tags.svelte'
  import SdgPicker from '$components/data-upload/SdgPicker.svelte'

  let name = ''
  let description = ''
  let attribution = ''
  let license = ''

  let licenses = [
    'Open Data Commons Open Database License (ODbL)',
    'Creative Commons Zero 1.0 Universal',
    'Creative Commons BY 4.0',
    'Creative Commons BY ShareAlike 4.0',
    'Creative Commons BY NoDerivs 4.0',
    'Creative Commons BY NonCommercial 4.0',
    'Creative Commons BY NonCommercial ShareAlike 4.0',
    'Creative Commons BY NonCommercial NoDerivs 4.0',
  ]
</script>

<p class="title is-4">Publish data to GeoHub</p>
<form>
  <div class="field is-grouped py-2">
    <div class="control">
      <button
        class="button is-primary"
        type="submit">Publish</button>
    </div>
  </div>
</form>

<div class="columns">
  <div class="column">
    <div class="field">
      <label class="label">Name</label>
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
      <label class="label">Attribution</label>
      <div class="control has-icons-right">
        <input
          class="input {attribution.length > 0 ? 'is-success' : 'is-danger'}"
          type="text"
          name="attribution"
          placeholder="Type attribution of dataset"
          bind:value={attribution} />
        {#if attribution}
          <span class="icon is-small is-right">
            <i class="fas fa-check has-text-success	" />
          </span>
        {/if}
      </div>
    </div>

    <div class="field">
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
  <label class="label">SDGs</label>
  <div class="control">
    <SdgPicker />
  </div>
</div>

<Tags />

<style lang="scss">
  .description {
    height: 210px;
  }
</style>
