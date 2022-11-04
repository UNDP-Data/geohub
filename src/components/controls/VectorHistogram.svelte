<script lang="ts">
  import { VegaLite } from 'svelte-vega'
  import { onMount } from 'svelte'

  export let histogram
  export let propertySelected

  const generateSpec = (propertySelected) => {
    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      padding: 0,
      width: 200,
      height: 120,
      title: `Histogram displaying values for ${propertySelected}`,
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
          field: 'bin',
          type: 'nominal',
        },
      },
      layer: [
        {
          mark: { stroke: '#85A9C5', type: 'bar', interpolate: 'cardinal' },
          encoding: {
            y: {
              aggregate: 'average',
              field: 'count',
              title: 'Counts',
              axis: { titleColor: '#85A9C5', orient: 'left' },
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
  }

  let table = []
  let data
  let viewVL
  let specVL = generateSpec(propertySelected)

  const generateDataFromHist = (hist) => {
    const counts = hist.count
    const interval = hist.bins
    table = []
    for (let i = 0; i < counts.length; i++) {
      table = [
        ...table,
        {
          bin: interval[i].toFixed(2),
          count: counts[i].toFixed(2),
        },
      ]
    }
    data = { table: table }
    return data
  }

  onMount(async () => {
    generateDataFromHist(histogram)
    specVL = generateSpec(propertySelected)
  })

  $: propertySelected, (specVL = generateSpec(propertySelected))
  $: propertySelected, (data = generateDataFromHist(histogram))
  $: histogram, generateDataFromHist(histogram)

  const vegaOptions = { actions: false, renderer: 'svg' }
</script>

<main>
  <VegaLite
    bind:view={viewVL}
    spec={specVL}
    {data}
    options={vegaOptions} />
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
