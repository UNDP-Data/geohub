<script lang="ts">
  import Badge from '@smui-extra/badge'
  import Banner, { Label as LabelBanner } from '@smui/banner'
  import Button, { Label as LabelButton } from '@smui/button'
  import Paper, { Title, Subtitle, Content } from '@smui/paper'
  import Fa from 'svelte-fa'
  import { faCircleInfo } from '@fortawesome/free-solid-svg-icons/faCircleInfo'
  import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'
  import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons/faTriangleExclamation'

  import { StatusTypes } from '$lib/constants'
  import { bannerMessages } from '$stores'
  import type { BannerMessage } from '$lib/types'

  $: showBanner = $bannerMessages.length > 0 ? true : false
  let currentBannerMessage: BannerMessage
  let position: 'inset' | 'middle' | 'outset' = 'middle'
  let align: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' = 'top-end'
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

{#if currentBannerMessage}
  <Banner
    bind:open={showBanner}
    fixed
    mobileStacked
    content$style={`max-width: 100%; height:max-content; padding-right: 20px;`}>
    <LabelBanner
      slot="label"
      style="font-family: ProximaNova, sans-serif; font-size: 13px;">
      <div class="banner-container columns">
        <div class="icon column is-1">
          {#if currentBannerMessage.type === StatusTypes.INFO}
            <Fa
              icon={faCircleInfo}
              size="2x"
              primaryColor="hsl(204, 86%, 53%)" />
          {:else if currentBannerMessage.type === StatusTypes.DANGER}
            <Fa
              icon={faBan}
              size="2x"
              primaryColor="hsl(348, 100%, 61%)" />
          {:else if currentBannerMessage.type === StatusTypes.WARNING}
            <Fa
              icon={faTriangleExclamation}
              size="2x"
              primaryColor="hsl(36, 100%, 50%)" />
          {/if}
        </div>
        <div class="content column is-half">
          <Paper variant="unelevated">
            <Title>{currentBannerMessage.title}</Title>
            <Subtitle>{currentBannerMessage.message}</Subtitle>
            <Content>
              {#if showDetailedError}
                {errorMessage}
              {/if}
            </Content>
          </Paper>
        </div>
        <div class="column is-1">
          {#if currentBannerMessage.error}
            <Button
              slot="actions"
              on:click={() => (showDetailedError = !showDetailedError)}>
              <LabelButton>{showDetailedError ? 'Hide' : 'Details'}</LabelButton>
            </Button>
          {/if}
        </div>
        <div class="column is-1">
          <Button
            slot="actions"
            on:click={() => showNextBanner()}>
            <LabelButton>Dismiss</LabelButton>
            {#if $bannerMessages.length > 0}
              <Badge
                {position}
                {align}
                aria-label="unread message count">{$bannerMessages.length}</Badge>
            {/if}
          </Button>
        </div>
        {#if $bannerMessages.length > 1}
          <div class="column is-2">
            <Button
              slot="actions"
              on:click={() => hideBanner()}>
              <LabelButton>Dismiss all</LabelButton>
            </Button>
          </div>
        {/if}
      </div>
    </LabelBanner>
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

      .error-message {
        background: #fff;

        @media (prefers-color-scheme: dark) {
          background: #212125;
          color: white;
        }
      }
    }
  }
</style>
