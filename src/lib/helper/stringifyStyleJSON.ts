/**
 * Returns a formatted stringified version of json object
 * @param style JSON object
 * @returns string Formatted JSON string
 */
export const stringifyStyleJSON = (style: JSON): string => {
  return JSON.stringify(style, null, 4)
}
