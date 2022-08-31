<script lang="ts">
  import { fade } from 'svelte/transition'
  import { clickOutside } from 'svelte-use-click-outside'
  import { v4 as uuidv4 } from 'uuid'
  import type {
    LineLayerSpecification,
    FillLayerSpecification,
    SymbolLayerSpecification,
    HeatmapLayerSpecification,
    VectorSourceSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types.g'
  import { cloneDeep } from 'lodash-es'
  import Autocomplete from '@smui-extra/autocomplete'

  import { LayerTypes } from '$lib/constants'
  import { fetchUrl, getVectorInfo } from '$lib/helper'
  import type { TreeNode } from '$lib/types'
  import { map, layerList, modalVisible } from '$stores'

  export let isModalVisible = false
  export let treeNode: TreeNode

  let layerIdList: string[]
  let layerType = LayerTypes.LINE
  let layerTypes = [LayerTypes.LINE, LayerTypes.FILL, LayerTypes.SYMBOL, LayerTypes.HEATMAP]
  let selectedLayerId: string | undefined = treeNode?.isMartin ? treeNode?.path : treeNode?.label
  let tileSourceId = treeNode?.path

  $: {
    if (isModalVisible && treeNode) {
      setLayerTypeList()
    }
  }

  const setLayerTypeList = () => {
    const vectorLayers = treeNode.metadata.json.vector_layers
    layerIdList = vectorLayers.map((layer) => layer.id)

    if (selectedLayerId && treeNode.metadata) {
      const tilestats = treeNode.metadata.json.tilestats

      if (tilestats) {
        const layer = tilestats.layers.find((layer) => layer.layer == selectedLayerId)

        if (layer) {
          layerType = getLayerTypeFromGeometryType(layer.geometry)

          if (layerType === LayerTypes.LINE) {
            layerTypes = [LayerTypes.LINE]
          } else if (layerType === LayerTypes.FILL) {
            layerTypes = [LayerTypes.LINE, LayerTypes.FILL]
          } else if (layerType === LayerTypes.SYMBOL) {
            layerTypes = [LayerTypes.SYMBOL, LayerTypes.HEATMAP]
          }
        }
      }
    }

    layerTypes.sort((a, b) => a.localeCompare(b))
    layerType = layerTypes[0]
  }

  const getLayerTypeFromGeometryType = (geometryType: string) => {
    if (geometryType.toLowerCase().includes('point') || geometryType.toLowerCase().includes('multipoint'))
      return LayerTypes.SYMBOL

    if (geometryType.toLowerCase().includes('linestring') || geometryType.toLowerCase().includes('multilinestring'))
      return LayerTypes.LINE

    if (geometryType.toLowerCase().includes('polygon') || geometryType.toLowerCase().includes('multipolygon'))
      return LayerTypes.FILL
  }

  let addButtonClicked = false

  const handleAddClick = async () => {
    addButtonClicked = true

    let layerSource: VectorSourceSpecification
    if (!$map.getSource(tileSourceId)) {
      if (treeNode.isMartin) {
        const tilejson = await fetchUrl(treeNode.url)
        // URL of tiles inside tileJSON from martin is http, hence we cannot use tileJSON directly because of CORS issue.
        layerSource = {
          type: LayerTypes.VECTOR,
          scheme: tilejson.scheme,
          tiles: tilejson.tiles.map((url) => url.replace('http', 'https')),
          minzoom: tilejson.minzoom,
          maxzoom: tilejson.maxzoom,
        }
      } else {
        layerSource = {
          type: LayerTypes.VECTOR,
          tiles: [treeNode.url],
          minzoom: treeNode.metadata.minzoom | 0,
          maxzoom: treeNode.metadata.maxzoom | 24,
        }
      }

      if (!(tileSourceId in $map.getStyle().sources)) {
        $map.addSource(tileSourceId, layerSource)
      }
    } else {
      layerSource = JSON.parse(JSON.stringify($map.getStyle().sources[tileSourceId]))
    }

    const layerId = `${selectedLayerId}-${uuidv4()}`
    let layerDefinition:
      | LineLayerSpecification
      | FillLayerSpecification
      | SymbolLayerSpecification
      | HeatmapLayerSpecification
    switch (layerType) {
      case LayerTypes.SYMBOL:
        layerDefinition = {
          id: layerId,
          type: layerType,
          source: tileSourceId,
          'source-layer': selectedLayerId,
          layout: {
            visibility: 'visible',
            'icon-image': 'circle',
            'icon-size': 1,
          },
        }
        break
      case LayerTypes.LINE:
        layerDefinition = {
          id: layerId,
          type: layerType,
          source: tileSourceId,
          'source-layer': selectedLayerId,
          layout: {
            visibility: 'visible',
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': 'rgb(53, 175, 109)',
            'line-width': 0.5,
          },
        }
        break
      case LayerTypes.FILL:
        layerDefinition = {
          id: layerId,
          type: layerType,
          source: tileSourceId,
          'source-layer': selectedLayerId,
          layout: {
            visibility: 'visible',
          },
          paint: {
            'fill-color': 'rgb(20, 180, 60)',
            'fill-outline-color': 'rgb(110, 110, 110)',
            'fill-opacity': 0.6,
          },
        }
        break
      case LayerTypes.HEATMAP:
        layerDefinition = {
          id: layerId,
          type: layerType,
          source: tileSourceId,
          'source-layer': selectedLayerId,
          layout: {
            visibility: 'visible',
          },
          paint: {
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              'rgba(0, 0, 255, 0)',
              0.1,
              'rgb(0,0,255)',
              0.3,
              'rgb(0,255,255)',
              0.5,
              'rgb(0,255,0)',
              0.7,
              'rgb(255,255,0)',
              1,
              'rgb(255,0,0)',
            ],
            'heatmap-intensity': 1,
            'heatmap-opacity': 1,
            'heatmap-radius': 30,
            'heatmap-weight': 1,
          },
        }
        break
      default:
        return
    }

    layerDefinition.minzoom = Number(
      treeNode.metadata.minzoom && treeNode.metadata.minzoom >= 0 ? treeNode.metadata.minzoom : 0,
    )
    layerDefinition.maxzoom = Number(
      treeNode.metadata.maxzoom && treeNode.metadata.maxzoom <= 24 ? treeNode.metadata.maxzoom : 24,
    )

    const layerName = treeNode.isMartin ? treeNode.label : treeNode.path.split('/')[treeNode.path.split('/').length - 2]

    // set vector info stats (number properties)
    const stats = await getVectorInfo(
      treeNode.isMartin
        ? `${treeNode.url.replace('.json', '/0/0/0.pbf')}`
        : `${new URL(treeNode.url).origin}/${layerDefinition.source}0/0/0.pbf`,
      treeNode.isMartin ? treeNode.path : layerName,
    )
    if (stats) {
      treeNode.metadata.stats = stats
      if (treeNode.isMartin) {
        const layer = treeNode.metadata.json.tilestats.layers.find((l) => l.layer === treeNode.path)
        layer.attributeCount = stats.length
        layer.attributes = stats
      }
    }

    $layerList = [
      {
        name: layerName,
        definition: layerDefinition,
        type: LayerTypes.VECTOR,
        info: treeNode.metadata,
        visible: true,
        url: treeNode.url,
        source: layerSource,
      },
      ...$layerList,
    ]

    $map.addLayer(layerDefinition)

    // set layer list features properties to diplay in query panel info
    $map.on('click', layerDefinition.id, function (e) {
      const layer = $layerList.find((layer) => layer.definition.id == layerDefinition.id)
      if (layer) {
        const layerClone = cloneDeep(layer)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        layerClone.features = e.features.length > 0 ? e.features[0].properties : []
        const layerIndex = $layerList.findIndex((layer) => layer.definition.id === layerDefinition.id)
        $layerList[layerIndex] = layerClone
      }
    })

    handleCancel()
  }

  const handleCancel = () => {
    isModalVisible = false
    addButtonClicked = false
    $modalVisible = false
  }

  const getLayerTypeLabel = (layerType: LayerTypes) => {
    switch (layerType) {
      case LayerTypes.LINE:
        return 'Line'
      case LayerTypes.FILL:
        return 'Polygon'
      case LayerTypes.SYMBOL:
        return 'Point'
      case LayerTypes.HEATMAP:
        return 'Heatmap'
      default:
        return layerType
    }
  }

  const handleLayerTypeClick = (type: string) => {
    layerType = type as LayerTypes
  }
