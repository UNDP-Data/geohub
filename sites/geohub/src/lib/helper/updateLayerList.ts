export const updateLayerList = (layer, layerList) => {
  // replace layer in layerList
  const index = layerList.findIndex((l) => l.id === layer.id)
  if (index > -1) {
    layerList[index] = layer
  }
  return layerList
}
