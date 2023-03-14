import type { Breadcrumb } from '@undp-data/svelte-undp-design'

export const DataCategories: Breadcrumb[] = [
  {
    name: 'SDG',
    icon: 'assets/sdgs/SDG Wheel_WEB.png',
    url: '/api/tags?key=sdg_goal',
  },
  {
    name: 'Continent',
    icon: 'fa-solid fa-globe',
    url: '/api/continents?filterbytag=true',
  },
  {
    name: 'UNDP',
    icon: 'assets/undp-images/undp-logo.png',
    url: '/api/datasets?provider=undp',
  },
  {
    name: 'Microsoft Planetary',
    icon: 'assets/microsoft.png',
    url: '/api/datasets?stac=microsoft-pc',
  },
  {
    name: 'Dynamic vector data',
    icon: 'assets/postgresql.png',
    url: '/api/datasets?type=pgtileserv',
  },
  {
    name: 'Favourite',
    icon: 'assets/star.png',
    url: '/api/datasets?staronly=true',
  },
  {
    name: 'My data',
    icon: 'fa-solid fa-circle-user',
    url: '/api/datasets?mydata=true',
  },
]