</script>

<Keydown paused={!isModalVisible} on:Escape={() => (isModalVisible = false)} />

{#if isModalVisible}
  <div class="modal is-active" data-testid="add-layer-view-container" transition:fade use:clickOutside={handleCancel}>
    <div class="modal-background" />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title has-text-weight-bold">Add Layer</p>
        <button
          class="delete"
          aria-label="close"
          alt="Close Add Layer Button"
          title="Close Add Layer Button"
          on:click={handleCancel} />
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label for="layer-id" class="label">Layer ID</label>
          <div class="control" data-testid="layer-id-input">
            <Autocomplete
              id="Layer ID input"
              combobox
              options={layerIdList}
              bind:value={selectedLayerId}
              textfield$variant="outlined"
              textfield$style="height: 32px; width: 250px;" />
          </div>
        </div>
        <div class="field layer-type">
          <label class="label" for="layer-types">Layer Types</label>
          {#each layerTypes as selectLayerType}
            {@const layerTypeLabel = getLayerTypeLabel(selectLayerType)}
            <div class="control" style="margin-top: 5px;">
              <label class="radio" for="layer-type">
                <div class="columns is-gapless is-vcentered layer-type">
                  <div class="column">
                    <input
                      type="radio"
                      name="layer-type"
                      bind:group={layerType}
                      value={selectLayerType}
                      alt={`${layerTypeLabel} Option`}
                      title={`${layerTypeLabel} Option`} />
                  </div>
                  <div class="column layer-type-label" on:click={() => handleLayerTypeClick(selectLayerType)}>
                    {layerTypeLabel}
                  </div>
                </div>
              </label>
            </div>
          {/each}
        </div>
      </section>
      <footer
        class="modal-card-foot is-flex is-flex-direction-row is-justify-content-flex-end"
        style="background: white">
        <div>
          <button
            class="button secondary-button"
            alt="Close Add Layer Button"
            title="Close Layer Button"
            on:click={handleCancel}>
            Cancel
          </button>
          <button
            class="button primary-button"
            role="button"
            disabled={addButtonClicked || (selectedLayerId.length === 0 ? true : false)}
            alt="Add Layer Button"
            title="Add Layer Button"
            on:click={handleAddClick}>
            Add
          </button>
        </div>
      </footer>
    </div>
  </div>
{/if}

<style lang="scss">
  @import '../src/styles/undp-design/base-minimal.min';
  @import '../src/styles/undp-design/radio.min';
  @import '../src/styles/undp-design/buttons.min';
  @import '../src/styles/undp-design/fonts';

  .modal {
    .modal-card {
      width: 450px;

      .layer-type {
        .control {
          margin-top: 5px;
        }

        .layer-type-label {
          cursor: pointer;
          margin-bottom: 3px;
          margin-left: 10px;
        }
      }
    }
  }
</style>
