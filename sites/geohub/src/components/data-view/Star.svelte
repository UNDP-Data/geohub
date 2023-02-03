<script lang="ts">
  import { StatusTypes } from '$lib/constants'
  import type { BannerMessage } from '$lib/types'
  import { bannerMessages, indicatorProgress } from '$stores'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let dataset_id: string
  export let isStar

  const updateStar = async (method: 'POST' | 'DELETE') => {
    $indicatorProgress = true
    try {
      await fetch(`/api/datasets/${dataset_id}/star`, {
        method: method,
      })
    } catch (err) {
      const bannerErrorMessage: BannerMessage = {
        type: StatusTypes.WARNING,
        title: 'Whoops! Something went wrong.',
        message: err.message,
        error: err,
      }
      bannerMessages.update((data) => [...data, bannerErrorMessage])
      throw err
    } finally {
      $indicatorProgress = false
    }
  }

  const handleClicked = async () => {
    if (isStar) {
      // delete star
      await updateStar('DELETE')
      dispatch('starDeleted', {
        dataset_id: dataset_id,
      })
    } else {
      // add star
      await updateStar('POST')
    }
    isStar = !isStar
  }
  const handleEnterKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      e.target.click()
    }
  }
</script>

<span
  class="star icon has-tooltip-arrow has-tooltip-left"
  data-tooltip={isStar ? 'Remove from favourite' : 'Add to favourite'}
  on:click={handleClicked}
  on:keydown={handleEnterKey}>
  {#if isStar}
    <i
      class="fa-solid fa-star fa-xl"
      style="color:#fccf03" />
  {:else}
    <i class="fa-regular fa-star fa-xl" />
  {/if}
</span>

<style lang="scss">
  .star {
    cursor: pointer;
  }
</style>
