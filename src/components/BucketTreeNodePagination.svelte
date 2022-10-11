<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Fa from 'svelte-fa'
  import { faForward } from '@fortawesome/free-solid-svg-icons/faForward'
  import { faBackward } from '@fortawesome/free-solid-svg-icons/faBackward'

  import { STAC_PAGINATION_PREV, STAC_PAGINATION_NEXT } from '$lib/constants'

  const dispatch = createEventDispatcher()

  export let disabledPrev = false
  export let disabledNext = false

  const handlePagination = (action: 'prev' | 'next') => {
    dispatch('pagination', {
      action,
    })
  }
</script>

<div class="columns pl-4 pb-2 pt-2">
  <div class="column is-flex is-flex-direction-row">
    <div
      on:click={() => handlePagination(STAC_PAGINATION_PREV)}
      class={`pr-3 ${disabledPrev ? 'disabled' : 'is-clickable'}`}
      alt="Previous layers"
      title="Previous layers">
      <Fa icon={faBackward} size="sm" />
    </div>
    &nbsp;
    <div
      on:click={() => handlePagination(STAC_PAGINATION_NEXT)}
      class={`${disabledNext ? 'disabled' : 'is-clickable'}`}
      alt="Next layers"
      title="Next layers">
      <Fa icon={faForward} size="sm" />
    </div>
  </div>
</div>

<style lang="scss">
  .disabled {
    cursor: default;
    opacity: 0.15;
  }
</style>
