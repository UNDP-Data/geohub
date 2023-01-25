<script lang="ts">
  import { AccessLevel } from '$lib/constants'

  export let accessLevel: AccessLevel
</script>

<div class="field has-addons">
  <p class="control">
    <button
      class="button is-normal {`${
        accessLevel === AccessLevel.PRIVATE ? 'is-primary is-active' : 'is-primary is-light'
      }`}"
      on:click={() => (accessLevel = AccessLevel.PRIVATE)}>
      <span>
        <i class="fa-solid fa-user-lock" />
        Me
      </span>
    </button>
  </p>
  <p class="control">
    <button
      class="button is-normal {`${
        accessLevel === AccessLevel.ORGANIZATION ? 'is-primary is-active' : 'is-primary is-light'
      }`}"
      on:click={() => (accessLevel = AccessLevel.ORGANIZATION)}>
      <span>
        <i class="fa-solid fa-building-lock" />
        UNDP
      </span>
    </button>
  </p>
  <p class="control">
    <button
      class="button is-normal {`${
        accessLevel === AccessLevel.PUBLIC ? 'is-primary is-active' : 'is-primary is-light'
      }`}"
      on:click={() => (accessLevel = AccessLevel.PUBLIC)}>
      <span>
        <i class="fa-solid fa-lock-open" />
        Public
      </span>
    </button>
  </p>
</div>
