<script lang="ts">
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import { faRetweet } from '@fortawesome/free-solid-svg-icons/faRetweet'

  import FillColor from '$components/controls/vector-styles/FillColor.svelte'
  import FillOutlineColor from '$components/controls/vector-styles/FillOutlineColor.svelte'
  import HeatmapColor from '$components/controls/vector-styles/HeatmapColor.svelte'
  import HeatmapIntensity from '$components/controls/vector-styles/HeatmapIntensity.svelte'
  import HeatmapRadius from '$components/controls/vector-styles/HeatmapRadius.svelte'
  import HeatmapWeight from '$components/controls/vector-styles/HeatmapWeight.svelte'
  import IconColor from '$components/controls/vector-styles/IconColor.svelte'
  import IconImage from '$components/controls/vector-styles/IconImage.svelte'
  import IconSize from '$components/controls/vector-styles/IconSize.svelte'
  import IconOverlap from '$components/controls/vector-styles/IconOverlap.svelte'
  import LineBlur from '$components/controls/vector-styles/LineBlur.svelte'
  import LineColor from '$components/controls/vector-styles/LineColor.svelte'
  import LineDasharray from '$components/controls/vector-styles/LineDasharray.svelte'
  import LineJoin from '$components/controls/vector-styles/LineJoin.svelte'
  import LineWidth from '$components/controls/vector-styles/LineWidth.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { map } from '$stores'

  export let isLegendPanelVisible = false
  export let layer: Layer = LayerInitialValues
  const layerId = layer.definition.id
  const style: LayerSpecification = $map
    .getStyle()
    .layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  const handleLegendToggleClick = () => {
    isLegendSwitchAnimate = true

    setTimeout(() => {
      isLegendSwitchAnimate = false
    }, 400)
  }

  let isLegendSwitchAnimate = false

  import Card, { PrimaryAction } from '@smui/card'
</script>

{#if isLegendPanelVisible === true}
  <div class="action" data-testid="vector-legend-panel-container">
    {#if style.type === LayerTypes.LINE}
      <LineWidth {layer} />
      <LineBlur {layer} />
      <LineColor {layer} />
      <LineDasharray {layer} />
      <LineJoin {layer} />
    {:else if style.type === LayerTypes.FILL}
      <FillColor {layer} />
      <FillOutlineColor {layer} />
    {:else if style.type === LayerTypes.SYMBOL}
      <div class="columns first-row">
        <div class="column is-4 icon-image">
          <div class="is-flex is-justify-content-center">Icon</div>
          <div class="is-flex is-justify-content-center">
            <IconImage {layer} />
          </div>
        </div>
        <div class="column is-4">
          <div class="is-flex is-justify-content-center">Size</div>
          <div class="is-flex is-justify-content-center">
            <IconSize {layer} />
          </div>
        </div>
        <div class="columm is-4 legend-toggle">
          <Wrapper>
            <div class="toggle-container" on:click={handleLegendToggleClick} data-testid="legend-toggle-container">
              <Card>
                <PrimaryAction style="padding: 10px;">
                  <Fa icon={faRetweet} style="font-size: 16px;" spin={isLegendSwitchAnimate} />
                </PrimaryAction>
              </Card>
            </div>
            <Tooltip showDelay={1000} hideDelay={0} yPos="above">Toggle Legend Type</Tooltip>
          </Wrapper>
        </div>
      </div>

      <div class="columns separator">
        <div class="column" />
      </div>

      <div class="columns second-row">
        <div class="column is-4 color">
          <div class="is-flex is-justify-content-center ">Color</div>
          <div class="is-flex is-justify-content-center">
            <IconColor {layer} />
          </div>
        </div>
        <div class="column overlap-priority">
          <div class="is-flex is-justify-content-center">Overlap Priority</div>
          <div class="is-flex is-justify-content-center">
            <IconOverlap {layer} />
          </div>
        </div>
      </div>
    {:else if style.type === LayerTypes.HEATMAP}
      <HeatmapColor {layer} />
      <HeatmapIntensity {layer} />
      <HeatmapRadius {layer} />
      <HeatmapWeight {layer} />
    {/if}
  </div>
{/if}

<style lang="scss">
  .first-row {
    margin-bottom: 0;

    .icon-image {
      div:first-child {
        margin-bottom: 5px;
      }

      div:second-child {
        height: 30px;
      }
    }

    .legend-toggle {
      padding-left: 25px;
      padding-top: 25px;

      .toggle-container {
        margin-left: 3.5px;
      }
    }
  }

  $separator: 1px solid whitesmoke;
  $separator-dark: 1px solid #ccc;

  .separator {
    margin-bottom: 0;
    padding-bottom: 0;
    padding-left: 30px;
    padding-right: 30px;
    padding-top: 5px;

    .column {
      border-top: $separator;

      @media (prefers-color-scheme: dark) {
        border-top: $separator-dark;
      }
    }
  }

  .second-row {
    margin-top: -20px;

    .color {
      div:first-child {
        margin-bottom: 5px;
      }
    }

    .overlap-priority {
      div:first-child {
        margin: 0;
      }

      div {
        padding-right: 30px;
      }
    }
  }
</style>
