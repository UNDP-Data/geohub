<script lang="ts">
  import Card, { Content as ContentCard, PrimaryAction } from '@smui/card'
  import Tag from 'svelma/src/components/Tag/Tag.svelte'
  import { fade } from 'svelte/transition'
  import { createPopperActions } from 'svelte-popperjs'

  import type { Bucket } from '$lib/types'

  export let bucket: Bucket
  let showTooltip = false

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
</script>

<div
  class="card-container"
  use:popperRef
  on:mouseenter={() => (showTooltip = true)}
  on:mouseleave={() => (showTooltip = false)}>
  <Card>
    <PrimaryAction on:click={() => undefined}>
      <ContentCard>
        <i class={`${bucket.icon.replace('fa-duotone', 'fa-solid')} fa-xl`} />
      </ContentCard>
    </PrimaryAction>
  </Card>
</div>

{#if showTooltip}
  <div id="tooltip" use:popperContent={popperOptions} transition:fade>
    <div class="columns is-vcentered is-mobile">
      <div class="column is-full">
        <div class="title is-size-5" style="color: black;">
          {bucket.label}
        </div>
        <div class="subtitle is-size-6" style="color: black;">
          {bucket.description}
        </div>
      </div>
    </div>
    <div class="content is-size-7 tags">
      {#each bucket.tags as tag}
        <Tag type="is-info is-light" size="is-small">{tag}</Tag>
      {/each}
    </div>
    <div id="arrow" data-popper-arrow />
  </div>
{/if}

<style lang="scss">
  .card-container {
    height: 65px;
    margin: 0;
    padding: 10px;
    padding-bottom: 0px;
    padding-top: 0px;
    width: 70px;

    .card {
      margin-bottom: 15px;
      margin-left: 15px;
    }
  }

  #tooltip {
    background: white;
    border-radius: 7.5px;
    border: 1px solid #ccc;
    font-size: 13px;
    font-weight: bold;
    max-width: 250px;
    padding: 10px;
    position: relative;

    .columns {
      .is-full {
        padding-right: 40px;

        .title,
        .subtitle,
        .content {
          @media (prefers-color-scheme: dark) {
            color: white;
          }
        }
      }
    }

    .content .tags {
      display: flex;
      gap: 5px;
      flex-flow: row wrap;
    }

    #arrow,
    #arrow::before {
      position: absolute;
      width: 8px;
      height: 8px;
      background: white;
      left: -2.5px;
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
