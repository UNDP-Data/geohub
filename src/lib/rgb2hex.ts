export const rgb2hex = (rgbColor: string): string => {
  const rgbText = rgbColor.replace('rgb(', '').replace(')', '').replace(' ', '').split(',')
  const rgbValues = []
  rgbText.forEach((val) => {
    rgbValues.push(Number(val.trim()))
  })
  const hex = '#' + ((1 << 24) + (rgbValues[0] << 16) + (rgbValues[1] << 8) + rgbValues[2]).toString(16).slice(1)
  return hex
}
