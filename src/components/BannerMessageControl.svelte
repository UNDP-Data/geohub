<script lang="ts">
  import Badge from '@smui-extra/badge'
  import Banner, { Label as LabelBanner } from '@smui/banner'
  import Button, { Label as LabelButton } from '@smui/button'
  import Fa from 'svelte-fa'
  import { faCircleInfo } from '@fortawesome/free-solid-svg-icons/faCircleInfo'
  import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'

  import { StatusTypes } from '$lib/constants'
  import { bannerMessages } from '$stores'
  import type { BannerMessage } from '$lib/types'

  $: showBanner = $bannerMessages.length > 0 ? true : false
  let currentBannerMessage: BannerMessage
  let position: 'inset' | 'middle' | 'outset' = 'middle'
  let align: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' = 'top-end'

  // show banner when content store available
  $: {
    if (showBanner === true && !currentBannerMessage) {
      currentBannerMessage = $bannerMessages.shift()
    }
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

{#if currentBannerMessage}
  <Banner bind:open={showBanner} fixed mobileStacked content$style={`max-width: max-content; height:`}>
    <LabelBanner
      slot="label"
      style="font-family: ProximaNova, sans-serif; font-size: 13px; max-width: 600px; min-height: 60px;">
      <div class="banner-container">
        <div class="icon">
          {#if currentBannerMessage.type === StatusTypes.INFO}
            <Fa icon={faCircleInfo} size="2x" primaryColor="hsl(204, 86%, 53%)" />
          {:else if currentBannerMessage.type === StatusTypes.DANGER}
            <Fa icon={faBan} size="2x" primaryColor="hsl(348, 100%, 61%)" />
          {/if}
        </div>
        <div class="content">
          <div class="subtitle">{currentBannerMessage.title}</div>
          <div class="message">{currentBannerMessage.message}</div>
        </div>
      </div>
    </LabelBanner>
    <Button slot="actions" on:click={() => showNextBanner()}>
      <LabelButton>Dismiss</LabelButton>
      {#if $bannerMessages.length > 0}
        <Badge {position} {align} aria-label="unread message count">{$bannerMessages.length}</Badge>
      {/if}
    </Button>
  </Banner>
{/if}

<style lang="scss">
  .banner-container {
    align-items: center;
    display: flex;
    gap: 20px;
    justify-content: left;
    margin-bottom: 20px;

    .content {
      .subtitle {
        margin: 0;
        margin-bottom: 10px;

        @media (prefers-color-scheme: dark) {
          color: white;
        }
      }

      .message {
        background: #fff;

        @media (prefers-color-scheme: dark) {
          background: #212125;
          color: white;
        }
      }
    }
  }
</style>
