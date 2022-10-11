export const paramsToQueryString = (params: Record<string, unknown>) => {
  return Object.keys(params)
    .map((key) => key + '=' + params[key])
    .join('&')
}
