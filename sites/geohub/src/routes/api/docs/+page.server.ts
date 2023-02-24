import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const swagger = `/swagger.yaml`
  return {
    swagger,
  }
}
