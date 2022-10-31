<script lang="ts">
  import Fa from 'svelte-fa'
  import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'

  export let isSuccess = false
</script>

{#if isSuccess === true}
  <span class="tag is-success is-small">
    <Fa
      icon={faCheck}
      size="sm" />
  </span>
{/if}

<style lang="scss">
</style>
