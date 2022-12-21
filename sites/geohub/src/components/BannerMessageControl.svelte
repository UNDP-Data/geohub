<script lang="ts">
  import { StatusTypes } from '$lib/constants'
  import { bannerMessages } from '$stores'
  import type { BannerMessage } from '$lib/types'

  import Split from '@geoffcox/svelte-splitter/src/Split.svelte'

  let bannerHeight = 60
  $: showBanner = $bannerMessages.length > 0 ? true : false
  let currentBannerMessage: BannerMessage
  let errorMessage: string
  let showDetailedError = false

  // show banner when content store available
  $: {
    if (showBanner === true && !currentBannerMessage) {
      currentBannerMessage = $bannerMessages.shift()
    }
  }

  $: if (currentBannerMessage?.error) {
    errorMessage = currentBannerMessage.error.message
  }

  const showNextBanner = () => {
    if ($bannerMessages.length === 0) {
      hideBanner()
    } else {
      currentBannerMessage = $bannerMessages.shift()
    }
  }

  const hideBanner = () => {
    setTimeout(() => {
      showBanner = false
    }, 150)
    $bannerMessages = []
    currentBannerMessage = undefined
  }
</script>

<Split
  horizontal
  initialPrimarySize={showBanner ? `${bannerHeight}px` : '0px'}
  splitterSize="0px">
  <div
    slot="primary"
    class="banner-container">
    {#if currentBannerMessage}
      <div class="tile p-0 m-0">
        <div class="tile is-child is-1 pt-2 pl-4 m-0">
          {#if currentBannerMessage.type === StatusTypes.INFO}
            <i
              class="fa-solid fa-circle-info fa-2xl"
              style="color:hsl(204, 86%, 53%);" />
          {:else if currentBannerMessage.type === StatusTypes.DANGER}
            <i
              class="fa-solid fa-ban fa-2xl"
              style="color:hsl(348, 100%, 61%);" />
          {:else if currentBannerMessage.type === StatusTypes.WARNING}
            <i
              class="fa-solid fa-triangle-exclamation fa-2xl"
              style="color:hsl(36, 100%, 50%);" />
          {/if}
        </div>
        <div class="tile py-0 m-0">
          <div class="tile is-vertical message-container">
            <div class="tile">
              <p class="title is-5">{currentBannerMessage.title}</p>
            </div>
            <div class="tile">
              <p class="subtitle is-6">{currentBannerMessage.message}</p>
            </div>
            {#if showDetailedError}
              <div class="tile">
                <p class="subtitle is-6">{errorMessage}</p>
              </div>
            {/if}
          </div>
        </div>

        <div class="tile py-0 pr-2 pt-3 m-0 is-3">
          {#if currentBannerMessage.error}
            <button
              class="button is-warning is-small is-light mr-1"
              on:click={() => (showDetailedError = !showDetailedError)}>
              {showDetailedError ? 'Hide' : 'Details'}
            </button>
          {/if}
          <button
            class="button is-link is-small is-light mr-1"
            on:click={() => showNextBanner()}>
            Dismiss
          </button>
          {#if $bannerMessages.length > 0}
            <button
              class="button is-link is-small is-light mr-1"
              on:click={() => hideBanner()}>
              Dismiss all
            </button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
  <div slot="secondary">
    <slot />
  </div>
</Split>

<style lang="scss">
  .banner-container {
    justify-content: left;
    margin-top: 10px;

    .message-container {
      height: 55px;
      overflow-y: auto;
    }
  }
</style>
