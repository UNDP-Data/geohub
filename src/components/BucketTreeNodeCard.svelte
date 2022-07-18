<!-- 
How to use this component in the parent component

<script lang="ts">
import Popper from '$lib/popper'
const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
} = new Popper(
    {
        placement: 'auto',
        strategy: 'fixed',
    },
    [0, -20],
).init()

// Please refer to BucketTreeNode about how to open a tooltip

</script>  

{#if layerInfoMetadata?.visible}
<div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
<BucketTreeNodeCard bind:layerInfoMetadata bind:node/>
<div id="arrow" data-popper-arrow />
</div>
{/if}

<style lang="scss">
    #tooltip {
    max-width: 450px; # change the value which you want
}
</style>
-->
<script lang="ts">
  import type { LayerInfoMetadata, TreeNode } from '$lib/types'
  import { clean } from '$lib/helper'

  export let layerInfoMetadata: LayerInfoMetadata = undefined
  export let node: TreeNode
</script>

<div class="bucket-card">
  <div class="columns is-vcentered is-mobile">
    <div class="column is-full">
      <div class="label">{clean(node.label)}</div>
      <div class="description">{layerInfoMetadata?.description}</div>
      <div class="source is-size-6">
        <span class="has-text-weight-bold">Source: </span>{layerInfoMetadata?.source ? layerInfoMetadata.source : 'N/A'}
      </div>
      {#if layerInfoMetadata?.unit}
        <div class="unit is-size-6">
          <span class="has-text-weight-bold">Unit: </span>{layerInfoMetadata?.unit ? layerInfoMetadata.unit : 'N/A'}
        </div>
      {/if}

      <div class="content is-size-7 tags pt-3">
        {#if node.tags}
          {#each Object.values(node.tags) as tag}
            <span title="tag" style="margin-right: 5px; font-weight: bold;">
              <span class="tag is-info is-small is-light">{clean(tag)}</span>
            </span>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .bucket-card {
    text-align: justify;
    text-justify: inter-word;
    word-wrap: break-word;

    .columns {
      z-index: 10;
      position: relative;

      .is-full {
        .description,
        .source,
        .unit {
          font-weight: normal;
          color: #000;
          margin-bottom: 10px;

          @media (prefers-color-scheme: dark) {
            color: #fff;
          }
        }

        .label {
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
          margin-bottom: 10px;

          @media (prefers-color-scheme: dark) {
            color: #fff;
          }
        }

        .description {
          margin-bottom: 15px;
        }
      }
    }
  }
</style>
