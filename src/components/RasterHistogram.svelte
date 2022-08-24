<script lang="ts">
  import { VegaLite } from 'svelte-vega'
  import { onMount } from 'svelte'
  import { TITILER_API_ENDPOINT } from '../lib/constants'
  import { fetchUrl } from '../lib/helper'
  import { map } from '../stores'
  import type {
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
    const statsURL = `${TITILER_API_ENDPOINT}/statistics?url=${layerURL.searchParams.get('url')}`
    let layerStats
    const band = info.active_band_no
    // if(layerURL.searchParams.get('expression')){
    //   layerStats = await fetchUrl(`${statsURL}&expression=${layerURL.searchParams.get('expression')}`)
    //   console.log(layerStats)
    //   if(layerURL.searchParams.get('expression')[-1] === ';'){
    //     band = layerURL.searchParams.get('expression').slice(0,-1)
    //   }else{
    //     band = layerURL.searchParams.get('expression')
    //   }
    // }else{
    //   layerStats = await fetchUrl(statsURL)
    //   band = info.active_band_no
    // }
    layerStats = await fetchUrl(statsURL)
    const counts = layerStats[band]['histogram'][0]
    const sum = counts.reduce((a, b) => a + b, 0)
    const probability = counts.map((item) => item / sum)
    const interval = layerStats[band]['histogram'][1]

    for (let i = 0; i < interval.length - 1; i++) {
      interval[i] = (interval[i] + interval[i + 1]) * 0.5
    }

    counts.unshift(0)
    counts.push(0)
    if (probability[0] > 0) {
      probability.unshift(0)
    }
    if (probability[probability.length - 1] < 1) {
      probability.push(0)
    }

    interval.slice(1).map((item, index) => {
      table.push({
        interval: Number(item.toFixed(2)),
        probability: Number(probability[index].toFixed(2)),
        counts: Number(counts[index].toFixed(2)),
      })
    })

    data = { table: table }
  })

  let viewVL
  let specVL = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    padding: 0,
    width: 200,
    height: 120,
    title: 'Probability and Counts Graph of Layer',
    background: null,
    view: { stroke: 'transparent' },
    data: {
      name: 'table',
    },
    mark: {
      name: 'marks',
      type: 'bar',
    },
    encoding: {
      x: {
        axis: {
          orient: 'bottom',
          grid: false,
          gridWidth: 0,
          titleColor: '#000000',
          ticks: true,
          labelFontStyle: 'ProximaNova, Sans Serif',
          titleFontStyle: 'ProximaNova, Sans Serif',
        },
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
        mark: { opacity: 1, type: 'line', color: '#f55c5c', interpolate: 'cardinal' },
        encoding: {
          y: {
            aggregate: 'max',
            field: 'probability',
            title: 'Probability',
            axis: { titleColor: '#f55c5c', orient: 'right' },
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
    padding: 0;
    max-width: 240px;
    margin: 0 auto;
  }
  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
