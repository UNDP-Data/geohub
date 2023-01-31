<script lang="ts">
  import { page } from '$app/stores'
  import { AccessLevel } from '$lib/constants'

  export let accessLevel: AccessLevel

  let userName: string = $page.data.session?.user.name
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
        <b>{userName?.split(' ')[0] ?? 'me'}</b>
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
        <b>UNDP</b>
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
        <b>Public</b>
      </span>
    </button>
  </p>
</div>
