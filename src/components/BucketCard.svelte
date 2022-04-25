<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Card, { Content as ContentCard, PrimaryAction } from '@smui/card'
  import Tag from 'svelma/src/components/Tag/Tag.svelte'
  import { fade } from 'svelte/transition'
  import { createPopperActions } from 'svelte-popperjs'

  import type { Bucket } from '$lib/types'

  export let bucket: Bucket

  let showTooltip = false
  let timer: ReturnType<typeof setTimeout>

  const dispatch = createEventDispatcher()

  const [popperRef, popperContent] = createPopperActions({
    placement: 'right-start',
    strategy: 'fixed',
  })

  const popperOptions = {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 4],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          mainAxis: true,
        },
      },
    ],
  }

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
</script>

<div
  class="card-container"
  data-testid="card-container"
  use:popperRef
  on:click={() => handleBucketClick()}
  on:mouseenter={() => handleMouseEnter()}
  on:mouseleave={() => handleMouseLeave()}>
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
          <Tag type="is-info is-light" size="is-small">{tag}</Tag>
        </span>
      {/each}
    </div>
    <div id="arrow" data-popper-arrow />
  </div>
{/if}

<style lang="scss">
  @import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';

  $tooltip-background: #fff;

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
    background: $tooltip-background;
    border-radius: 7.5px;
    border: 1px solid #ccc;
    box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
    font-size: 13px;
    font-weight: bold;
    max-width: 250px;
    padding: 10px;
    position: relative;

    @media (prefers-color-scheme: dark) {
      background: #212125;
    }

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
      position: absolute;
      width: 8px;
      height: 8px;
      background: $tooltip-background;
      left: -2.5px;

      @media (prefers-color-scheme: dark) {
        background: #212125;
      }
    }

    #arrow {
      visibility: visible;
    }

    #arrow::before {
      visibility: visible;
      content: '';
      transform: rotate(45deg);
      border-bottom: 1px solid #ccc;
      border-left: 1px solid #ccc;
    }
  }
</style>
