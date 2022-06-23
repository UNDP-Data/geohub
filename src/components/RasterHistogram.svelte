<script lang="ts">
  import { VegaLite } from 'svelte-vega'
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
      table.push({
        interval: Number(item.toFixed(2)),
        probability: Number(probability[index].toFixed(2)),
        counts: Number(counts[index].toFixed(2)),
      })
    })

    data = { table: table }
    console.log(data)
  })

  let viewVL
  let specVL = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    padding: 6,
    width: 250,
    height: 120,
    background: null,
    view: { stroke: 'transparent' },
    data: {
      name: 'table',
    },
    mark: {
      name: 'marks',
      type: 'bar',
      // fill: {"value": "steelblue"}
    },
    encoding: {
      x: {
        axis: { orient: 'bottom', grid: false, gridWidth: 0, titleColor: '#85A9C5' },
        field: 'interval',
        type: 'nominal',
      },
    },
    layer: [
      {
        mark: { stroke: '#85A9C5', type: 'bar' },
        encoding: {
          y: {
            aggregate: 'average',
            field: 'counts',
            title: 'Counts',
            axis: { titleColor: '#85A9C5', orient: 'left' },
          },
        },
      },
      {
        mark: { opacity: 1, type: 'line', color: '#85C5A6' },
        encoding: {
          y: {
            aggregate: 'max',
            field: 'probability',
            title: 'Probability',
            axis: { titleColor: '#85C5A6', orient: 'right' },
          },
        },
      },
    ],

    resolve: { scale: { y: 'independent' } },
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
  }

  const vegaOptions = { actions: false, renderer: 'svg' }
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
