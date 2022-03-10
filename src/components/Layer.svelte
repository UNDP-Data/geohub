<script lang="ts">
  import FormField from '@smui/form-field'
  import IconButton, { Icon } from '@smui/icon-button'
  import Paper from '@smui/paper'
  import MenuSurface from '@smui/menu-surface'
  import TabBar from '@smui/tab-bar'
  import SegmentedButton, { Segment } from '@smui/segmented-button'

  import { map } from '../stores/mapstore'
  import { layerList } from '../stores/stores'

  export let layerCfg: any
  export let lName = ''
  export let lDef: any = undefined
  export let lType = ''

  ;({ lName, lDef, lType } = layerCfg)
  let surface: any
  let selected: boolean = lDef.layout.visibility === 'visible' ? true : false
  let show = false
  let active = ''
  let disabled = false
  let choices = ['viridis', 'plasma', 'inferno', 'magma', 'cividis']
  let chosen = 'viridis'
  let layerOpacity = 100

  $: visibility = selected ? 'visible' : 'none'

  const srcId = lDef.source
  const lId = lDef.id
  const tabs = ['Colors', 'Symbology', 'Filter']

  const handleChange = () => {
    if (!$map.getLayer(lId)) {
      console.log(`adding ${lId} to map`)
      $map.addLayer(lDef)
    }

    $map.setLayoutProperty(lId, 'visibility', visibility)
  }

  const removeLayer = () => {
    console.log(`removing ${lId}`)
    $map.removeLayer(lId)

    // TODO: remove the layer source as well if none of the layers reference it
    $layerList = $layerList.filter((item) => item.lDef.id != lId)
  }

  const tabExpand = (tabName: string) => {
    if (show) {
      if (active != tabName) {
        active = tabName
      } else {
        show = !show
      }
    } else {
      show = !show
      active = tabName
    }
  }

  const handleUrlChange = (colorMap: any) => {
    console.log(colorMap)
  }

  const setLayerOpacity = () => {
    let lSrc = $map.getSource(srcId)
    let layerList = $map.getStyle().layers

    const layer = layerList.filter((layer: any) => {
      return layer.source === lSrc.id
    })
    console.log(layer[0]['id'])
    $map.setPaintProperty(layer[0]['id'], 'raster-opacity', layerOpacity / 100)
  }
</script>

<Paper variant="unelevated" square class="mdc-ripple-surface" color="cream" style="padding: 0">
  <div class="control-icons">
    <IconButton
      color="primary"
      on:click={() => {
        tabExpand('Colors')
      }}
      size="mini"
      class="material-icons">palette</IconButton
    >
    <IconButton
      on:click={() => {
        tabExpand('Symbology')
      }}
      size="mini"
      class="material-icons">legend_toggle</IconButton
    >
    <IconButton bind:disabled size="mini" class="material-icons" on:click={() => (disabled = !disabled)}
      >info</IconButton
    >
    <IconButton size="mini" class="material-icons" on:click={() => surface.setOpen(true)}>opacity</IconButton>
    <IconButton size="mini" on:click={() => handleChange()} toggle bind:pressed={selected}>
      <Icon color="primary" class="material-icons" on>visibility</Icon>
      <Icon class="material-icons">visibility_off</Icon>
    </IconButton>
    <IconButton size="mini" class="material-icons" on:click={() => removeLayer()}>delete</IconButton>
  </div>

  <span class="layer-name" on:click={() => (show = !show)}>{lName}</span>
</Paper>

<TabBar class="settings-tab" {tabs} let:tab bind:active />
{#if active === 'Symbology'}
  {#if show}
    Legend
  {/if}
{:else if active === 'Colors'}
  {#if show}
    <Paper style="padding: 0" variant="unelevated">
      <SegmentedButton style="width: 100%" segments={choices} let:segment singleSelect bind:chosen>
        <Segment
          bind:chosen
          style="width: 25%"
          {segment}
          on:click={() => {
            handleUrlChange(segment)
          }}
        >
          {segment}
        </Segment>
      </SegmentedButton>
    </Paper>
  {/if}
{/if}

<MenuSurface style="width: 100%; height: 50px" tab bind:this={surface} anchorCorner="TOP_LEFT">
  <div style="height: 50px; justify-content: space-around">
    <FormField style="display: flex; flex-direction: column-reverse;">
      <input on:change={setLayerOpacity} bind:value={layerOpacity} type="range" min="0" max="100" />
      <span slot="label">Layer Opacity: {layerOpacity}</span>
    </FormField>
  </div>
</MenuSurface>

<style>
  .layer-name {
    text-align: center;
    display: block;
    cursor: pointer;
    font-family: Roboto, serif;
    width: 100%;
    height: auto;
  }

  .control-icons {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
  }
</style>
