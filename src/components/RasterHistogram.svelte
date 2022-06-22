<script lang="ts">
  import { VegaLite } from 'svelte-vega'
  import { View } from 'svelte-vega'
  import type VisualizationSpec from 'svelte-vega'
  import { onMount } from 'svelte'
  import { TITILER_API_ENDPOINT } from '../lib/constants'
  import { fetchUrl } from '../lib/helper'
  import { map } from '../stores'
  import {
    FillLayerSpecification,
    HeatmapLayerSpecification,
    LineLayerSpecification,
    RasterLayerSpecification,
    SymbolLayerSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types.g'

  export let layer

  let definition:
    | RasterLayerSpecification
    | FillLayerSpecification
    | LineLayerSpecification
    | SymbolLayerSpecification
    | HeatmapLayerSpecification
  let info
  ;({ definition, info } = layer)
  const layerSrc = $map.getSource(definition.source)
  const layerURL = new URL(layerSrc.tiles[0])
  const table = []
  let data

  onMount(async () => {
    const statsURL = `${TITILER_API_ENDPOINT}/statistics?url=${layerURL.searchParams.get('url')}&histogram_interval=20`
    const layerStats = await fetchUrl(statsURL)
    const band = Object.keys(layerStats)[0]
    const counts = layerStats[band]['histogram'][0]
    const sum = counts.reduce((a, b) => a + b, 0)
    const probability = counts.map((item) => item / sum)
    const interval = layerStats[band]['histogram'][1]

    const maxFromBins = Math.max(...interval)
    const minFromBins = Math.min(...interval)
    const rangeFromBins = maxFromBins - minFromBins

    counts.unshift(0)
    counts.push(0)
    if (probability[0] > 0) {
      probability.unshift(0)
    }
    if (probability[probability.length - 1] < 1) {
      probability.push(0)
    }

    interval.unshift(interval[0] - 0.1 * rangeFromBins)
    interval.push(1.1 * rangeFromBins)

    interval.slice(1).map((item, index) => {
      table.push({ interval: Number(item.toFixed(2)), probability: Number(probability[index].toFixed(2)) })
    })

    data = { table: table }
  })

  let viewVL: View
  let specVL: VisualizationSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    padding: 6,
    width: 250,
    height: 120,
    data: {
      name: 'table',
    },
    mark: {
      name: 'marks',
      type: 'area',
    },
    encoding: {
      x: { field: 'interval', type: 'nominal' },
      y: { field: 'probability', type: 'quantitative' },
    },
    scales: [
      {
        name: 'y',
        type: 'linear',
      },
      {
        name: 'x',
        type: 'point',
      },
    ],
    axes: [
      {
        scale: 'y',
        orient: 'right',
        zindex: 0,
      },
      {
        scale: 'x',
        orient: 'bottom',
        zindex: 0,
      },
    ],
  }

  const vegaOptions = { actions: true, renderer: 'svg' }
</script>

<main>
  <VegaLite {data} spec={specVL} bind:view={viewVL} options={vegaOptions} />
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }
  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
