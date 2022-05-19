<script lang="ts">
  import { slide } from 'svelte/transition'
  import Card, { PrimaryAction } from '@smui/card'
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
  import IconOffset from '$components/controls/vector-styles/IconOffset.svelte'
  import IconOverlap from '$components/controls/vector-styles/IconOverlap.svelte'
  import IconSize from '$components/controls/vector-styles/IconSize.svelte'
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

  let isLegendSwitchAnimate = false
  let isAdvancedSettings = false
  let iconOffSetValueEdited = false

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

  const handleIconOffset = () => {
    iconOffSetValueEdited = true
  }

  $: {
    if (isAdvancedSettings === false && iconOffSetValueEdited) {
      $map.setLayoutProperty(layerId, 'icon-offset', [0, 0])
    }
  }
</script>

{#if isLegendPanelVisible === true}
  <div class="vector-legend-panel-container" data-testid="vector-legend-panel-container">
    {#if style.type === LayerTypes.LINE}
      <div class="columns first-row">
        <div class="column line-color">
          <div class="is-flex is-justify-content-center">Line Color</div>
          <div class="is-flex is-justify-content-center">
            <LineColor {layer} />
          </div>
        </div>
      </div>
      <div class="columns first-row">
        <div class="column line-width">
          <div class="is-flex is-justify-content-center">Line Width</div>
          <div class="is-flex is-justify-content-center">
            <LineWidth {layer} />
          </div>
        </div>
        <div class="column line-blur">
          <div class="is-flex is-justify-content-center">Line Blur</div>
          <div class="is-flex is-justify-content-center">
            <LineBlur {layer} />
          </div>
        </div>
      </div>
      <div class="columns first-row">
        <div class="column line-dash">
          <div class="is-flex is-justify-content-center">Line Dash</div>
          <div class="is-flex is-justify-content-center">
            <LineDasharray {layer} />
          </div>
        </div>
        <div class="column line-join">
          <div class="is-flex is-justify-content-center">Line Join</div>
          <div class="is-flex is-justify-content-center">
            <LineJoin {layer} />
          </div>
        </div>
      </div>
    {:else if style.type === LayerTypes.FILL}
      <div class="columns first-row">
        <div class="column fill-color" style="padding-left: 50px;">
          <div class="is-flex is-justify-content-center">Fill Color</div>
          <div class="is-flex is-justify-content-center" style="z-index: 10; position: relative;">
            <FillColor {layer} />
          </div>
        </div>
        <div class="column fill-outline-color" style="padding-right: 50px;">
          <div class="is-flex is-justify-content-center">Fill Outline Color</div>
          <div class="is-flex is-justify-content-center" style="z-index: 1; position: relative;">
            <FillOutlineColor {layer} />
          </div>
        </div>
      </div>
    {:else if style.type === LayerTypes.SYMBOL}
      <div class="columns first-row">
        <div class="column is-4 icon-image">
          <div class="is-flex is-justify-content-center">Icon</div>
          <div class="is-flex is-justify-content-center" style="z-index: 10; position: relative;">
            <IconImage {layer} />
          </div>
        </div>
        <div class="column is-4">
          <div class="is-flex is-justify-content-center">Size</div>
          <div class="is-flex is-justify-content-center" style="z-index: 1; position: relative;">
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
            <Tooltip showDelay={500} hideDelay={0} yPos="above">Toggle Legend Type</Tooltip>
          </Wrapper>
        </div>
      </div>

      <div class="is-divider separator" />

      <div class="columns second-row">
        <div class="column is-4 color">
          <div class="is-flex is-justify-content-center">Color</div>
          <div class="is-flex is-justify-content-center" style="z-index: 10; position: relative;">
            <IconColor {layer} />
          </div>
        </div>
        <div class="column overlap-priority">
          <div class="is-flex is-justify-content-center">Overlap Priority</div>
          <div class="is-flex is-justify-content-center" style="z-index: 1; position: relative;">
            <IconOverlap {layer} />
          </div>
        </div>
      </div>

      <div class="columns third-row advanced-settings">
        <div class="column">
          <div class="field">
            <input
              id="switchAdvancedSettings"
              type="checkbox"
              name="switchSmall"
              class="switch is-small is-rounded is-info"
              bind:checked={isAdvancedSettings} />
            <label for="switchAdvancedSettings" class="is-size-6">Advanced Settings</label>
          </div>
        </div>
      </div>

      {#if isAdvancedSettings}
        <div class="columns forth-row" transition:slide={{ duration: 750 }}>
          <div class="column">
            <IconOffset {layer} on:change={handleIconOffset} />
          </div>
        </div>
      {/if}
    {:else if style.type === LayerTypes.HEATMAP}
      <div class="columns first-row">
        <div class="column heat-map-color">
          <div class="is-flex is-justify-content-center">Heatmap Color</div>
          <div>
            <HeatmapColor {layer} />
          </div>
        </div>
        <div class="column">
          <div class="columns first-row">
            <div class="column" style="padding-bottom: 3px;">
              <div class="is-flex is-justify-content-center">Heatmap Intensity</div>
              <div class="is-flex is-justify-content-center">
                <HeatmapIntensity {layer} />
              </div>
            </div>
          </div>
          <div class="columns first-row">
            <div class="column" style="padding-bottom: 3px;">
              <div class="is-flex is-justify-content-center">Heatmap Radius</div>
              <div class="is-flex is-justify-content-center">
                <HeatmapRadius {layer} />
              </div>
            </div>
          </div>
          <div class="columns first-row">
            <div class="column"  style="padding-bottom: 3px;">
              <div class="is-flex is-justify-content-center">Heatmap Weight</div>
              <div class="is-flex is-justify-content-center">
                <HeatmapWeight {layer} />
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style lang="scss">
  @import '../../styles/bulma-switch.min.css';
  @import '../../styles/bulma-divider.min.css';

  .vector-legend-panel-container {
    margin-bottom: 15px;

    .first-row {
      margin-bottom: 0;

      .heat-map-color,
      .line-color,
      .line-dash,
      .line-join,
      .icon-image,
      .fill-color,
      .fill-outline-color {
        div:first-child {
          margin-bottom: 10px;
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

    .separator {
      margin-top: 0;
      margin-bottom: 25px;
    }

    .second-row {
      margin-top: -20px;
      margin-bottom: 0;

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

    .third-row {
      padding-left: 25px;

      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    .forth-row {
      border: 1px solid #ccc;
      margin-left: 25px;
      margin-right: 25px;

      div:first-child {
        padding: 0;
        padding-top: 5px;
      }
    }
  }
</style>
