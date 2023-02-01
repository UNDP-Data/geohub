import type { PageServerLoad } from './$types'
import { getMapStats } from '$lib/server/helpers'

export const load: PageServerLoad = async () => {
  const map_stats = await getMapStats()
  const data = {
    stats: map_stats,
  }
  return data
}
