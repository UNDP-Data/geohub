<script lang="ts">
  import { page } from '$app/stores'
  import { StatusTypes } from '$lib/constants'
  import type { BannerMessage } from '$lib/types'
  import { bannerMessages, indicatorProgress } from '$stores'
  import { createEventDispatcher, onMount } from 'svelte'
  import millify from 'millify'

  const dispatch = createEventDispatcher()

  export let dataset_id: string
  export let isStar
  let no_stars = 0

  const updateStar = async (method: 'POST' | 'DELETE') => {
    $indicatorProgress = true
    try {
      const res = await fetch(`/api/datasets/${dataset_id}/star`, {
        method: method,
      })
      const json = await res.json()
      no_stars = json.no_stars
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

  const getStarCount = async () => {
    const res = await fetch(`/api/datasets/${dataset_id}/star/count`)
    const json = await res.json()
    no_stars = json.no_stars
    return no_stars
  }

  const starLoading = getStarCount()
</script>

{#if $page.data.session}
  <button
    class="button is-small"
    on:click={handleClicked}
    on:keydown={handleEnterKey}
    disabled={$indicatorProgress}>
    <span class="icon">
      {#if isStar}
        <i
          class="fa-solid fa-star fa-lg"
          style="color:#fccf03" />
      {:else}
        <i class="fa-regular fa-star fa-lg" />
      {/if}
    </span>
    <span>
      {#if isStar}
        Starred
      {:else}
        Star
      {/if}
      {#await starLoading then}
        <div class="Counter">{millify(no_stars)}</div>
      {/await}
    </span>
  </button>
{:else}
  <button
    class="button is-small"
    disabled>
    <span class="icon">
      <i
        class="fa-solid fa-star fa-lg"
        style="color:#fccf03" />
    </span>
    <span class="star-container-no-login">
      Star
      {#await starLoading then}
        <div class="Counter">{millify(no_stars)}</div>
      {/await}
    </span>
  </button>
{/if}

<style lang="scss">
  .Counter {
    background-color: #1b1f2413;
    border-radius: 2em;
    display: inline-block;
    font-size: 12px;
    font-weight: 500;
    line-height: calc(20px - 1px * 2);
    min-width: 20px;
    padding: 0 6px;
    text-align: center;
  }
</style>
