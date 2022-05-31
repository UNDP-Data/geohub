<script lang="ts">
  import Banner, { Label as LabelBanner } from '@smui/banner'
  import Button from '@smui/button'
  import Fa from 'svelte-fa'
  import { faCircleInfo } from '@fortawesome/free-solid-svg-icons/faCircleInfo'
  import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'

  import { StatusTypes } from '$lib/constants'
  import { bannerMessages } from '$stores'

  let showBanner = false

  // show banner when content store available
  $: {
    if ($bannerMessages.length > 0) {
      showBanner = false
      setTimeout(() => {
        showBanner = true
      }, 500)
    }
  }

  const hideBanner = () => {
    setTimeout(() => {
      showBanner = false
    }, 150)
    $bannerMessages = []
  }
</script>

<!--<Banner bind:open={showBanner} fixed mobileStacked content$style={`max-width: max-content; height:`}>-->
<!--  <LabelBanner-->
<!--    slot="label"-->
<!--    style="font-family: ProximaNova, sans-serif; font-size: 13px; max-width: 600px; min-height: 60px;">-->
<!--    {#each $bannerMessages as row}-->
<!--      <div class="banner-container">-->
<!--        <div class="icon">-->
<!--          {#if row.type === StatusTypes.INFO}-->
<!--            <Fa icon={faCircleInfo} size="2x" primaryColor="hsl(204, 86%, 53%)" />-->
<!--          {:else if row.type === StatusTypes.DANGER}-->
<!--            <Fa icon={faBan} size="2x" primaryColor="hsl(348, 100%, 61%)" />-->
<!--          {/if}-->
<!--        </div>-->
<!--        <div class="content">-->
<!--          <div class="subtitle">{row.title}</div>-->
<!--          <div class="message">{row.message}</div>-->
<!--        </div>-->
<!--      </div>-->
<!--    {/each}-->
<!--  </LabelBanner>-->
<!--  <Button slot="actions" on:click={() => hideBanner()}>Dismiss</Button>-->

<!--</Banner>-->
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
