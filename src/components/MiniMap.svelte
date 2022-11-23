<script lang="ts">
  import {
    LngLatBounds,
    Map,
    NavigationControl,
    type FillLayerSpecification,
    type LineLayerSpecification,
    type SymbolLayerSpecification,
    type VectorSourceSpecification,
  } from 'maplibre-gl'
  import {
    DEFAULT_COLORMAP,
    DEFAULT_FILL_COLOR,
    DEFAULT_FILL_OUTLINE_COLOR,
    DEFAULT_LINE_COLOR,
    DEFAULT_LINE_WIDTH,
    styles,
  } from '$lib/constants'
  import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'
  import type {
    RasterTileMetadata,
    StacCollection,
    StacItemFeature,
    StacItemFeatureCollection,
    VectorTileMetadata,
  } from '$lib/types'
  import { getActiveBandIndex, getBase64EncodedUrl, paramsToQueryString } from '$lib/helper'

  export let feature: StacItemFeature
  export let width = '100%'
  export let height = '100%'
  export let isLoadMap = false

  let mapContainer: HTMLDivElement
  let map: Map
  let previewImageUrl: string

  $: if (isLoadMap === true) {
    if (!map) {
      loadMiniMap()
    }
  }
  const loadMiniMap = async () => {
    map = new Map({
      container: mapContainer,
      style: styles[0].uri,
      attributionControl: false,
      // interactive: false,
    })
    map.addControl(
      new NavigationControl({
        showCompass: false,
      }),
      'bottom-right',
    )
    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()

    // console.log(feature)
    map.on('load', async () => {
      const is_raster: boolean = feature.properties.is_raster as unknown as boolean
      const url: string = feature.properties.url

      if (is_raster) {
        const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
          { key: string; value: string },
        ]
        const type = tags?.find((tag) => tag.key === 'stac')
        if (type) {
          previewImageUrl = await addStacPreview(url)
          return
        }
      }

      if (is_raster === true) {
        await addRasterLayer(url)
      } else {
        await addVectorLayer(url)
      }
    })
  }

  const addStacPreview = async (url: string) => {
    const res = await fetch(url.replace('/items', ''))
    const collection: StacCollection = await res.json()
    let previewImage = collection.assets?.thumbnail?.href
    if (previewImage) {
      return previewImage
    }
    const resItems = await fetch(`${url}?limit=1`)
    const fc: StacItemFeatureCollection = await resItems.json()
    previewImage = fc.features[0].assets.thumbnail?.href
    return previewImage
  }

  const addRasterLayer = async (url: string) => {
    const b64EncodedUrl = getBase64EncodedUrl(url)
    const rasterInfo = await getRasterInfo(b64EncodedUrl)
    const bandIndex = getActiveBandIndex(rasterInfo)
    const layerBandMetadataMin = rasterInfo.band_metadata[bandIndex][1]['STATISTICS_MINIMUM']
    const layerBandMetadataMax = rasterInfo.band_metadata[bandIndex][1]['STATISTICS_MAXIMUM']

    const titilerApiUrlParams = {
      scale: 1,
      TileMatrixSetId: 'WebMercatorQuad',
      url: b64EncodedUrl,
      bidx: bandIndex + 1,
      unscale: false,
      resampling: 'nearest',
      rescale: `${layerBandMetadataMin},${layerBandMetadataMax}`,
      return_mask: true,
      colormap_name: DEFAULT_COLORMAP,
    }
    const tileUrl = `${PUBLIC_TITILER_ENDPOINT}/tiles/{z}/{x}/{y}.png?${paramsToQueryString(titilerApiUrlParams)}`
    // const tilejson = await getTileJson(tilejsonUrl)

    map.addSource(feature.properties.id, {
      type: 'raster',
      tiles: [tileUrl],
      tileSize: 256,
      minzoom: rasterInfo.minzoom | 0,
      maxzoom: rasterInfo.maxzoom | 22,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      bounds: rasterInfo['bounds'],
    })

    map.addLayer({
      id: feature.properties.id,
      type: 'raster',
      source: feature.properties.id,
      layout: {
        visibility: 'visible',
      },
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    map.fitBounds(rasterInfo.bounds)
  }

  const getRasterInfo = async (url: string) => {
    const res = await fetch(`${PUBLIC_TITILER_ENDPOINT}/info?url=${url}`)
    const json: RasterTileMetadata = await res.json()
    return json
  }

  const addVectorLayer = async (url: string) => {
    const vectorInfo = await getVectorInfo(url)

    const tileSourceId = feature.properties.id
    const selectedLayerId = vectorInfo.metadata.json.vector_layers[0].id

    let layerSource: VectorSourceSpecification
    if (vectorInfo.type) {
      layerSource = {
        type: 'vector',
        url: vectorInfo.url.replace('metadata.json', 'tile.json'),
      }
    } else {
      layerSource = {
        type: 'vector',
        tiles: [url],
        minzoom: vectorInfo.metadata.minzoom | 0,
        maxzoom: vectorInfo.metadata.maxzoom | 24,
      }
    }
    map.addSource(tileSourceId, layerSource)

    const layerId = `${selectedLayerId}`
    let layerDefinition: LineLayerSpecification | FillLayerSpecification | SymbolLayerSpecification

    const geomType = vectorInfo.metadata.json.tilestats.layers[0].geometry
    switch (geomType.toLocaleLowerCase()) {
      case 'point':
      case 'multipoint':
        layerDefinition = {
          id: layerId,
          type: 'symbol',
          source: tileSourceId,
          'source-layer': selectedLayerId,
          layout: {
            visibility: 'visible',
            'icon-image': 'circle',
            'icon-size': 1,
          },
        }
        break
      case 'linestring':
      case 'multilinestring':
        layerDefinition = {
          id: layerId,
          type: 'line',
          source: tileSourceId,
          'source-layer': selectedLayerId,
          layout: {
            visibility: 'visible',
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': DEFAULT_LINE_COLOR,
            'line-width': DEFAULT_LINE_WIDTH,
          },
        }
        break
      case 'polygon':
      case 'multipolygon':
        layerDefinition = {
          id: layerId,
          type: 'fill',
          source: tileSourceId,
          'source-layer': selectedLayerId,
          layout: {
            visibility: 'visible',
          },
          paint: {
            'fill-color': DEFAULT_FILL_COLOR,
            'fill-outline-color': DEFAULT_FILL_OUTLINE_COLOR,
            'fill-opacity': 0.6,
          },
        }
        break
      default:
        return
    }
    map.addLayer(layerDefinition)
    const bounds = vectorInfo.metadata.bounds.split(',').map((val) => Number(val))
    map.fitBounds(new LngLatBounds([bounds[0], bounds[1]], [bounds[2], bounds[3]]))
  }

  const getVectorInfo = async (url: string) => {
    const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
      { key: string; value: string },
    ]
    const type = tags?.find((tag) => tag.key === 'type')
    let metadataUrl: string
    if (type && ['martin', 'pgtileserv'].includes(type.value)) {
      // dynamic
      if (type.value === 'pgtileserv') {
        const layertype = tags?.find((tag) => tag.key === 'layertype')
        metadataUrl = `/${type.value}/${layertype.value}/${feature.properties.name}/metadata.json`
      } else {
        metadataUrl = `/${type.value}/${feature.properties.name}/metadata.json`
      }
    } else {
      // static
      const layerURL = new URL(url.replace('/{z}/{x}/{y}', '/0/0/0'))
      const pbfpath = `${layerURL.origin}${decodeURIComponent(layerURL.pathname)}${layerURL.search}`
      metadataUrl = `/azstorage/metadata.json?pbfpath=${encodeURI(pbfpath)}`
    }
    const res = await fetch(metadataUrl)
    const data: VectorTileMetadata = await res.json()
    return {
      metadata: data,
      type: type,
      url: metadataUrl,
    }
  }
</script>

{#if !previewImageUrl}
  <div
    class="map"
    style="width:{width}; height:{height}"
    bind:this={mapContainer} />
{:else}
  <!-- svelte-ignore a11y-missing-attribute -->
  <img
    src={previewImageUrl}
    style="width:{width}" />
{/if}

<style lang="scss">
  .map {
    padding: 0;
    margin: 0;
    border: 1px solid gray;
  }
</style>
