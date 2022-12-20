/**
 * Get URL with base 64 encoded signature
 * @param url url with signature
 * @returns url after base 64 encoded signature
 */
export const getBase64EncodedUrl = (url: string) => {
  const [base, sign] = url.split('?')
  return `${base}?${btoa(sign)}`
}
