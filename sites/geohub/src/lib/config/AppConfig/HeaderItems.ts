import type { HeaderLink } from '@undp-data/svelte-undp-design'

type LineName = 'home' | 'maps' | 'dashboard' | 'userguide' | 'data'

export const HeaderItems = (linkNames: LineName[]) => {
  const links: { [key: string]: HeaderLink } = {
    home: {
      id: 'header-link-home',
      title: 'GeoHub home',
      href: '/',
      icon: 'fa-solid fa-home pr-1',
    },
    maps: {
      id: 'header-link-maps',
      title: 'Explore shared maps',
      href: '/maps',
      icon: 'fa-solid fa-map pr-1',
    },
    dashboard: {
      id: 'header-link-dashboard',
      title: 'Go to dashboards',
      href: '/dashboards',
      icon: 'fa-solid fa-chalkboard-user pr-1',
    },
    userguide: {
      id: 'header-link-documentation',
      title: 'User guide',
      href: 'https://docs.undpgeohub.org',
      icon: 'fa-regular fa-circle-question pr-1',
    },
    data: {
      id: 'header-link-data',
      title: 'My data',
      href: '/Data',
      icon: 'fa-solid fa-database pr-1',
    },
  }

  return linkNames.map((name) => links[name])
}
