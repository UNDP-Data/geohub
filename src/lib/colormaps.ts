export const sequentialColormaps = [
  'pubu',
  'ylgn',
  'greys',
  'rdpu',
  'pubugn',
  'oranges',
  'gnbu',
  'purples',
  'blues',
  'bugn',
  'reds',
  'ylorbr',
  'ylgnbu',
  'viridis',
  'orrd',
  'greens',
  'bupu',
]

export const divergingColorMaps = ['rdgy', 'spectral', 'puor', 'piyg', 'brbg', 'prgn', 'rdbu', 'rdylbu', 'rdylgn']

export const qualitativeColorMaps = ['accent', 'set1', 'set2', 'set3', 'pastel2', 'pastel1', 'dark2', 'paired']

export enum ColorMapTypes {
  sequential = 'sequential',
  diverging = 'diverging',
  qualitative = 'qualitative',
}

export const ColorMaps = {
  sequential: sequentialColormaps,
  diverging: divergingColorMaps,
  qualitative: qualitativeColorMaps,
}
