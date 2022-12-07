import { SequentialColormaps } from '$lib/colormaps'

/**
 * choose default colormap randomly
 * @returns colormap name
 */
export const getRandomColormap = () => {
  return SequentialColormaps[Math.floor(Math.random() * SequentialColormaps.length)]
}
