export const FooterItems: { [key: string]: { title: string; url: string }[] } = {
  GeoHub: [
    {
      title: 'GeoHub',
      url: '/',
    },
    {
      title: 'Shared Maps',
      url: '/maps',
    },
    {
      title: 'My datasets',
      url: '/data',
    },
    {
      title: 'User Guide',
      url: 'https://docs.undpgeohub.org',
    },
  ],
  Dashboard: [
    {
      title: 'Dashboards',
      url: '/dashboards',
    },
    {
      title: 'Electricity Dashboard',
      url: '/dashboard/electricity',
    },
  ],
  'For Developers': [
    {
      title: 'Github Repo',
      url: 'https://github.com/UNDP-Data/geohub',
    },
    {
      title: 'GeoHub API documentation',
      url: '/api',
    },
    {
      title: 'Svelte UNDP design sytem',
      url: 'https://svelte-undp-design.undpgeohub.org',
    },
  ],
}
