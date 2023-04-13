/**
 * Remove underscore and extension and apply start/title case to a string
 * @param val String to clean
 */
export const clean = (val: string) => {
  // apply start/title case
  return decodeURIComponent(
    val // decodeURIComponent to handle special characters like %20, %2F, etc.
      .replace(/[_-]/g, ' ') // remove underscore and hyphen
      .replace(/\.[^/.]+$/, '') // remove extension
      .replace(/\b\w/g, (str) => str.toUpperCase()),
    // apply start/title case
  )
}
