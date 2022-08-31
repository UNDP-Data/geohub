<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Card, { Content as ContentCard, PrimaryAction } from '@smui/card'
  import { fade } from 'svelte/transition'
  import Popper from '$lib/popper'
  import type { Bucket } from '$lib/types'
  import '../styles/font-awesome/all.css'
  import Keydown from 'svelte-keydown'
  export let bucket: Bucket

  let showTooltip = false
  let timer: ReturnType<typeof setTimeout>
  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper({
    placement: 'right-start',
    strategy: 'fixed',
  }).init()
  const dispatch = createEventDispatcher()

  const handleBucketClick = () => {
    handleMouseLeave()
    dispatch('click', { bucket })
  }

  const handleMouseEnter = () => {
    timer = setTimeout(() => {
      showTooltip = true
    }, 400)
  }

  const handleMouseLeave = () => {
    if (timer) clearTimeout(timer)
    showTooltip = false
  }

  const handleFocusIn = () => {
    //console.log(`bucket ${bucket.label} got focus`)
    handleMouseEnter()
  }
  const handleFocusOut = () => {
    //console.log(`bucket ${bucket.label} got focus`)
    handleMouseLeave()
  }
  const handleKP = (e) => {
    if (e.keyCode == 13) {
      //console.log(`bucket ${bucket.label} GOT ENTER`)
      handleMouseLeave()
      handleBucketClick()
    }
  }
</script>

<div
  class="card-container"
  data-testid="card-container"
  use:popperRef
  on:click={() => handleBucketClick()}
  on:mouseenter={() => handleMouseEnter()}
  on:mouseleave={() => handleMouseLeave()}
  on:focusin={() => handleFocusIn()}
  on:focusout={() => handleFocusOut()}
  on:keydown={handleKP}>
  <Card>
    <PrimaryAction on:click={() => undefined}>
      <div class="icon-container">
        <ContentCard style={`${bucket.selected === true ? 'opacity: 0.2' : ''}`}>
          <i class={`icon ${bucket.icon.replace('fa-duotone', 'fa-solid')} fa-xl`} aria-label={bucket.label} />
        </ContentCard>
      </div>
    </PrimaryAction>
  </Card>
</div>

{#if showTooltip}
  <div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
    <div class="columns is-vcentered is-mobile">
      <div class="column is-full">
        <div class="title is-size-5">
          {bucket.label}
        </div>
        <div class="subtitle is-size-6">
          {bucket.description}
        </div>
      </div>
    </div>
    <div class="content is-size-7 tags">
      {#each bucket.tags as tag}
        <span title="tag" style="margin-right: 5px;">
          <span class="tag is-info is-small is-light">{tag}</span>
        </span>
      {/each}
    </div>
    <div id="arrow" data-popper-arrow />
  </div>
{/if}

<style lang="scss">
  @import '../styles/popper.scss';

  .card-container {
    height: 65px;
    margin: 0;
    padding-bottom: 0px;
    padding-top: 0px;
    padding: 10px;
    width: 70px;

    .card {
      margin-bottom: 15px;
      margin-left: 15px;
    }

    .icon-container {
      @media (prefers-color-scheme: dark) {
        border-radius: 7.5px;
        border: 1px solid #ccc;
      }

      .icon {
        color: #000;

        @media (prefers-color-scheme: dark) {
          color: #ccc;
        }
      }
    }
  }

  #tooltip {
    font-weight: bold;

    .columns {
      .is-full {
        padding-right: 40px;

        .title,
        .subtitle,
        .content {
          color: #000;

          @media (prefers-color-scheme: dark) {
            color: #fff;
          }
        }
      }
    }

    .content {
      .tags {
        display: flex;
        gap: 5px;
        flex-flow: row wrap;
      }
    }

    #arrow,
    #arrow::before {
      background: #fff;
      height: 8px;
      left: -2.5px;
      position: absolute;
      width: 8px;

      @media (prefers-color-scheme: dark) {
        background: #212125;
      }
    }
  }
</style>
